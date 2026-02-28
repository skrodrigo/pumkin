import { Hono } from 'hono';
import type Stripe from 'stripe';
import { stripe } from './../common/stripe.js';
import { env } from './../common/env.js';
import { stripeService } from './../services/stripe.service.js';

const webhookRouter = new Hono();

webhookRouter.post('/stripe', async (c) => {
  const sig = c.req.header('stripe-signature');
  if (!sig) return c.text('Missing stripe-signature', 400);

  const rawBody = await c.req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[stripe-webhook] Invalid signature', { err });
    return c.text('Invalid signature', 400);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
    const subObj = typeof session.subscription === 'string' ? null : session.subscription;
    const hasExpandedCustomer = !!subObj && typeof subObj.customer !== 'string' && !!subObj.customer;
    if (subId) {
      try {
        if (hasExpandedCustomer) {
          await stripeService.upsertSubscriptionFromStripe(subObj as any);
        } else {
          const sub = await stripe.subscriptions.retrieve(subId, { expand: ['customer', 'items.data.price'] });
          await stripeService.upsertSubscriptionFromStripe(sub);
        }
      } catch (err) {
        console.error('[stripe-webhook] Failed processing checkout.session.completed', {
          eventId: event.id,
          subId,
          err,
        });
        return c.json({ received: true, ok: false }, 200);
      }
    } else {
      console.warn('[stripe-webhook] checkout.session.completed without subscription id', {
        eventId: event.id,
        sessionId: session.id,
      });
    }
  }

  if (event.type === 'invoice.paid' || event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionRaw = (invoice as any)?.subscription;
    const subId =
      typeof subscriptionRaw === 'string'
        ? subscriptionRaw
        : typeof subscriptionRaw?.id === 'string'
          ? subscriptionRaw.id
          : null;

    if (subId) {
      try {
        const sub = await stripe.subscriptions.retrieve(subId, {
          expand: ['customer', 'items.data.price'],
        });
        await stripeService.upsertSubscriptionFromStripe(sub);
      } catch (err) {
        console.error('[stripe-webhook] Failed processing invoice.*', {
          eventId: event.id,
          type: event.type,
          subId,
          err,
        });
        return c.json({ received: true, ok: false }, 200);
      }
    }
  }

  if (event.type === 'customer.deleted') {
    const customer = event.data.object as Stripe.Customer;
    try {
      await stripeService.handleCustomerDeleted(customer.id);
    } catch (err) {
      console.error('[stripe-webhook] Failed processing customer.deleted', {
        eventId: event.id,
        customerId: customer.id,
        err,
      });
      return c.json({ received: true, ok: false }, 200);
    }
  }

  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const subEvent = event.data.object as Stripe.Subscription;
    const subId = typeof subEvent.id === 'string' ? subEvent.id : null;
    if (subId) {
      try {
        const hasExpandedCustomer = typeof subEvent.customer !== 'string' && !!subEvent.customer;
        if (hasExpandedCustomer) {
          await stripeService.upsertSubscriptionFromStripe(subEvent);
        } else {
          const sub = await stripe.subscriptions.retrieve(subId, {
            expand: ['customer', 'items.data.price'],
          });
          await stripeService.upsertSubscriptionFromStripe(sub);
        }
      } catch (err) {
        console.error('[stripe-webhook] Failed processing customer.subscription.*', {
          eventId: event.id,
          type: event.type,
          subId,
          err,
        });
        return c.json({ received: true, ok: false }, 200);
      }
    }
  }

  return c.json({ received: true }, 200);
});

export default webhookRouter;

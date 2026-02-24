import type Stripe from 'stripe';
import { stripe } from './../common/stripe.js';
import { prisma } from './../common/prisma.js';
import { env } from './../common/env.js';

function getWebUrl() {
  return env.WEB_URL.replace(/\/$/, '');
}

export type StripePlan = 'pro_monthly' | 'pro_yearly';

function getPriceIdForPlan(plan: StripePlan) {
  if (plan === 'pro_monthly') return env.STRIPE_PRICE_PRO_MONTHLY;
  if (plan === 'pro_yearly') {
    if (!env.STRIPE_PRICE_PRO_YEARLY) throw new Error('Missing STRIPE_PRICE_PRO_YEARLY');
    return env.STRIPE_PRICE_PRO_YEARLY;
  }
  throw new Error('Invalid plan');
}

export const stripeService = {
  async getOrCreateCustomerForUser(userId: string, requestId?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        stripeCustomerId: true,
      },
    });
    if (!user) throw new Error('User not found');

    if (user.stripeCustomerId) {
      try {
        const existing = await stripe.customers.retrieve(user.stripeCustomerId);
        if (existing && !('deleted' in existing)) {
          return { customerId: user.stripeCustomerId };
        }
      } catch {
        await prisma.user.updateMany({
          where: { id: user.id, stripeCustomerId: user.stripeCustomerId },
          data: { stripeCustomerId: null },
        });
      }
    }

    const customer = await stripe.customers.create(
      {
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      },
      requestId
        ? {
          idempotencyKey: `customer:${user.id}:${requestId}`,
        }
        : undefined,
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
    });

    return { customerId: customer.id };
  },

  async getProPrices() {
    let monthly: Stripe.Price | null = null;
    try {
      monthly = await stripe.prices.retrieve(env.STRIPE_PRICE_PRO_MONTHLY);
    } catch {
      monthly = null;
    }

    const yearlyId = env.STRIPE_PRICE_PRO_YEARLY ?? null;
    let yearly: Stripe.Price | null = null;
    if (yearlyId) {
      try {
        yearly = await stripe.prices.retrieve(yearlyId);
      } catch {
        yearly = null;
      }
    }

    return {
      pro_monthly: monthly
        ? {
          id: monthly.id,
          currency: monthly.currency,
          unitAmount: monthly.unit_amount,
          recurring: monthly.recurring,
        }
        : null,
      pro_yearly: yearly
        ? {
          id: yearly.id,
          currency: yearly.currency,
          unitAmount: yearly.unit_amount,
          recurring: yearly.recurring,
        }
        : null,
    };
  },

  async createSubscriptionIntent(params: {
    userId: string
    plan: StripePlan
    requestId?: string
  }) {
    const { customerId } = await this.getOrCreateCustomerForUser(params.userId, params.requestId);
    const priceId = getPriceIdForPlan(params.plan);

    try {
      await stripe.prices.retrieve(priceId);
    } catch {
      throw new Error(`Invalid Stripe price for plan: ${params.plan} (${priceId})`);
    }

    const subscription = await stripe.subscriptions.create(
      {
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        metadata: { userId: params.userId, plan: params.plan },
        expand: ['latest_invoice.payment_intent', 'latest_invoice.confirmation_secret', 'pending_setup_intent'],
      },
      params.requestId
        ? {
          idempotencyKey: `sub_intent:${params.userId}:${params.plan}:${params.requestId}`,
        }
        : undefined,
    );

    const setupIntent =
      subscription.pending_setup_intent && typeof subscription.pending_setup_intent !== 'string'
        ? subscription.pending_setup_intent
        : null;

    if (setupIntent?.client_secret) {
      return {
        subscriptionId: subscription.id,
        intentType: 'setup' as const,
        clientSecret: setupIntent.client_secret,
      };
    }

    const latestInvoice =
      subscription.latest_invoice && typeof subscription.latest_invoice !== 'string'
        ? subscription.latest_invoice
        : null;

    const confirmationSecretRaw = (latestInvoice as any)?.confirmation_secret;
    const confirmationSecret =
      confirmationSecretRaw && typeof confirmationSecretRaw !== 'string' ? confirmationSecretRaw : null;

    if (confirmationSecret?.client_secret) {
      return {
        subscriptionId: subscription.id,
        intentType: 'payment' as const,
        clientSecret: confirmationSecret.client_secret,
      };
    }

    const paymentIntentRaw = (latestInvoice as any)?.payment_intent;
    const paymentIntent = paymentIntentRaw && typeof paymentIntentRaw !== 'string' ? paymentIntentRaw : null;

    if (!paymentIntent?.client_secret) {
      throw new Error('Missing payment intent client secret');
    }

    return {
      subscriptionId: subscription.id,
      intentType: 'payment' as const,
      clientSecret: paymentIntent.client_secret,
    };
  },

  async createSubscriptionCheckoutSession(params: { userId: string; plan: StripePlan }) {
    const { customerId } = await this.getOrCreateCustomerForUser(params.userId);

    const priceId = getPriceIdForPlan(params.plan);

    try {
      await stripe.prices.retrieve(priceId);
    } catch {
      throw new Error(`Invalid Stripe price for plan: ${params.plan} (${priceId})`);
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${getWebUrl()}/chat?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getWebUrl()}/chat?checkout=cancel`,
      subscription_data: {
        metadata: { userId: params.userId, plan: params.plan },
      },
      metadata: { userId: params.userId, plan: params.plan },
    });

    if (!session.url) throw new Error('Stripe Checkout session missing url');

    return {
      id: session.id,
      url: session.url,
    };
  },

  async createBillingPortalSession(params: { userId: string }) {
    const { customerId } = await this.getOrCreateCustomerForUser(params.userId);

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${getWebUrl()}/chat`,
    });

    return { url: session.url };
  },

  async cancelSubscription(params: { userId: string }) {
    const sub = await prisma.subscription.findFirst({
      where: { referenceId: params.userId, status: 'active' },
      select: { stripeSubscriptionId: true },
    });

    if (!sub?.stripeSubscriptionId) return { success: true };

    const canceled = await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
    const item = canceled.items.data?.[0];

    await prisma.subscription.updateMany({
      where: { referenceId: params.userId, stripeSubscriptionId: canceled.id },
      data: {
        status: canceled.status,
        cancelAtPeriodEnd: canceled.cancel_at_period_end,
        periodStart:
          typeof item?.current_period_start === 'number' ? new Date(item.current_period_start * 1000) : null,
        periodEnd: typeof item?.current_period_end === 'number' ? new Date(item.current_period_end * 1000) : null,
      },
    });

    return { success: true };
  },

  async handleCustomerDeleted(customerId: string) {
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
      select: { id: true },
    });

    await prisma.user.updateMany({
      where: { stripeCustomerId: customerId },
      data: { stripeCustomerId: null },
    });

    await prisma.subscription.deleteMany({
      where: { stripeCustomerId: customerId },
    });

    if (user?.id) {
      await prisma.userUsage.deleteMany({
        where: { userId: user.id },
      });
    }

    return { success: true };
  },

  async upsertSubscriptionFromStripe(sub: Stripe.Subscription) {
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;

    let userId: string | null =
      typeof sub.metadata?.userId === 'string' && sub.metadata.userId ? sub.metadata.userId : null;

    if (!userId && customerId) {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (customer && !('deleted' in customer)) {
          const fromCustomer = customer.metadata?.userId;
          if (typeof fromCustomer === 'string' && fromCustomer) {
            userId = fromCustomer;
          }

          if (userId) {
            await prisma.user.updateMany({
              where: { id: userId, stripeCustomerId: null },
              data: { stripeCustomerId: customerId },
            });
          }
        }
      } catch (err) {
        console.error('[stripe] Failed to retrieve customer for subscription upsert', {
          customerId,
          subId: sub.id,
          err,
        });
      }
    }

    if (!userId) {
      console.warn('[stripe] Missing userId; skipping subscription upsert', {
        subId: sub.id,
        customerId,
        subMetadata: sub.metadata,
      });
      return;
    }

    const item = sub.items.data?.[0];
    const priceId =
      typeof item?.price === 'string'
        ? item.price
        : typeof item?.price?.id === 'string'
          ? item.price.id
          : null;

    await prisma.subscription.upsert({
      where: { id: sub.id },
      update: {
        referenceId: userId,
        stripeCustomerId: customerId ?? null,
        stripeSubscriptionId: sub.id,
        status: sub.status,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        periodStart: typeof item?.current_period_start === 'number' ? new Date(item.current_period_start * 1000) : null,
        periodEnd: typeof item?.current_period_end === 'number' ? new Date(item.current_period_end * 1000) : null,
        plan: priceId ?? 'unknown',
      },
      create: {
        id: sub.id,
        referenceId: userId,
        stripeCustomerId: customerId ?? null,
        stripeSubscriptionId: sub.id,
        status: sub.status,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        periodStart: typeof item?.current_period_start === 'number' ? new Date(item.current_period_start * 1000) : null,
        periodEnd: typeof item?.current_period_end === 'number' ? new Date(item.current_period_end * 1000) : null,
        plan: priceId ?? 'unknown',
      },
    });

    await prisma.userUsage.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        dayCount: 0,
        weekCount: 0,
        monthCount: 0,
        dayWindowStart: new Date(),
        weekWindowStart: new Date(),
        monthWindowStart: new Date(),
      },
    })
  },
};

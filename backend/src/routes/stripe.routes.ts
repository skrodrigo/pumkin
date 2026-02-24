import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import type { AppVariables } from './routes.js';
import { authMiddleware } from './../middlewares/auth.middleware.js';
import { stripeService } from './../services/stripe.service.js';

const stripeRouter = new OpenAPIHono<{ Variables: AppVariables }>();
stripeRouter.use('*', authMiddleware);

const createSubscriptionIntentRoute = createRoute({
  method: 'post',
  path: '/subscription/intent',
  tags: ['Stripe'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            plan: z.enum(['pro_monthly', 'pro_yearly']),
            requestId: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Subscription intent',
      content: {
        'application/json': {
          schema: z.object({
            subscriptionId: z.string(),
            intentType: z.enum(['payment', 'setup']),
            clientSecret: z.string(),
          }),
        },
      },
    },
  },
});

const getPricesRoute = createRoute({
  method: 'get',
  path: '/prices',
  tags: ['Stripe'],
  responses: {
    200: {
      description: 'Stripe prices',
      content: {
        'application/json': {
          schema: z.object({
            pro_monthly: z
              .object({
                id: z.string(),
                currency: z.string(),
                unitAmount: z.number().nullable(),
                recurring: z.any().nullable(),
              })
              .nullable(),
            pro_yearly: z
              .object({
                id: z.string(),
                currency: z.string(),
                unitAmount: z.number().nullable(),
                recurring: z.any().nullable(),
              })
              .nullable(),
          }),
        },
      },
    },
  },
});

const createCheckoutRoute = createRoute({
  method: 'post',
  path: '/checkout',
  tags: ['Stripe'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            plan: z.enum(['pro_monthly', 'pro_yearly']),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Checkout session',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            url: z.url(),
          }),
        },
      },
    },
  },
});

const portalRoute = createRoute({
  method: 'post',
  path: '/portal',
  tags: ['Stripe'],
  responses: {
    200: {
      description: 'Billing portal session',
      content: {
        'application/json': {
          schema: z.object({
            url: z.url(),
          }),
        },
      },
    },
  },
});

const cancelRoute = createRoute({
  method: 'post',
  path: '/cancel',
  tags: ['Stripe'],
  responses: {
    200: {
      description: 'Canceled',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
          }),
        },
      },
    },
  },
});

stripeRouter.openapi(createCheckoutRoute, async (c) => {
  const user = c.get('user') as { id: string };
  const { plan } = c.req.valid('json') as { plan: 'pro_monthly' | 'pro_yearly' };
  return c.json(await stripeService.createSubscriptionCheckoutSession({ userId: user.id, plan }), 200);
});

stripeRouter.openapi(createSubscriptionIntentRoute, async (c) => {
  const user = c.get('user') as { id: string };
  const { plan, requestId } = c.req.valid('json') as {
    plan: 'pro_monthly' | 'pro_yearly'
    requestId?: string
  }
  return c.json(
    await stripeService.createSubscriptionIntent({
      userId: user.id,
      plan,
      requestId,
    }),
    200,
  )
});

stripeRouter.openapi(getPricesRoute, async (c) => {
  return c.json(await stripeService.getProPrices(), 200);
});

stripeRouter.openapi(portalRoute, async (c) => {
  const user = c.get('user') as { id: string };
  return c.json(await stripeService.createBillingPortalSession({ userId: user.id }), 200);
});

stripeRouter.openapi(cancelRoute, async (c) => {
  const user = c.get('user') as { id: string };
  return c.json(await stripeService.cancelSubscription({ userId: user.id }), 200);
});

export default stripeRouter;

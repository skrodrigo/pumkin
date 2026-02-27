import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppVariables } from './routes.js'
import { authMiddleware } from './../middlewares/auth.middleware.js'
import { prisma } from './../common/prisma.js'
import { stripe } from './../common/stripe.js'

const accountRouter = new OpenAPIHono<{ Variables: AppVariables }>()
accountRouter.use('*', authMiddleware)

const deleteRoute = createRoute({
	method: 'delete',
	path: '/',
	tags: ['Account'],
	responses: {
		200: {
			description: 'Deleted',
			content: {
				'application/json': {
					schema: z.object({ success: z.boolean() }),
				},
			},
		},
	},
})

accountRouter.openapi(deleteRoute, async (c) => {
	const authUser = c.get('user')
	const userId = authUser!.id

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, stripeCustomerId: true },
	})

	const stripeCustomerId = user?.stripeCustomerId ?? null

	if (stripeCustomerId) {
		const subscription = await prisma.subscription.findFirst({
			where: {
				referenceId: userId,
				stripeSubscriptionId: { not: null },
				status: { in: ['active', 'trialing', 'past_due', 'incomplete'] },
			},
			select: { stripeSubscriptionId: true },
		})

		const stripeSubscriptionId = subscription?.stripeSubscriptionId ?? null
		if (stripeSubscriptionId) {
			try {
				await stripe.subscriptions.cancel(stripeSubscriptionId)
			} catch {
			}
		}

		try {
			await stripe.customers.del(stripeCustomerId)
		} catch {
		}
	}

	await prisma.subscription.deleteMany({
		where: {
			OR: [
				{ referenceId: userId },
				...(stripeCustomerId ? [{ stripeCustomerId }] : []),
			],
		},
	})

	await prisma.user.delete({ where: { id: userId } })

	return c.json({ success: true }, 200)
})

export default accountRouter

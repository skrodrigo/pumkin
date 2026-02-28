import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppVariables } from './routes.js'
import { authMiddleware } from './../middlewares/auth.middleware.js'
import { prisma } from './../common/prisma.js'
import { stripe } from './../common/stripe.js'

const accountRouter = new OpenAPIHono<{ Variables: AppVariables }>()
accountRouter.use('*', authMiddleware)

const profileSchema = z.object({
	name: z.string().min(1).max(80).optional(),
	occupation: z.string().min(1).max(80).nullable().optional(),
	aiInstructions: z.string().min(1).max(4000).nullable().optional(),
	bio: z.string().min(1).max(1000).nullable().optional(),
})

const getProfileRoute = createRoute({
	method: 'get',
	path: '/profile',
	tags: ['Account'],
	responses: {
		200: {
			description: 'Profile',
			content: {
				'application/json': {
					schema: z.object({
						success: z.boolean(),
						data: profileSchema.extend({ name: z.string().min(1) }),
					}),
				},
			},
		},
		404: { description: 'Not found' },
	},
})

const patchProfileRoute = createRoute({
	method: 'patch',
	path: '/profile',
	tags: ['Account'],
	request: {
		body: {
			content: {
				'application/json': {
					schema: profileSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Updated',
			content: {
				'application/json': {
					schema: z.object({
						success: z.boolean(),
						data: profileSchema.extend({ name: z.string().min(1) }),
					}),
				},
			},
		},
		404: { description: 'Not found' },
	},
})

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

accountRouter.openapi(getProfileRoute, async (c) => {
	const authUser = c.get('user')
	const userId = authUser!.id

	const user = await prisma.user.findUnique(
		({
			where: { id: userId },
			select: {
				name: true,
				occupation: true,
				aiInstructions: true,
				bio: true,
			},
		} as unknown) as Parameters<typeof prisma.user.findUnique>[0],
	)
	if (!user) return c.json({ success: false, error: 'Not found', statusCode: 404 }, 404)

	return c.json({ success: true, data: user }, 200)
})

accountRouter.openapi(patchProfileRoute, async (c) => {
	const authUser = c.get('user')
	const userId = authUser!.id
	const payload = c.req.valid('json')

	const updated = await prisma.user.update(
		({
			where: { id: userId },
			data: {
				...(typeof payload.name === 'string' ? { name: payload.name.trim() } : {}),
				...(typeof payload.occupation === 'string'
					? { occupation: payload.occupation.trim() }
					: payload.occupation === null
						? { occupation: null }
						: {}),
				...(typeof payload.aiInstructions === 'string'
					? { aiInstructions: payload.aiInstructions.trim() }
					: payload.aiInstructions === null
						? { aiInstructions: null }
						: {}),
				...(typeof payload.bio === 'string'
					? { bio: payload.bio.trim() }
					: payload.bio === null
						? { bio: null }
						: {}),
			},
			select: {
				name: true,
				occupation: true,
				aiInstructions: true,
				bio: true,
			},
		} as unknown) as Parameters<typeof prisma.user.update>[0],
	)

	return c.json({ success: true, data: updated }, 200)
})

accountRouter.openapi(deleteRoute, async (c) => {
	const authUser = c.get('user')
	const userId = authUser!.id

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, stripeCustomerId: true },
	})

	const stripeCustomerId = user?.stripeCustomerId ?? null

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

	if (stripeCustomerId) {
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

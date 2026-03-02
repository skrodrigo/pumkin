import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppVariables } from './routes.js'
import { authMiddleware } from './../middlewares/auth.middleware.js'
import { prisma } from './../common/prisma.js'
import { generateAndStoreImage } from './../services/image-generation.service.js'

const imagesRouter = new OpenAPIHono<{ Variables: AppVariables }>()
imagesRouter.use('*', authMiddleware)

const generateRoute = createRoute({
	method: 'post',
	path: '/generate',
	tags: ['Images'],
	request: {
		body: {
			content: {
				'application/json': {
					schema: z.object({
						chatId: z.string().min(1),
						messageId: z.string().min(1).optional(),
						prompt: z.string().min(1),
						model: z.string().min(1),
						returnBase64Preview: z.boolean().optional(),
					}),
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Generated',
			content: {
				'application/json': {
					schema: z.object({
						success: z.boolean(),
						data: z.object({
							id: z.string(),
							imageUrl: z.string(),
							mediaType: z.string(),
							base64Preview: z.string().optional(),
						}),
					}),
				},
			},
		},
		400: { description: 'Invalid request' },
		401: { description: 'Unauthorized' },
		500: { description: 'Failed to generate image' },
	},
})

imagesRouter.openapi(generateRoute, async (c) => {
	const user = c.get('user')
	const body = c.req.valid('json')

	const data = await generateAndStoreImage({
		chatId: body.chatId,
		messageId: body.messageId ?? null,
		userId: user!.id,
		prompt: body.prompt,
		model: body.model,
		returnBase64Preview: body.returnBase64Preview ?? false,
	})

	return c.json({ success: true, data }, 200)
})

const listRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Images'],
	request: {
		query: z.object({
			chatId: z.string().min(1).optional(),
		}),
	},
	responses: {
		200: {
			description: 'List',
			content: {
				'application/json': {
					schema: z.object({
						success: z.boolean(),
						data: z.array(z.any()),
					}),
				},
			},
		},
		401: { description: 'Unauthorized' },
	},
})

imagesRouter.openapi(listRoute, async (c) => {
	const user = c.get('user')
	const { chatId } = c.req.valid('query')

	const data = await prisma.imageGeneration.findMany({
		where: {
			userId: user!.id,
			...(chatId ? { chatId } : {}),
		},
		orderBy: { createdAt: 'desc' },
	})

	return c.json({ success: true, data }, 200)
})

export default imagesRouter

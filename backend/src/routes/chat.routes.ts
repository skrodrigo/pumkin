import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { handleChatRequestFromApi, handleTemporaryChatRequestFromApi } from './../services/chat.service.js';
import { authMiddleware } from './../middlewares/auth.middleware.js';
import type { AppVariables } from './routes.js';

const chatRouter = new OpenAPIHono<{ Variables: AppVariables }>();

chatRouter.use('*', authMiddleware);

const chatPostRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Chat'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.any(),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Chat stream response',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

const temporaryChatPostRoute = createRoute({
  method: 'post',
  path: '/temporary',
  tags: ['Chat'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.any(),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Temporary chat stream response',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

chatRouter.openapi(chatPostRoute, async (c) => {
  return handleChatRequestFromApi(c);
});

chatRouter.openapi(temporaryChatPostRoute, async (c) => {
  return handleTemporaryChatRequestFromApi(c);
});

export default chatRouter;

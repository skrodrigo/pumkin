import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { authMiddleware } from './../middlewares/auth.middleware.js';
import type { AppVariables } from './routes.js';
import { chatRepository } from './../repositories/chat.repository.js';
import { HTTPException } from 'hono/http-exception';
import crypto from 'node:crypto';

const chatsRouter = new OpenAPIHono<{ Variables: AppVariables }>();
chatsRouter.use('*', authMiddleware);

const listRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Chats'],
  responses: {
    200: { description: 'List chats', content: { 'application/json': { schema: z.any() } } },
  },
});

const pinRoute = createRoute({
  method: 'patch',
  path: '/{id}/pin',
  tags: ['Chats'],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: 'Pinned',
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean() }),
        },
      },
    },
    404: { description: 'Not found' },
  },
});

const unpinRoute = createRoute({
  method: 'patch',
  path: '/{id}/unpin',
  tags: ['Chats'],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: 'Unpinned',
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean() }),
        },
      },
    },
    404: { description: 'Not found' },
  },
});

const renameRoute = createRoute({
  method: 'patch',
  path: '/{id}/rename',
  tags: ['Chats'],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({ title: z.string().min(1).max(120) }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Renamed',
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean() }),
        },
      },
    },
    404: { description: 'Not found' },
  },
});

const getRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Chats'],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Get chat', content: { 'application/json': { schema: z.any() } } },
    404: { description: 'Not found' },
  },
});

const deleteRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Chats'],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Deleted', content: { 'application/json': { schema: z.object({ success: z.boolean() }) } } },
    404: { description: 'Not found' },
  },
});

const shareRoute = createRoute({
  method: 'post',
  path: '/{id}/share',
  tags: ['Chats'],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Shared', content: { 'application/json': { schema: z.any() } } },
    404: { description: 'Not found' },
  },
});

const listArchivedRoute = createRoute({
  method: 'get',
  path: '/archived',
  tags: ['Chats'],
  responses: {
    200: { description: 'List archived chats', content: { 'application/json': { schema: z.any() } } },
  },
});

const archiveRoute = createRoute({
  method: 'patch',
  path: '/{id}/archive',
  tags: ['Chats'],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Archived', content: { 'application/json': { schema: z.object({ success: z.boolean() }) } } },
    404: { description: 'Not found' },
  },
});

const unarchiveRoute = createRoute({
  method: 'patch',
  path: '/{id}/unarchive',
  tags: ['Chats'],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Unarchived', content: { 'application/json': { schema: z.object({ success: z.boolean() }) } } },
    404: { description: 'Not found' },
  },
});

const updateModelRoute = createRoute({
  method: 'patch',
  path: '/{id}/model',
  tags: ['Chats'],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': { schema: z.object({ model: z.string() }) },
      },
    },
  },
  responses: {
    200: { description: 'Model updated', content: { 'application/json': { schema: z.object({ success: z.boolean() }) } } },
    404: { description: 'Not found' },
  },
});

chatsRouter.openapi(listRoute, async (c) => {
  const user = c.get('user');
  const chats = await chatRepository.findManyForUser(user!.id);
  return c.json({ success: true, data: chats }, 200);
});

chatsRouter.openapi(deleteRoute, async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const deleted = await chatRepository.deleteForUser(id, user!.id);
  if (!deleted.count) throw new HTTPException(404, { message: 'Chat not found' });
  return c.json({ success: true }, 200);
});

chatsRouter.openapi(shareRoute, async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();

  const chat = await chatRepository.findShareInfoForUser(id, user!.id);
  if (!chat) throw new HTTPException(404, { message: 'Chat not found' });

  const sharePath = chat.sharePath ?? crypto.randomBytes(6).toString('hex');
  const updated = await chatRepository.markPublic(id, user!.id, sharePath);
  return c.json({ success: true, data: updated }, 200);
});

chatsRouter.openapi(listArchivedRoute, async (c) => {
  const user = c.get('user');
  const chats = await chatRepository.findArchivedForUser(user!.id);
  return c.json({ success: true, data: chats }, 200);
});

chatsRouter.openapi(getRoute, async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const chat = await chatRepository.findByIdForUser(id, user!.id);
  if (!chat) throw new HTTPException(404, { message: 'Chat not found' });
  return c.json({ success: true, data: chat }, 200);
});

chatsRouter.openapi(archiveRoute, async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const updated = await chatRepository.archiveForUser(id, user!.id);
  if (!updated.count) throw new HTTPException(404, { message: 'Chat not found' });
  return c.json({ success: true }, 200);
});

chatsRouter.openapi(unarchiveRoute, async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const updated = await chatRepository.unarchiveForUser(id, user!.id);
  if (!updated.count) throw new HTTPException(404, { message: 'Chat not found' });
  return c.json({ success: true }, 200);
});

chatsRouter.openapi(updateModelRoute, async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const { model } = c.req.valid('json');
  const chat = await chatRepository.findMetaForUser(id, user!.id);
  if (!chat) throw new HTTPException(404, { message: 'Chat not found' });
  await chatRepository.updateModel(id, model);
  return c.json({ success: true }, 200);
});

chatsRouter.openapi(pinRoute, async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const updated = await chatRepository.pinForUser(id, user!.id);
  if (!updated.count) throw new HTTPException(404, { message: 'Chat not found' });
  return c.json({ success: true }, 200);
});

chatsRouter.openapi(unpinRoute, async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const updated = await chatRepository.unpinForUser(id, user!.id);
  if (!updated.count) throw new HTTPException(404, { message: 'Chat not found' });
  return c.json({ success: true }, 200);
});

chatsRouter.openapi(renameRoute, async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const { title } = c.req.valid('json');
  const updated = await chatRepository.renameForUser(id, user!.id, title);
  if (!updated.count) throw new HTTPException(404, { message: 'Chat not found' });
  return c.json({ success: true }, 200);
});

export default chatsRouter;

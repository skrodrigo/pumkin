import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import type { AppVariables } from './routes.js';
import { prisma } from './../common/prisma.js';
import { HTTPException } from 'hono/http-exception';
import { otpService } from './../services/otp.service.js';
import { emailService } from './../services/email.service.js';
import { signJwt } from './../services/auth.service.js';

const otpRouter = new OpenAPIHono<{ Variables: AppVariables }>();

const requestOtpRoute = createRoute({
  method: 'post',
  path: '/request',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            email: z.email(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'OTP sent',
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean() }),
        },
      },
    },
  },
});

const verifyOtpRoute = createRoute({
  method: 'post',
  path: '/verify',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            email: z.email(),
            code: z.string().min(6).max(6),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Verified',
      content: {
        'application/json': {
          schema: z.object({ token: z.string() }),
        },
      },
    },
  },
});

otpRouter.openapi(requestOtpRoute, async (c) => {
  const { email } = c.req.valid('json');

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return c.json({ success: true }, 200);
  }

  const { code } = await otpService.issue(email);
  await emailService.sendOtp({ to: email, code });

  return c.json({ success: true }, 200);
});

otpRouter.openapi(verifyOtpRoute, async (c) => {
  const { email, code } = c.req.valid('json');

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new HTTPException(400, { message: 'Invalid code' });
  }

  try {
    await otpService.verify(email, code);
  } catch (e) {
    await otpService.incrementAttempt(email, code);
    throw e;
  }

  await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });

  const token = signJwt({ userId: user.id, iat: Math.floor(Date.now() / 1000) });
  return c.json({ token }, 200);
});

export default otpRouter;

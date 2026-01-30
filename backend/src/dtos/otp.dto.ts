import { z } from '@hono/zod-openapi';

export const OtpRequestSchema = z.object({
  email: z.email(),
});

export const OtpVerifySchema = z.object({
  email: z.email(),
  code: z.string().min(6).max(6),
});

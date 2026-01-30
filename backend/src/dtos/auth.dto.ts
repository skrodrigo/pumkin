import { z } from '@hono/zod-openapi';

export const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
});

export type RegisterData = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type LoginData = z.infer<typeof LoginSchema>;

export const TokenSchema = z.object({
  token: z.string(),
});

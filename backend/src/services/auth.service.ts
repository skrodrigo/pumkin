import { prisma } from './../common/prisma.js';
import { env } from './../common/env.js';
import { HTTPException } from 'hono/http-exception';
import type { RegisterData, LoginData } from './../dtos/auth.dto.js';
import crypto from 'node:crypto';

const SALT_BYTES = 16;
const KEY_BYTES = 32;
const ITERATIONS = 210000;
const DIGEST = 'sha256';

const JWT_TTL_SECONDS = 60 * 60 * 24 * 7;

function hashPassword(password: string) {
  const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_BYTES, DIGEST).toString('hex');
  return `${ITERATIONS}:${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [iterStr, salt, hash] = stored.split(':');
  const iterations = Number(iterStr);
  if (!iterations || !salt || !hash) return false;
  const computed = crypto.pbkdf2Sync(password, salt, iterations, KEY_BYTES, DIGEST).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computed, 'hex'));
}

function b64url(input: Buffer) {
  return input.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export function signJwt(payload: object) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const finalPayload = {
    ...payload,
    iat: now,
    exp: now + JWT_TTL_SECONDS,
  };
  const headerPart = b64url(Buffer.from(JSON.stringify(header)));
  const payloadPart = b64url(Buffer.from(JSON.stringify(finalPayload)));
  const data = `${headerPart}.${payloadPart}`;
  const signature = crypto.createHmac('sha256', env.JWT_SECRET).update(data).digest();
  const sigPart = b64url(signature);
  return `${data}.${sigPart}`;
}

export const authService = {
  async register(data: RegisterData) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });
    if (existing) {
      throw new HTTPException(409, { message: 'User with this email already exists' });
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashPassword(data.password),
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
      },
    });

    return user;
  },

  async login(data: LoginData) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, password: true, email: true, emailVerified: true },
    });
    if (!user) {
      throw new HTTPException(401, { message: 'Invalid credentials' });
    }

    const ok = verifyPassword(data.password, user.password);
    if (!ok) {
      throw new HTTPException(401, { message: 'Invalid credentials' });
    }

    const token = signJwt({ userId: user.id });
    return { token, email: user.email, emailVerified: user.emailVerified };
  },
};

import crypto from 'node:crypto';
import { prisma } from './../common/prisma.js';
import { HTTPException } from 'hono/http-exception';

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

function randomCode() {
  return (Math.floor(100000 + Math.random() * 900000)).toString();
}

function hashOtp(email: string, code: string) {
  return crypto.createHash('sha256').update(`${email}:${code}`).digest('hex');
}

export const otpService = {
  async issue(email: string) {
    const code = randomCode();
    const otpHash = hashOtp(email, code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await prisma.emailOtp.create({
      data: {
        email,
        otpHash,
        expiresAt,
      },
    });

    return { code, expiresAt };
  },

  async verify(email: string, code: string) {
    const otpHash = hashOtp(email, code);

    const record = await prisma.emailOtp.findFirst({
      where: {
        email,
        otpHash,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new HTTPException(400, { message: 'Invalid code' });
    }

    if (record.consumedAt) {
      throw new HTTPException(400, { message: 'Code already used' });
    }

    if (record.expiresAt.getTime() < Date.now()) {
      throw new HTTPException(400, { message: 'Code expired' });
    }

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      throw new HTTPException(429, { message: 'Too many attempts' });
    }

    await prisma.emailOtp.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });

    return { ok: true as const };
  },

  async incrementAttempt(email: string, code: string) {
    const otpHash = hashOtp(email, code);
    const record = await prisma.emailOtp.findFirst({
      where: {
        email,
        otpHash,
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) return;

    await prisma.emailOtp.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
  },
};

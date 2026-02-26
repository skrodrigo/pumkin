import { prisma } from './../common/prisma.js';
import { signJwt } from './auth.service.js';

type GoogleClaims = {
  email: string;
  name?: string | null;
  picture?: string | null;
  email_verified?: boolean | null;
};

export const authGoogleService = {
  async loginFromClaims(claims: GoogleClaims) {
    const email = claims.email;
    const name = claims.name || email;
    const image = claims.picture ?? null;
    const emailVerified = Boolean(claims.email_verified);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        image,
        emailVerified,
      },
      create: {
        name,
        email,
        password: `oauth:google`,
        emailVerified,
        image,
      },
      select: { id: true },
    });

    const token = signJwt({ userId: user.id });
    return { token, userId: user.id };
  },
};

import { authService } from './../services/auth.service.js';
import { RegisterSchema, LoginSchema, TokenSchema } from './../dtos/auth.dto.js';
import { UserSchema } from './../dtos/users.dto.js';
import { authMiddleware } from './../middlewares/auth.middleware.js';
import type { AppVariables } from './routes.js';
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { env } from './../common/env.js';
import { authGoogleService } from './../services/auth-google.service.js';
import * as client from 'openid-client';
import crypto from 'node:crypto';

const authRouter = new OpenAPIHono<{ Variables: AppVariables }>();

function base64url(input: Buffer) {
  return input.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function makeCookie(name: string, value: string, opts?: { maxAgeSeconds?: number }) {
  const maxAge = opts?.maxAgeSeconds ?? 10 * 60;
  const secure = env.NODE_ENV === 'production';
  const sameSite = secure ? 'None' : 'Lax';
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    'HttpOnly',
    `SameSite=${sameSite}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

function clearCookie(name: string) {
  const secure = env.NODE_ENV === 'production';
  const sameSite = secure ? 'None' : 'Lax';
  const parts = [
    `${name}=`,
    'Path=/',
    'Max-Age=0',
    'HttpOnly',
    `SameSite=${sameSite}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

function safeReturnTo(value: string | null) {
  const fallback = env.WEB_URL;
  if (!value) return fallback;
  try {
    const u = new URL(value);
    if (u.origin === env.WEB_URL || u.origin === 'http://localhost:3000') {
      return u.toString();
    }
    return fallback;
  } catch {
    return fallback;
  }
}

let googleConfigPromise: Promise<client.Configuration> | null = null;
async function getGoogleConfig() {
  if (!googleConfigPromise) {
    googleConfigPromise = (async () => {
      const issuer = new URL('https://accounts.google.com');
      return client.discovery(issuer, env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);
    })();
  }
  return googleConfigPromise;
}

authRouter.get('/google', async (c) => {
  const returnTo = safeReturnTo(c.req.query('returnTo') ?? null);
  const config = await getGoogleConfig();

  const redirectUri = `${env.API_URL}/api/auth/google/callback`;
  const codeVerifier = client.randomPKCECodeVerifier();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const state = client.randomState();

  const authUrl = client.buildAuthorizationUrl(config, {
    redirect_uri: redirectUri,
    scope: 'openid email profile',
    response_type: 'code',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  });

  c.header('Set-Cookie', makeCookie('g_state', state));
  c.header('Set-Cookie', makeCookie('g_verifier', codeVerifier));
  c.header('Set-Cookie', makeCookie('g_returnTo', returnTo));
  return c.redirect(authUrl.toString());
});

authRouter.get('/google/callback', async (c) => {
  const cookieHeader = c.req.header('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader
      .split(';')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => {
        const idx = p.indexOf('=');
        const k = idx >= 0 ? p.slice(0, idx) : p;
        const v = idx >= 0 ? p.slice(idx + 1) : '';
        return [k, decodeURIComponent(v)];
      })
  );

  const expectedState = cookies['g_state'] || '';
  const pkceCodeVerifier = cookies['g_verifier'] || '';
  const returnTo = safeReturnTo(cookies['g_returnTo'] || null);

  c.header('Set-Cookie', clearCookie('g_state'));
  c.header('Set-Cookie', clearCookie('g_verifier'));
  c.header('Set-Cookie', clearCookie('g_returnTo'));

  const config = await getGoogleConfig();
  const redirectUri = `${env.API_URL}/api/auth/google/callback`;

  const currentUrl = new URL(c.req.url);
  const tokens = await client.authorizationCodeGrant(config, currentUrl, {
    pkceCodeVerifier,
    expectedState,
  });

  const claims = tokens.claims();
  if (!claims) {
    return c.redirect(`${env.WEB_URL}/?error=missing_claims`);
  }
  const email = typeof claims.email === 'string' ? claims.email : null;
  if (!email) {
    return c.redirect(`${env.WEB_URL}/?error=missing_email`);
  }

  const name = typeof claims.name === 'string' ? claims.name : undefined;
  const picture = typeof claims.picture === 'string' ? claims.picture : undefined;
  const email_verified = typeof (claims as any).email_verified === 'boolean' ? (claims as any).email_verified : undefined;

  const { token } = await authGoogleService.loginFromClaims({
    email,
    name,
    picture,
    email_verified,
  });

  const callbackUrl = new URL(returnTo);
  callbackUrl.searchParams.set('token', token);
  return c.redirect(callbackUrl.toString());
});

const registerRoute = createRoute({
  method: 'post',
  path: '/register',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': { schema: RegisterSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'User created successfully',
      content: { 'application/json': { schema: UserSchema } },
    },
    409: { description: 'User already exists' },
  },
});

const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': { schema: LoginSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Login successful',
      content: { 'application/json': { schema: TokenSchema } },
    },
    401: { description: 'Invalid credentials' },
  },
});

const meRoute = createRoute({
  method: 'get',
  path: '/me',
  tags: ['Auth'],
  responses: {
    200: {
      description: 'Current user',
      content: { 'application/json': { schema: UserSchema } },
    },
    401: { description: 'Unauthorized' },
  },
});

authRouter.openapi(registerRoute, async (c) => {
  const data = c.req.valid('json');
  const user = await authService.register(data);
  return c.json(user, 201);
});

authRouter.openapi(loginRoute, async (c) => {
  const data = c.req.valid('json');
  const { token } = await authService.login(data);
  return c.json({ token }, 200);
});

authRouter.use('/me', authMiddleware);
authRouter.openapi(meRoute, (c) => {
  const user = c.get('user');
  return c.json(user, 200);
});

export default authRouter;

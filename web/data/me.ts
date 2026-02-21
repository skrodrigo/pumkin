export type MeUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
};

export const meService = {
  async get() {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const code = body?.statusCode ?? res.status;
      throw new Error(JSON.stringify({ statusCode: code, error: body?.error || `Request failed (${code})` }));
    }
    return body as MeUser;
  },
};

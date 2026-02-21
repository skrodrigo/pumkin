export const authOtpService = {
  async request(email: string) {
    const res = await fetch('/api/auth/otp/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      cache: 'no-store',
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const code = body?.statusCode ?? res.status;
      throw new Error(JSON.stringify({ statusCode: code, error: body?.error || `Request failed (${code})` }));
    }
    return body as { success: boolean };
  },

  async verify(params: { email: string; code: string }) {
    const res = await fetch('/api/auth/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      cache: 'no-store',
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const code = body?.statusCode ?? res.status;
      throw new Error(JSON.stringify({ statusCode: code, error: body?.error || `Request failed (${code})` }));
    }
    return body as { token: string };
  },
};

export const authPasswordService = {
  async register(params: { name: string; email: string; password: string }) {
    const res = await fetch('/api/auth/password/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      cache: 'no-store',
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const code = body?.statusCode ?? res.status;
      throw new Error(JSON.stringify({ statusCode: code, error: body?.error || `Request failed (${code})` }));
    }
    return body as { otpRequired?: boolean };
  },

  async login(params: { email: string; password: string }) {
    const res = await fetch('/api/auth/password/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      cache: 'no-store',
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const code = body?.statusCode ?? res.status;
      throw new Error(JSON.stringify({ statusCode: code, error: body?.error || `Request failed (${code})` }));
    }
    return body as { token?: string; otpRequired?: boolean };
  },

  async storeToken(token: string) {
    const res = await fetch('/api/auth/password/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const code = body?.statusCode ?? res.status;
      throw new Error(JSON.stringify({ statusCode: code, error: body?.error || `Request failed (${code})` }));
    }
    return body as { success: boolean };
  },
};

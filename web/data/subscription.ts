export const subscriptionService = {
  async get() {
    const res = await fetch('/api/subscription', { cache: 'no-store' });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const code = body?.statusCode ?? res.status;
      throw new Error(JSON.stringify({ statusCode: code, error: body?.error || `Request failed (${code})` }));
    }
    return res.json();
  },

  async deleteIncomplete() {
    const res = await fetch('/api/subscription/incomplete', { method: 'DELETE', cache: 'no-store' });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const code = body?.statusCode ?? res.status;
      throw new Error(JSON.stringify({ statusCode: code, error: body?.error || `Request failed (${code})` }));
    }
    return res.json();
  },
};

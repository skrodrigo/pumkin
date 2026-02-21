export const usageService = {
  async get() {
    const res = await fetch('/api/usage', { cache: 'no-store' });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const code = body?.statusCode ?? res.status;
      throw new Error(JSON.stringify({ statusCode: code, error: body?.error || `Request failed (${code})` }));
    }
    return res.json();
  },

  async increment() {
    const res = await fetch('/api/usage?action=increment', { method: 'POST', cache: 'no-store' });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const code = body?.statusCode ?? res.status;
      throw new Error(JSON.stringify({ statusCode: code, error: body?.error || `Request failed (${code})` }));
    }
    return res.json();
  },
};

export const chatsService = {
  async list() {
    const res = await fetch('/api/chats', { cache: 'no-store' });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const code = body?.statusCode ?? res.status;
      throw new Error(JSON.stringify({ statusCode: code, error: body?.error || `Request failed (${code})` }));
    }
    return res.json();
  },

  async getById(id: string) {
    const res = await fetch(`/api/chats/${id}`, { cache: 'no-store' });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const code = body?.statusCode ?? res.status;
      throw new Error(JSON.stringify({ statusCode: code, error: body?.error || `Request failed (${code})` }));
    }
    return res.json();
  },

  async delete(id: string) {
    const res = await fetch(`/api/chats/${id}`, { method: 'DELETE', cache: 'no-store' });
    if (res.status === 404) {
      return { success: true };
    }
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const code = body?.statusCode ?? res.status;
      throw new Error(JSON.stringify({ statusCode: code, error: body?.error || `Request failed (${code})` }));
    }
    return res.json();
  },

  async share(id: string) {
    const res = await fetch(`/api/chats/${id}/share`, { method: 'POST', cache: 'no-store' });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const code = body?.statusCode ?? res.status;
      throw new Error(JSON.stringify({ statusCode: code, error: body?.error || `Request failed (${code})` }));
    }
    return res.json();
  },
};

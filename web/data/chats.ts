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

  async pin(id: string) {
    const res = await fetch(`/api/chats/${id}/pin`, {
      method: 'PATCH',
      cache: 'no-store',
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      const code = body?.statusCode ?? res.status
      throw new Error(
        JSON.stringify({
          statusCode: code,
          error: body?.error || `Request failed (${code})`,
        }),
      )
    }
    return res.json()
  },

  async unpin(id: string) {
    const res = await fetch(`/api/chats/${id}/unpin`, {
      method: 'PATCH',
      cache: 'no-store',
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      const code = body?.statusCode ?? res.status
      throw new Error(
        JSON.stringify({
          statusCode: code,
          error: body?.error || `Request failed (${code})`,
        }),
      )
    }
    return res.json()
  },

  async rename({ id, title }: { id: string; title: string }) {
    const res = await fetch(`/api/chats/${id}/rename`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
      cache: 'no-store',
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      const code = body?.statusCode ?? res.status
      throw new Error(
        JSON.stringify({
          statusCode: code,
          error: body?.error || `Request failed (${code})`,
        }),
      )
    }
    return res.json()
  },

  async archive(id: string) {
    const res = await fetch(`/api/chats/${id}/archive`, {
      method: 'PATCH',
      cache: 'no-store',
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      const code = body?.statusCode ?? res.status
      throw new Error(
        JSON.stringify({
          statusCode: code,
          error: body?.error || `Request failed (${code})`,
        }),
      )
    }
    return res.json()
  },

  async unarchive(id: string) {
    const res = await fetch(`/api/chats/${id}/unarchive`, {
      method: 'PATCH',
      cache: 'no-store',
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      const code = body?.statusCode ?? res.status
      throw new Error(
        JSON.stringify({
          statusCode: code,
          error: body?.error || `Request failed (${code})`,
        }),
      )
    }
    return res.json()
  },

  async listArchived() {
    const res = await fetch('/api/chats/archived', { cache: 'no-store' })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      const code = body?.statusCode ?? res.status
      throw new Error(
        JSON.stringify({
          statusCode: code,
          error: body?.error || `Request failed (${code})`,
        }),
      )
    }
    return res.json()
  },

  async getById(id: string, branchId?: string | null) {
    const url = new URL(`/api/chats/${id}`, window.location.origin)
    if (branchId) url.searchParams.set('branchId', branchId)

    const res = await fetch(url.toString(), { cache: 'no-store' });
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

  async deleteMessagesAfter(chatId: string, messageId: string) {
    const res = await fetch(`/api/chats/${chatId}/messages/${messageId}`, {
      method: 'DELETE',
      cache: 'no-store',
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const code = body?.statusCode ?? res.status;
      throw new Error(JSON.stringify({ statusCode: code, error: body?.error || `Request failed (${code})` }));
    }
    return res.json();
  },

  async getMessageBranches(chatId: string, messageId: string, currentBranchId?: string | null) {
    const url = new URL(`/api/chats/${chatId}/messages/${messageId}/branches`, window.location.origin)
    if (currentBranchId) url.searchParams.set('currentBranchId', currentBranchId)

    const res = await fetch(url.toString(), {
      method: 'GET',
      cache: 'no-store',
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      const code = body?.statusCode ?? res.status
      throw new Error(JSON.stringify({ statusCode: code, error: body?.error || `Request failed (${code})` }))
    }
    return res.json()
  },

  async selectBranch(chatId: string, branchId: string) {
    const res = await fetch(`/api/chats/${chatId}/branches/${branchId}/select`, {
      method: 'POST',
      cache: 'no-store',
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      const code = body?.statusCode ?? res.status
      throw new Error(JSON.stringify({ statusCode: code, error: body?.error || `Request failed (${code})` }))
    }
    return res.json()
  },
};

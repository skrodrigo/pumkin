import { createApiClient } from './api';

function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  if (!url) throw new Error('Missing NEXT_PUBLIC_API_URL (or API_URL)');
  return url;
}

export const chatsService = {
  async list(token: string) {
    const api = createApiClient({ baseUrl: getApiBaseUrl(), token });
    return api.get<any>('/api/chats');
  },

  async getById(token: string, id: string) {
    const api = createApiClient({ baseUrl: getApiBaseUrl(), token });
    return api.get<any>(`/api/chats/${id}`);
  },

  async delete(token: string, id: string) {
    const api = createApiClient({ baseUrl: getApiBaseUrl(), token });
    return api.delete<any>(`/api/chats/${id}`);
  },

  async share(token: string, id: string) {
    const api = createApiClient({ baseUrl: getApiBaseUrl(), token });
    return api.post<any>(`/api/chats/${id}/share`);
  },
};

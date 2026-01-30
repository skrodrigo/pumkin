import { createApiClient } from './api';

function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  if (!url) throw new Error('Missing NEXT_PUBLIC_API_URL (or API_URL)');
  return url;
}

export const usageService = {
  async get(token: string) {
    const api = createApiClient({ baseUrl: getApiBaseUrl(), token });
    return api.get<any>('/api/usage');
  },

  async increment(token: string) {
    const api = createApiClient({ baseUrl: getApiBaseUrl(), token });
    return api.post<any>('/api/usage/increment');
  },
};

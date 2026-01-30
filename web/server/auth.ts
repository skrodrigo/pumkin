import { createApiClient } from './api';

export type AuthTokenResponse = { token: string };

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  stripeCustomerId?: string | null;
};

function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  if (!url) throw new Error('Missing NEXT_PUBLIC_API_URL (or API_URL)');
  return url;
}

export const authService = {
  async register(data: { name: string; email: string; password: string }) {
    const api = createApiClient({ baseUrl: getApiBaseUrl() });
    return api.post<User>('/api/auth/register', data);
  },

  async login(data: { email: string; password: string }) {
    const api = createApiClient({ baseUrl: getApiBaseUrl() });
    return api.post<AuthTokenResponse>('/api/auth/login', data);
  },

  async me(token: string) {
    const api = createApiClient({ baseUrl: getApiBaseUrl(), token });
    return api.get<User>('/api/auth/me');
  },
};

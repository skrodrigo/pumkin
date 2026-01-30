type ApiOptions = {
  baseUrl: string;
  token?: string | null;
};

export class ApiError extends Error {
  status: number;
  body: any;

  constructor(status: number, message: string, body: any) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export function createApiClient({ baseUrl, token }: ApiOptions) {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);

    if (!headers.has('Content-Type') && init?.body) {
      headers.set('Content-Type', 'application/json');
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
      cache: 'no-store',
    });

    const contentType = res.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await res.json().catch(() => null) : await res.text().catch(() => null);

    if (!res.ok) {
      const message = typeof body?.error === 'string' ? body.error : `Request failed (${res.status})`;
      throw new ApiError(res.status, message, body);
    }

    return body as T;
  }

  return {
    get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'GET' }),
    post: <T>(path: string, data?: any, init?: RequestInit) =>
      request<T>(path, {
        ...init,
        method: 'POST',
        body: data !== undefined ? JSON.stringify(data) : undefined,
      }),
    patch: <T>(path: string, data?: any, init?: RequestInit) =>
      request<T>(path, {
        ...init,
        method: 'PATCH',
        body: data !== undefined ? JSON.stringify(data) : undefined,
      }),
    delete: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'DELETE' }),
  };
}

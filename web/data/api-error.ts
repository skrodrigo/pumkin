export type ApiErrorPayload = {
  statusCode: number;
  error: string;
};

export function toApiErrorPayload(err: unknown): ApiErrorPayload {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
    const message = (err as any).message;
    try {
      const parsed = JSON.parse(message);
      if (
        parsed &&
        typeof parsed === 'object' &&
        typeof (parsed as any).statusCode === 'number' &&
        typeof (parsed as any).error === 'string'
      ) {
        return { statusCode: (parsed as any).statusCode, error: (parsed as any).error };
      }
    } catch {
    }

    return { statusCode: 0, error: message };
  }

  return { statusCode: 0, error: 'Unknown error' };
}

export function throwApiError(body: any, fallbackStatusCode: number, fallbackMessage: string): never {
  const statusCode = typeof body?.statusCode === 'number' ? body.statusCode : fallbackStatusCode;
  const error = typeof body?.error === 'string' && body.error ? body.error : fallbackMessage;
  throw new Error(JSON.stringify({ statusCode, error }));
}

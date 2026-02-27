import { getApiBaseUrl, proxyJson, requireAuthToken } from '@/data/bff';

export async function GET() {
  const auth = await requireAuthToken();
  if (!auth.ok) return auth.res;

  const upstream = await fetch(`${getApiBaseUrl()}/api/chats`, {
    headers: { Authorization: `Bearer ${auth.token}` },
    next: {
      tags: ['chats:list'],
      revalidate: 30,
    },
  });

  return proxyJson(upstream);
}

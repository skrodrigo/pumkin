import { getApiBaseUrl, proxyJson, requireAuthToken } from '@/data/bff';

export async function POST() {
  const auth = await requireAuthToken();
  if (!auth.ok) return auth.res;

  const upstream = await fetch(`${getApiBaseUrl()}/api/stripe/portal`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${auth.token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  return proxyJson(upstream);
}

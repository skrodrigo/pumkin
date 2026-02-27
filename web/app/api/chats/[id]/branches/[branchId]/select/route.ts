import { getApiBaseUrl, proxyJson, requireAuthToken } from '@/data/bff';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; branchId: string }> }
) {
  const auth = await requireAuthToken();
  if (!auth.ok) return auth.res;

  const { id, branchId } = await params;

  const upstream = await fetch(
    `${getApiBaseUrl()}/api/chats/${id}/branches/${branchId}/select`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.token}` },
      cache: 'no-store',
    }
  );

  return proxyJson(upstream);
}

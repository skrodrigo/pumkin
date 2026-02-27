import { getApiBaseUrl, proxyJson, requireAuthToken } from '@/data/bff';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const auth = await requireAuthToken();
  if (!auth.ok) return auth.res;

  const { id, messageId } = await params;

  const upstream = await fetch(
    `${getApiBaseUrl()}/api/chats/${id}/messages/${messageId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${auth.token}` },
      cache: 'no-store',
    }
  );

  return proxyJson(upstream);
}

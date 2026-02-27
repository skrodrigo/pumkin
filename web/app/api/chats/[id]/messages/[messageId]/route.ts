import { getApiBaseUrl, proxyJson, requireAuthToken } from '@/data/bff';
import { revalidateTag } from 'next/cache';

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

  const ok = upstream.ok
  const res = await proxyJson(upstream)
  if (ok) {
    revalidateTag('chats:list', {})
    revalidateTag(`chat:${id}`, {})
  }
  return res
}

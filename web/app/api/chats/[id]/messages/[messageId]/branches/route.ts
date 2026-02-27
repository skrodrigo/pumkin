import { getApiBaseUrl, proxyJson, requireAuthToken } from '@/data/bff';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const auth = await requireAuthToken();
  if (!auth.ok) return auth.res;

  const { id, messageId } = await params;
  const url = new URL(req.url);
  const currentBranchId = url.searchParams.get('currentBranchId');

  const upstreamUrl = new URL(
    `${getApiBaseUrl()}/api/chats/${id}/messages/${messageId}/branches`
  );
  if (currentBranchId) upstreamUrl.searchParams.set('currentBranchId', currentBranchId);

  const upstream = await fetch(upstreamUrl.toString(), {
    method: 'GET',
    headers: { Authorization: `Bearer ${auth.token}` },
    cache: 'no-store',
  });

  return proxyJson(upstream);
}

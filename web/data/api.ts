export function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error('Missing NEXT_PUBLIC_API_URL');
  return url;
}

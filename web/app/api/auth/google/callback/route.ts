import { NextResponse } from 'next/server';

type CallbackPayload = {
  token?: string;
  error?: string;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const error = url.searchParams.get('error');

  if (error) {
    const dest = new URL('/', url.origin);
    dest.searchParams.set('error', error);
    return NextResponse.redirect(dest);
  }

  if (!token) {
    const dest = new URL('/', url.origin);
    dest.searchParams.set('error', 'missing_token');
    return NextResponse.redirect(dest);
  }

  const dest = new URL('/chat', url.origin);
  const res = NextResponse.redirect(dest);
  res.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

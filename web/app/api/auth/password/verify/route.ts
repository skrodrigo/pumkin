import { NextResponse } from 'next/server';

type Body = {
  token?: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  const token = body?.token;

  if (!token) {
    return NextResponse.json({ error: 'missing_token', statusCode: 400 }, { status: 400 });
  }

  const res = NextResponse.json({ success: true }, { status: 200 });
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

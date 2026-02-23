import { NextResponse, type NextRequest } from 'next/server'

function isChatRoute(pathname: string) {
	return pathname === '/chat' || pathname.startsWith('/chat/')
}

export function proxy(request: NextRequest) {
	if (!isChatRoute(request.nextUrl.pathname)) {
		return NextResponse.next()
	}

	const token = request.cookies.get('token')?.value ?? null
	if (token) {
		return NextResponse.next()
	}

	const url = request.nextUrl.clone()
	url.pathname = '/'
	url.searchParams.set('next', request.nextUrl.pathname)
	return NextResponse.redirect(url)
}

export const config = {
	matcher: ['/chat', '/chat/:path*'],
}

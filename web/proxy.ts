import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
	const token = request.cookies.get('token')?.value ?? null
	const pathname = request.nextUrl.pathname

	if (token) {
		if (pathname === '/') {
			const url = request.nextUrl.clone()
			url.pathname = '/chat'
			return NextResponse.redirect(url)
		}
		return NextResponse.next()
	}

	if (pathname === '/') {
		return NextResponse.next()
	}

	const url = request.nextUrl.clone()
	url.pathname = '/'
	return NextResponse.redirect(url)
}

export const config = {
	matcher: ['/', '/chat', '/chat/:path*'],
}

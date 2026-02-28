import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export function proxy(request: NextRequest) {
	const token = request.cookies.get('token')?.value ?? null
	const pathname = request.nextUrl.pathname

	const localeMatch = pathname.match(/^\/(en|fr|es|pt)(\/|$)/)
	const locale = localeMatch ? localeMatch[1] : routing.defaultLocale

	if (token) {
		if (pathname === '/' || pathname === `/${locale}` || pathname === `/${locale}/`) {
			const url = request.nextUrl.clone()
			url.pathname = locale === routing.defaultLocale ? '/chat' : `/${locale}/chat`
			return NextResponse.redirect(url)
		}
		return intlMiddleware(request)
	}

	if (pathname === '/' || pathname === `/${locale}` || pathname === `/${locale}/`) {
		return intlMiddleware(request)
	}

	const url = request.nextUrl.clone()
	url.pathname = '/'
	return NextResponse.redirect(url)
}

export const config = {
	matcher: ['/', '/(en|fr|es|pt)/:path*', '/chat', '/chat/:path*', '/upgrade', '/upgrade/:path*'],
}

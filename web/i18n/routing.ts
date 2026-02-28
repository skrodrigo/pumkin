import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
	locales: ['en', 'fr', 'es', 'pt'],
	defaultLocale: 'pt',
	localePrefix: 'as-needed',
})

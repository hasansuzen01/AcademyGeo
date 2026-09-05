import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

import { countryFromHeaders, resolveLocale } from '@/i18n/detect-locale';
import { locales, routing } from '@/i18n/routing';

const LOCALE_COOKIE = 'NEXT_LOCALE';

const intlProxy = createIntlMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocalePrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (hasLocalePrefix) {
    return intlProxy(request);
  }

  const locale = resolveLocale({
    cookie: request.cookies.get(LOCALE_COOKIE)?.value,
    country: countryFromHeaders(request.headers),
  });

  const target = request.nextUrl.clone();
  target.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;

  return NextResponse.redirect(target);
}

export const config = {
  matcher: ['/((?!api|_next|metas|.*\\..*).*)'],
};

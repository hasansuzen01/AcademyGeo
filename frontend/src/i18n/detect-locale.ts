import { type Locale, routing } from './routing';

/** Country codes whose visitors get the Turkish interface. */
const TURKISH_COUNTRIES = new Set(['TR']);

/** Everyone the platform can place somewhere else reads the English one. */
const ELSEWHERE: Locale = 'en';

const GEO_HEADERS = [
  'x-vercel-ip-country',
  'cf-ipcountry',
  'x-country-code',
  'x-geo-country',
] as const;

/**
 * Picks the interface language from the visitor's country.
 *
 * Turkish unless the visitor is somewhere else: hosting platforms put the
 * resolved country in a header, and a visitor with no header at all is more
 * likely to be here than anywhere in particular.
 */
export function localeForCountry(country: string | null | undefined): Locale {
  if (!country) return routing.defaultLocale;

  return TURKISH_COUNTRIES.has(country.toUpperCase()) ? 'tr' : ELSEWHERE;
}

export function countryFromHeaders(headers: Headers): string | null {
  for (const header of GEO_HEADERS) {
    const value = headers.get(header);
    if (value) return value;
  }
  return process.env.DEFAULT_COUNTRY ?? null;
}

export interface LocaleRequest {
  cookie: string | undefined;
  country: string | null | undefined;
}

/** The visitor's own choice wins; otherwise their country decides. */
export function resolveLocale({ cookie, country }: LocaleRequest): Locale {
  if (isLocale(cookie)) return cookie;
  return localeForCountry(country);
}

function isLocale(value: string | undefined): value is Locale {
  return routing.locales.includes(value as Locale);
}

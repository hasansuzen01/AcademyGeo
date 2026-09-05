import { type Locale, routing } from './routing';

/** Country codes whose visitors get the Turkish interface. */
const TURKISH_COUNTRIES = new Set(['TR']);

const GEO_HEADERS = [
  'x-vercel-ip-country',
  'cf-ipcountry',
  'x-country-code',
  'x-geo-country',
] as const;

/**
 * Picks the interface language from the visitor's country. Hosting platforms
 * put the resolved country in a header; when none is present the app falls
 * back to DEFAULT_COUNTRY and finally to English.
 */
export function localeForCountry(country: string | null | undefined): Locale {
  if (!country) return routing.defaultLocale;
  return TURKISH_COUNTRIES.has(country.toUpperCase()) ? 'tr' : routing.defaultLocale;
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

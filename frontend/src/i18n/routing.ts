import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'tr'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  // The locale is decided once, in the proxy, from the visitor's country. Every
  // URL then carries it so a shared link keeps the language it was read in.
  localePrefix: 'always',
  localeDetection: false,
});

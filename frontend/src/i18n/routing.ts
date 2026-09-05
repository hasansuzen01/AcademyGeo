import { defineRouting } from 'next-intl/routing';

// Turkish first: it is the default, and the order is what next-intl reads.
export const locales = ['tr', 'en'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'tr',
  // The locale is decided once, in the proxy, from the visitor's country. Every
  // URL then carries it so a shared link keeps the language it was read in.
  localePrefix: 'always',
  localeDetection: false,
});

'use client';

import { useLocale } from 'next-intl';
import { useTransition } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { locales } from '@/i18n/routing';
import { cn } from '@/lib/cn';

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function LocaleSwitch() {
  const active = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(locale: string) {
    // Remember the choice so the country-based default does not override it.
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
    startTransition(() => router.replace(pathname, { locale: locale as (typeof locales)[number] }));
  }

  return (
    <div
      className={cn(
        'flex items-center rounded-full border border-line p-0.5 font-mono text-xs',
        pending && 'opacity-60',
      )}
    >
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => choose(locale)}
          aria-current={locale === active}
          className={cn(
            'rounded-full px-2.5 py-1 uppercase transition-colors',
            locale === active ? 'bg-paper text-ink' : 'text-muted hover:text-ink',
          )}
        >
          {locale}
        </button>
      ))}
    </div>
  );
}

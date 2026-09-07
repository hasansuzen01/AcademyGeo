'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

/**
 * What a visitor sees when a page throws.
 *
 * The API being briefly unreachable is the ordinary cause, so the offer is to
 * try again rather than an apology. Next's raw error page is not something a
 * player should ever meet.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-md px-5 py-24 text-center">
      <span className="centre-line mx-auto block h-2 w-32 rounded-full" aria-hidden />
      <h1 className="mt-8 font-display text-2xl font-900 tracking-tight">{t('pageTitle')}</h1>
      <p className="mt-2 text-sm text-muted">{t('pageBody')}</p>
      <button type="button" onClick={reset} className="btn btn-go mt-8">
        {t('retry')}
      </button>
    </div>
  );
}

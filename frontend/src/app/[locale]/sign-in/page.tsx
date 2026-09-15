import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

import { BrandMark } from '@/components/brand-mark';
import { GoogleSignInButton } from '@/components/google-sign-in-button';
import { fetchViewer } from '@/lib/server-api';

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ locale }, { error }, viewer] = await Promise.all([
    params,
    searchParams,
    fetchViewer(),
  ]);
  // Someone already signed in has nothing to do here. It matters most right
  // after a sign-in: a replayed callback can land on this page with an error
  // for a session that in fact went through.
  if (viewer) redirect(`/${locale}/play`);

  setRequestLocale(locale);
  const t = await getTranslations('auth');

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 py-24 text-center">
      <BrandMark className="size-16" />
      <h1 className="mt-8 font-display text-3xl font-900 tracking-tight">{t('title')}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">{t('body')}</p>
      {/* A Google round trip that fails comes back here with a code in the
          query. The code is for the API logs; the reader only needs to know
          it did not work and that pressing the button again is safe. */}
      {error && (
        <p
          role="alert"
          className="mt-6 w-full rounded-2xl border-2 border-stop/40 bg-stop-wash px-4 py-3 text-sm font-800 text-ink"
        >
          {t('failed')}
        </p>
      )}
      <div className="mt-9 w-full">
        <GoogleSignInButton />
      </div>
    </div>
  );
}

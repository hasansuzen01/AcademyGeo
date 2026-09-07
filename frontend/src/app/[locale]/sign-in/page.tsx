import { getTranslations, setRequestLocale } from 'next-intl/server';

import { GoogleSignInButton } from '@/components/google-sign-in-button';

export default async function SignInPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth');

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 py-24 text-center">
      <span className="centre-line h-1.5 w-20 rounded-full" />
      <h1 className="mt-8 font-display text-3xl font-900 tracking-tight">{t('title')}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">{t('body')}</p>
      <div className="mt-9 w-full">
        <GoogleSignInButton />
      </div>
    </div>
  );
}

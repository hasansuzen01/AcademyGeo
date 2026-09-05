'use client';

import { useTranslations } from 'next-intl';

import { GoogleSignInButton } from './google-sign-in-button';

/**
 * Shown in place of a page that needs an account. `reason` picks the wording
 * so the dashboard does not ask people to sign in "to practise".
 */
export function SignInPrompt({ reason = 'play' }: { reason?: 'play' | 'progress' }) {
  const t = useTranslations('auth');

  return (
    <div className="card-raised mx-auto max-w-md px-6 py-10 text-center">
      <span className="centre-line mx-auto block h-2.5 w-20 rounded-full" />
      <h2 className="mt-7 font-display text-2xl font-900 tracking-tight">
        {reason === 'play' ? t('guardTitle') : t('title')}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {reason === 'play' ? t('guardBody') : t('body')}
      </p>
      <div className="mt-8">
        <GoogleSignInButton />
      </div>
    </div>
  );
}

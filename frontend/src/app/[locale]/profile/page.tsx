import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ProfileView } from '@/components/profile-view';
import { ProgressPanel } from '@/components/progress-panel';
import { RunHistory } from '@/components/run-history';
import { NOT_FOR_SEARCH } from '@/lib/metadata';

export const metadata: Metadata = NOT_FOR_SEARCH;

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile');

  return (
    <div className="page-shell px-5 py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-900 tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-sm text-muted">{t('subtitle')}</p>
      </header>
      <div className="space-y-6">
        <ProfileView />
        <ProgressPanel />
        <RunHistory />
      </div>
    </div>
  );
}

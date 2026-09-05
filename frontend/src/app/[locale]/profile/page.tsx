import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ProfileView } from '@/components/profile-view';
import { ProgressPanel } from '@/components/progress-panel';
import { RunHistory } from '@/components/run-history';

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile');

  return (
    <div className="page-shell px-5 py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-800 tracking-tight">{t('title')}</h1>
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

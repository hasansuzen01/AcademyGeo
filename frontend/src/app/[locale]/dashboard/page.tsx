import { getTranslations, setRequestLocale } from 'next-intl/server';

import { DashboardView } from '@/components/dashboard-view';
import { ProgressPanel } from '@/components/progress-panel';

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('dashboard');

  return (
    <div className="page-shell px-5 py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-900 tracking-tight sm:text-4xl">{t('title')}</h1>
        <p className="mt-2 text-sm text-muted">{t('subtitle')}</p>
      </header>
      <div className="space-y-6">
        <DashboardView />
        <ProgressPanel />
      </div>
    </div>
  );
}

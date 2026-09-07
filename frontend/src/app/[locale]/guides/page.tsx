import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { GuideTopicGrid } from '@/components/guide-topic-grid';
import { Link } from '@/i18n/navigation';
import { fetchSiteSeo } from '@/lib/content-api';
import { fetchGuideTopics } from '@/lib/guides-api';
import { buildMetadata } from '@/lib/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [site, t] = await Promise.all([
    fetchSiteSeo(),
    getTranslations({ locale, namespace: 'guides' }),
  ]);

  return buildMetadata({
    site,
    path: `/${locale}/guides`,
    title: t('metaTitle'),
    description: t('metaDescription'),
  });
}

/**
 * The library index.
 *
 * This is the reading half of the site, the part a player goes to before they
 * can name anything: one heading per kind of clue, each holding the articles
 * that say what to look at and what it narrows down.
 */
export default async function GuidesIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [topics, t] = await Promise.all([
    fetchGuideTopics(locale),
    getTranslations({ locale, namespace: 'guides' }),
  ]);

  return (
    <div className="page-shell px-5 py-12">
      <header className="mb-8 max-w-2xl">
        <p className="eyebrow">{t('eyebrow')}</p>
        <h1 className="mt-2 font-display text-3xl font-900 tracking-tight sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t('intro')}</p>
      </header>

      {topics.length === 0 ? (
        <div className="card-raised px-6 py-14 text-center">
          <span className="centre-line mx-auto block h-2 w-40 rounded-full" aria-hidden />
          <p className="mt-6 text-sm text-muted">{t('empty')}</p>
          <Link href="/play" className="btn btn-go mt-6">
            {t('emptyAction')}
          </Link>
        </div>
      ) : (
        <GuideTopicGrid topics={topics} />
      )}
    </div>
  );
}

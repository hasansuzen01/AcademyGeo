import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { fetchSiteSeo } from '@/lib/content-api';
import { GuideIcon } from '@/lib/guide-icons';
import { fetchGuideTopic } from '@/lib/guides-api';
import { toJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/metadata';

interface RouteParams {
  params: Promise<{ locale: string; topic: string }>;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { locale, topic: slug } = await params;
  const [topic, site] = await Promise.all([fetchGuideTopic(locale, slug), fetchSiteSeo()]);

  if (!topic) return {};

  return buildMetadata({
    site,
    path: `/${locale}/guides/${topic.slug}`,
    title: topic.metaTitle || topic.title,
    description: topic.metaDescription || topic.summary,
    keywords: topic.keywords,
    canonical: topic.canonicalUrl ?? undefined,
    robots: topic.robotsMeta,
    image: topic.coverImageUrl,
    locales: [topic.locale],
  });
}

/** One heading: what it teaches, then every article under it in reading order. */
export default async function GuideTopicPage({ params }: RouteParams) {
  const { locale, topic: slug } = await params;
  setRequestLocale(locale);

  const [topic, site, t] = await Promise.all([
    fetchGuideTopic(locale, slug),
    fetchSiteSeo(),
    getTranslations({ locale, namespace: 'guides' }),
  ]);

  if (!topic) notFound();

  const root = site.siteUrl.replace(/\/+$/, '');

  // A list of articles under one heading is exactly what a search engine
  // wants described, and it is what the library actually is.
  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: topic.title,
    description: topic.metaDescription || topic.summary || undefined,
    inLanguage: topic.locale,
    url: `${root}/${locale}/guides/${topic.slug}`,
    hasPart: topic.entries.map((entry) => ({
      '@type': 'Article',
      headline: entry.title,
      url: `${root}/${locale}/guides/${topic.slug}/${entry.slug}`,
    })),
  };

  return (
    <div className="page-shell px-5 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(collection) }}
      />

      <Link href="/guides" className="text-sm font-800 text-muted transition-colors hover:text-ink">
        {t('backToIndex')}
      </Link>

      <header className="mt-4 flex items-start gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-paint/25 text-paint-deep">
          <GuideIcon name={topic.icon} className="size-7" />
        </span>

        <div className="min-w-0">
          <h1 className="font-display text-3xl font-900 tracking-tight sm:text-4xl">
            {topic.title}
          </h1>
          <p className="mt-1 text-sm font-800 text-muted">
            {t('entryCount', { count: topic.entries.length })}
          </p>
        </div>
      </header>

      {topic.summary && (
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted">{topic.summary}</p>
      )}

      {/* Reading is only half of it. A heading tied to a clue type sends the
          reader straight into the cards that ask about it. */}
      {topic.category && (
        <Link href={`/play/practice?category=${topic.category}`} className="btn btn-go mt-6">
          {t('practice')}
        </Link>
      )}

      {topic.entries.length === 0 ? (
        <p className="card-raised mt-10 px-6 py-12 text-center text-sm text-muted">
          {t('topicEmpty')}
        </p>
      ) : (
        <ol className="mt-10 grid gap-4 lg:grid-cols-2">
          {topic.entries.map((entry, index) => (
            <li key={entry.id} className="rise-in" style={{ animationDelay: `${index * 45}ms` }}>
              <Link
                href={`/guides/${topic.slug}/${entry.slug}`}
                className="card-raised card-lift flex h-full gap-4 overflow-hidden"
              >
                {entry.coverImageUrl && (
                  <span className="relative hidden w-32 shrink-0 bg-canvas sm:block">
                    <Image
                      src={entry.coverImageUrl}
                      alt=""
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  </span>
                )}

                <span className="min-w-0 flex-1 px-5 py-5">
                  <span className="eyebrow">{t('step', { number: index + 1 })}</span>
                  <span className="mt-1.5 block font-display text-lg font-900 tracking-tight">
                    {entry.title}
                  </span>
                  {entry.excerpt && (
                    <span className="mt-2 block text-sm leading-relaxed text-muted">
                      {entry.excerpt}
                    </span>
                  )}
                  <span className="eyebrow mt-3 block">
                    {t('readingTime', { minutes: entry.readingTime })}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

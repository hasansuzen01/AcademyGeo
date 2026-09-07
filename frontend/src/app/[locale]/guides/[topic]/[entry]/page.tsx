import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { fetchSiteSeo } from '@/lib/content-api';
import { fetchGuideEntry } from '@/lib/guides-api';
import { toJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/metadata';

interface RouteParams {
  params: Promise<{ locale: string; topic: string; entry: string }>;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { locale, topic, entry: slug } = await params;
  const [reading, site] = await Promise.all([
    fetchGuideEntry(locale, topic, slug),
    fetchSiteSeo(),
  ]);

  if (!reading) return {};

  const { entry } = reading;

  return buildMetadata({
    site,
    path: `/${locale}/guides/${topic}/${entry.slug}`,
    title: entry.metaTitle || entry.title,
    description: entry.metaDescription || entry.excerpt,
    keywords: entry.keywords,
    canonical: entry.canonicalUrl ?? undefined,
    robots: entry.robotsMeta,
    image: entry.coverImageUrl,
    locales: [locale],
    type: 'article',
    publishedTime: entry.publishedAt ?? undefined,
  });
}

/** One article, and the one that follows it. */
export default async function GuideEntryPage({ params }: RouteParams) {
  const { locale, topic: topicSlug, entry: entrySlug } = await params;
  setRequestLocale(locale);

  const [reading, site, t] = await Promise.all([
    fetchGuideEntry(locale, topicSlug, entrySlug),
    fetchSiteSeo(),
    getTranslations({ locale, namespace: 'guides' }),
  ]);

  if (!reading) notFound();

  const { entry, topic, next } = reading;
  const root = site.siteUrl.replace(/\/+$/, '');
  const country = entry.country && (locale === 'tr' ? entry.country.nameTr : entry.country.nameEn);

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: entry.title,
    description: entry.metaDescription || entry.excerpt || undefined,
    datePublished: entry.publishedAt ?? undefined,
    dateModified: entry.updatedAt,
    inLanguage: locale,
    mainEntityOfPage: `${root}/${locale}/guides/${topic.slug}/${entry.slug}`,
    isPartOf: { '@type': 'CollectionPage', name: topic.title },
    ...(entry.coverImageUrl ? { image: entry.coverImageUrl } : {}),
  };

  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(article) }} />

      <Link
        href={`/guides/${topic.slug}`}
        className="text-sm font-800 text-muted transition-colors hover:text-ink"
      >
        {t('backToTopic', { topic: topic.title })}
      </Link>

      <h1 className="mt-4 font-display text-3xl font-900 leading-tight tracking-tight sm:text-4xl">
        {entry.title}
      </h1>

      <p className="eyebrow mt-3">
        {t('readingTime', { minutes: entry.readingTime })}
        {country ? ` · ${entry.country?.flagEmoji ?? ''} ${country}` : ''}
      </p>

      {entry.coverImageUrl && (
        <span className="relative mt-8 block aspect-[16/9] overflow-hidden rounded-card bg-canvas">
          <Image
            src={entry.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </span>
      )}

      {/* The body is cleaned by the API before it is stored. */}
      <div className="prose-card mt-10" dangerouslySetInnerHTML={{ __html: entry.content }} />

      {/* Reading about a country is the moment to go and look at it. */}
      {entry.country && (
        <Link
          href={`/atlas/${entry.country.code.toLowerCase()}`}
          className="card-raised card-lift mt-10 flex items-center gap-4 p-5"
        >
          <span className="text-3xl leading-none" aria-hidden>
            {entry.country.flagEmoji ?? '🌍'}
          </span>
          <span className="min-w-0 flex-1">
            <span className="eyebrow">{t('inTheAtlas')}</span>
            <span className="mt-1 block font-display text-lg font-900 tracking-tight">
              {country}
            </span>
          </span>
          <ArrowRight className="size-5 shrink-0 text-muted" aria-hidden />
        </Link>
      )}

      {/* Finishing an article is when a reader is most willing to start
          another, so the heading offers the one that follows. */}
      {next && (
        <Link
          href={`/guides/${topic.slug}/${next.slug}`}
          className="card-raised card-lift mt-4 flex items-center gap-4 p-5"
        >
          <span className="min-w-0 flex-1">
            <span className="eyebrow">{t('readNext')}</span>
            <span className="mt-1 block font-display text-lg font-900 tracking-tight">
              {next.title}
            </span>
          </span>
          <ArrowRight className="size-5 shrink-0 text-muted" aria-hidden />
        </Link>
      )}
    </article>
  );
}

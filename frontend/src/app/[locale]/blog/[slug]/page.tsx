import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { fetchPost, fetchSiteSeo } from '@/lib/content-api';
import { toJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/metadata';

interface RouteParams {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const [post, site] = await Promise.all([fetchPost(locale, slug), fetchSiteSeo()]);

  if (!post) return {};

  return buildMetadata({
    site,
    path: `/${locale}/blog/${post.slug}`,
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords,
    canonical: post.canonicalUrl ?? undefined,
    robots: post.robotsMeta,
    image: post.ogImageUrl ?? post.coverImageUrl,
    locales: [post.locale],
    type: 'article',
    publishedTime: post.publishedAt ?? undefined,
  });
}

export default async function BlogPost({ params }: RouteParams) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [post, site, t] = await Promise.all([
    fetchPost(locale, slug),
    fetchSiteSeo(),
    getTranslations({ locale, namespace: 'blog' }),
  ]);

  if (!post) notFound();

  const root = site.siteUrl.replace(/\/+$/, '');
  const article = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription || post.excerpt || undefined,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt,
    inLanguage: post.locale,
    mainEntityOfPage: `${root}/${locale}/blog/${post.slug}`,
    ...(post.author?.name ? { author: { '@type': 'Person', name: post.author.name } } : {}),
    ...(post.coverImageUrl ? { image: post.coverImageUrl } : {}),
  };

  return (
    <article className="mx-auto max-w-3xl px-5 py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(article) }} />

      <Link href="/blog" className="eyebrow text-muted transition-colors hover:text-ink">
        {t('backToList')}
      </Link>

      <h1 className="mt-4 font-display text-4xl font-900 leading-tight tracking-tight">
        {post.title}
      </h1>
      <p className="eyebrow mt-3">
        {t('readingTime', { minutes: post.readingTime })}
        {post.publishedAt ? ` · ${new Date(post.publishedAt).toLocaleDateString(locale)}` : ''}
        {post.author?.name ? ` · ${post.author.name}` : ''}
      </p>

      {post.coverImageUrl && (
        <span className="relative mt-8 block aspect-[16/9] overflow-hidden rounded-card bg-canvas">
          <Image
            src={post.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </span>
      )}

      {/* The body is cleaned by the API before it is stored. */}
      <div className="prose-card mt-10" dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

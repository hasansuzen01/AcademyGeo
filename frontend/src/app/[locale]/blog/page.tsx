import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { fetchPosts, fetchSiteSeo } from '@/lib/content-api';
import { buildMetadata } from '@/lib/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [site, t] = await Promise.all([
    fetchSiteSeo(),
    getTranslations({ locale, namespace: 'blog' }),
  ]);

  return buildMetadata({
    site,
    path: `/${locale}/blog`,
    title: t('metaTitle'),
    description: t('metaDescription'),
  });
}

export default async function BlogIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [posts, t] = await Promise.all([
    fetchPosts(locale),
    getTranslations({ locale, namespace: 'blog' }),
  ]);

  return (
    <div className="page-shell px-5 py-14">
      <h1 className="font-display text-4xl font-900 tracking-tight">{t('title')}</h1>
      <p className="mt-3 max-w-2xl text-muted">{t('intro')}</p>

      {posts.length === 0 ? (
        <p className="card-raised mt-10 px-6 py-12 text-center text-muted">{t('empty')}</p>
      ) : (
        <ul className="mt-10 grid gap-5 lg:grid-cols-2">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="card-raised flex gap-5 overflow-hidden transition-transform hover:-translate-y-0.5"
              >
                {post.coverImageUrl && (
                  <span className="relative hidden w-40 shrink-0 bg-canvas sm:block">
                    <Image
                      src={post.coverImageUrl}
                      alt=""
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  </span>
                )}
                <span className="min-w-0 flex-1 px-5 py-5">
                  <span className="block font-display text-xl font-900 tracking-tight">
                    {post.title}
                  </span>
                  {post.excerpt && (
                    <span className="mt-2 block text-sm leading-relaxed text-muted">
                      {post.excerpt}
                    </span>
                  )}
                  <span className="eyebrow mt-3 block">
                    {t('readingTime', { minutes: post.readingTime })}
                    {post.publishedAt
                      ? ` · ${new Date(post.publishedAt).toLocaleDateString(locale)}`
                      : ''}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

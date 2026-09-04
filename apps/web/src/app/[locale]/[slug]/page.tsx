import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { fetchPage, fetchSiteSeo } from '@/lib/content-api';
import { buildMetadata } from '@/lib/metadata';

/**
 * A standing page reached from the footer.
 *
 * This is the last route Next tries under a locale: /play, /blog, /admin and
 * the rest are static segments and win over this one, so only an address that
 * matches nothing else reaches here.
 */
interface RouteParams {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const [page, site] = await Promise.all([fetchPage(locale, slug), fetchSiteSeo()]);

  if (!page) return {};

  return buildMetadata({
    site,
    path: `/${locale}/${page.slug}`,
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.excerpt,
    canonical: page.canonicalUrl ?? undefined,
    robots: page.robotsMeta,
    locales: [page.locale],
  });
}

export default async function StandingPage({ params }: RouteParams) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const page = await fetchPage(locale, slug);
  if (!page) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="font-display text-4xl font-900 leading-tight tracking-tight">{page.title}</h1>
      {page.excerpt && <p className="mt-3 text-muted">{page.excerpt}</p>}

      {/* The body is cleaned by the API before it is stored. */}
      <div className="prose-card mt-10" dangerouslySetInnerHTML={{ __html: page.content }} />

      <p className="eyebrow mt-12 border-t border-line pt-5">
        {new Date(page.updatedAt).toLocaleDateString(locale)}
      </p>
    </article>
  );
}

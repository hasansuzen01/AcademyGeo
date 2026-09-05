import type { MetadataRoute } from 'next';

import { locales } from '@/i18n/routing';

export interface SitemapRow {
  locale: string;
  slug: string;
  updatedAt: string;
}

/**
 * Addresses defined in code that are worth indexing, one per language.
 *
 * Practice, progress, the profile and the admin panel are deliberately absent:
 * they need an account, so a crawler following them only reaches a sign-in
 * prompt. robots.txt blocks the admin panel too, and listing a blocked address
 * here would send search engines two contradictory signals.
 */
const STATIC_PATHS: { path: string; priority: number }[] = [
  { path: '', priority: 1 },
  { path: '/atlas', priority: 0.9 },
  { path: '/collections', priority: 0.7 },
  { path: '/blog', priority: 0.8 },
];

/** Every address the site wants indexed, in the shape Next serves. */
export function buildSitemap(
  siteUrl: string,
  posts: SitemapRow[],
  pages: SitemapRow[],
  now: Date,
  /** Country codes with an atlas page. Empty when the API is unreachable. */
  countryCodes: string[] = [],
): MetadataRoute.Sitemap {
  const root = siteUrl.replace(/\/+$/, '');
  const entries = new Map<string, MetadataRoute.Sitemap[number]>();

  const add = (url: string, lastModified: Date, priority: number) => {
    if (!entries.has(url)) entries.set(url, { url, lastModified, priority });
  };

  for (const locale of locales) {
    for (const route of STATIC_PATHS) {
      add(`${root}/${locale}${route.path}`, now, route.priority);
    }
  }

  // The atlas is the site's reference half, open to everyone, and it is the
  // part a search for "what country has yellow bollards" should land on.
  for (const locale of locales) {
    for (const code of countryCodes) {
      add(`${root}/${locale}/atlas/${code.toLowerCase()}`, now, 0.6);
    }
  }

  for (const post of posts) {
    add(`${root}/${post.locale}/blog/${post.slug}`, new Date(post.updatedAt), 0.7);
  }

  for (const page of pages) {
    add(`${root}/${page.locale}/${page.slug}`, new Date(page.updatedAt), 0.4);
  }

  return [...entries.values()];
}

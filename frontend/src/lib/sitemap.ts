import type { MetadataRoute } from 'next';

import { locales } from '@/i18n/routing';

export interface SitemapRow {
  locale: string;
  slug: string;
  updatedAt: string;
}

/** A guide heading, or one entry under it when `entrySlug` is filled in. */
export interface GuideSitemapRow extends SitemapRow {
  entrySlug?: string | null;
}

export interface SitemapSources {
  siteUrl: string;
  now: Date;
  posts?: SitemapRow[];
  pages?: SitemapRow[];
  /** Country codes with an atlas page. Empty when the API is unreachable. */
  countryCodes?: string[];
  guides?: GuideSitemapRow[];
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
  { path: '/guides', priority: 0.9 },
  { path: '/collections', priority: 0.7 },
  { path: '/blog', priority: 0.8 },
];

/** Every address the site wants indexed, in the shape Next serves. */
export function buildSitemap({
  siteUrl,
  now,
  posts = [],
  pages = [],
  countryCodes = [],
  guides = [],
}: SitemapSources): MetadataRoute.Sitemap {
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

  // The library answers the question a search actually asks, so its entries
  // are ranked above a blog post rather than below one.
  for (const guide of guides) {
    const path = guide.entrySlug ? `${guide.slug}/${guide.entrySlug}` : guide.slug;
    add(`${root}/${guide.locale}/guides/${path}`, new Date(guide.updatedAt), 0.8);
  }

  for (const page of pages) {
    add(`${root}/${page.locale}/${page.slug}`, new Date(page.updatedAt), 0.4);
  }

  return [...entries.values()];
}

import 'server-only';

import { SERVER_API_URL } from './api-base';

export interface PostCard {
  id: string;
  locale: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  readingTime: number;
  publishedAt: string | null;
}

export interface Post extends PostCard {
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string;
  canonicalUrl: string | null;
  robotsMeta: string;
  ogImageUrl: string | null;
  updatedAt: string;
  author: { name: string; image: string | null } | null;
}

export interface FooterLink {
  slug: string;
  title: string;
  footerOrder: number;
}

export interface SitePage {
  locale: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  robotsMeta: string;
  updatedAt: string;
}

export interface SiteSeo {
  siteName: string;
  siteUrl: string;
  siteDescription: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultKeywords: string;
  defaultOgImageUrl: string | null;
  defaultRobotsMeta: string;
  sitemapEnabled: boolean;
  googleSiteVerification: string | null;
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
  bingSiteVerification: string | null;
  twitterSite: string | null;
  organisationName: string;
  organisationLogo: string | null;
  contactEmail: string | null;
}

const FALLBACK_SEO: SiteSeo = {
  siteName: 'AcademyGeo',
  siteUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  siteDescription: '',
  defaultMetaTitle: '',
  defaultMetaDescription: '',
  defaultKeywords: '',
  defaultOgImageUrl: null,
  defaultRobotsMeta: 'index,follow',
  sitemapEnabled: true,
  googleSiteVerification: null,
  googleAnalyticsId: null,
  googleTagManagerId: null,
  bingSiteVerification: null,
  twitterSite: null,
  organisationName: 'AcademyGeo',
  organisationLogo: null,
  contactEmail: null,
};

/**
 * Reads from the API, answering null rather than throwing.
 *
 * A page that cannot reach the API should render what it can. The one place
 * this must not silently pass is the settings read, which falls back to a
 * conservative default instead.
 */
async function read<T>(path: string, revalidate: number): Promise<T | null> {
  try {
    const response = await fetch(`${SERVER_API_URL}/api${path}`, { next: { revalidate } });

    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

export async function fetchPosts(locale: string): Promise<PostCard[]> {
  return (await read<PostCard[]>(`/blog?locale=${locale}`, 60)) ?? [];
}

export async function fetchPost(locale: string, slug: string): Promise<Post | null> {
  return read<Post>(`/blog/${locale}/${encodeURIComponent(slug)}`, 60);
}

export async function fetchFooterLinks(locale: string): Promise<FooterLink[]> {
  return (await read<FooterLink[]>(`/pages?locale=${locale}`, 300)) ?? [];
}

export async function fetchPage(locale: string, slug: string): Promise<SitePage | null> {
  return read<SitePage>(`/pages/${locale}/${encodeURIComponent(slug)}`, 300);
}

export async function fetchSiteSeo(): Promise<SiteSeo> {
  return (await read<SiteSeo>('/seo/public', 300)) ?? FALLBACK_SEO;
}

import 'server-only';

import { readPublic } from './api-base';

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

/** Someone who bought the site a coffee and chose to be shown. */
export interface Supporter {
  id: number;
  /** Null when they left the name out: shown as "someone". */
  name: string | null;
  note: string | null;
  coffees: number;
  createdAt: string | null;
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
  supportUrl: string | null;
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
  supportUrl: null,
};

// Every read here answers null rather than throwing, so a page that cannot
// reach the API still renders what it can. The settings read is the one that
// must not silently pass, and it falls back to a conservative default.

export async function fetchPosts(locale: string): Promise<PostCard[]> {
  return (await readPublic<PostCard[]>(`/blog?locale=${locale}`, 60)) ?? [];
}

export async function fetchPost(locale: string, slug: string): Promise<Post | null> {
  return readPublic<Post>(`/blog/${locale}/${encodeURIComponent(slug)}`, 60);
}

export async function fetchFooterLinks(locale: string): Promise<FooterLink[]> {
  return (await readPublic<FooterLink[]>(`/pages?locale=${locale}`, 300)) ?? [];
}

export async function fetchPage(locale: string, slug: string): Promise<SitePage | null> {
  return readPublic<SitePage>(`/pages/${locale}/${encodeURIComponent(slug)}`, 300);
}

export async function fetchSupporters(): Promise<Supporter[]> {
  return (await readPublic<Supporter[]>('/supporters', 300)) ?? [];
}

export async function fetchSiteSeo(): Promise<SiteSeo> {
  return (await readPublic<SiteSeo>('/seo/public', 300)) ?? FALLBACK_SEO;
}

import type { Metadata } from 'next';

import { locales } from '@/i18n/routing';

/** The site-wide settings this builder reads. */
export interface MetadataSite {
  siteName: string;
  siteUrl: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultKeywords: string;
  defaultOgImageUrl: string | null;
  defaultRobotsMeta: string;
  twitterSite: string | null;
}

export interface MetadataInput {
  site: MetadataSite;
  /**
   * The path this page is served at, starting with the locale. Left out by a
   * layout: its tags are inherited by every page beneath it, and an address
   * there would call each of those pages a copy of the layout's own.
   */
  path?: string;
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  robots?: string;
  image?: string | null;
  /**
   * The languages this page genuinely exists in. Defaults to all of them,
   * which is right for pages defined in code; a post written in one language
   * passes only that one.
   */
  locales?: readonly string[];
  type?: 'website' | 'article';
  publishedTime?: string;
}

/**
 * The head tags for one page.
 *
 * Everything falls back to the site-wide setting, so a page that says nothing
 * still describes itself rather than inheriting whatever Next guesses. The
 * canonical link is always filled in: the same article is reachable through
 * more than one address, and untold search engines treat those as rivals.
 */
export function buildMetadata({
  site,
  path,
  title,
  description,
  keywords,
  canonical,
  robots,
  image,
  locales: available = locales,
  type = 'website',
  publishedTime,
}: MetadataInput): Metadata {
  const root = site.siteUrl.replace(/\/+$/, '');
  const resolvedTitle = title || site.defaultMetaTitle || site.siteName;
  const resolvedDescription = description || site.defaultMetaDescription || undefined;
  const rule = parseRobots(robots || site.defaultRobotsMeta);
  // A link shared without a picture shows up as a bare line of text, so the
  // image in /public, in the page's language, stands in until the panel names
  // a better one.
  const picture =
    image ||
    site.defaultOgImageUrl ||
    `${root}/og-default${path?.startsWith('/tr') ? '-tr' : ''}.png`;

  // Same path in the other language, so a reader landing from search can be
  // offered the version they can actually read. Only languages the page is
  // really written in: an address that 404s is worse than no alternate.
  const alternates =
    path === undefined
      ? undefined
      : {
          canonical: canonical || `${root}${path}`,
          languages: Object.fromEntries(
            available.map((locale) => [locale, `${root}${swapLocale(path, locale)}`]),
          ),
        };

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    keywords: keywords || site.defaultKeywords || undefined,
    ...(alternates ? { alternates } : {}),
    robots: rule,
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      siteName: site.siteName,
      ...(path === undefined ? {} : { url: `${root}${path}` }),
      type,
      ...(publishedTime ? { publishedTime } : {}),
      images: [picture],
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
      ...(site.twitterSite ? { site: site.twitterSite } : {}),
      images: [picture],
    },
  };
}

/**
 * For pages that only make sense to the person signed in: progress, the
 * account, a run in play. There is nothing on them for a search result.
 */
export const NOT_FOR_SEARCH: Metadata = { robots: { index: false, follow: true } };

/** "index,follow" and friends, as Next wants them. */
function parseRobots(value: string): { index: boolean; follow: boolean } {
  const parts = value
    .toLowerCase()
    .split(',')
    .map((part) => part.trim());

  return { index: !parts.includes('noindex'), follow: !parts.includes('nofollow') };
}

function swapLocale(path: string, locale: string): string {
  const rest = path.replace(new RegExp(`^/(${locales.join('|')})`), '');

  return `/${locale}${rest}`;
}

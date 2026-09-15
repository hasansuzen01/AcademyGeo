import type { MetadataRoute } from 'next';
import { SERVER_API_URL } from '@/lib/api-base';

/**
 * robots.txt at the site root, where crawlers look for it.
 *
 * The text itself is built by the API from the settings an admin edits, so
 * there is one place that decides what is crawlable. Read on every request:
 * this file is fetched rarely, but a stale copy of a rule that closes the site
 * to crawlers is expensive in exactly the wrong moment.
 */
export const dynamic = 'force-dynamic';

// A copy of the API's list in backend/src/content/robots.ts, used when it is down.
const FALLBACK_DISALLOW = ['/admin', '/api', '/sign-in', '/*/admin', '/*/sign-in'];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const text = await fetchRobotsText();
  if (!text) return { rules: { userAgent: '*', allow: '/', disallow: FALLBACK_DISALLOW } };

  const lines = text.split('\n').map((line) => line.trim());
  const valuesFor = (directive: string) =>
    lines
      .filter((line) => line.toLowerCase().startsWith(`${directive}:`))
      .map((line) => line.slice(line.indexOf(':') + 1).trim())
      .filter(Boolean);

  const disallow = valuesFor('disallow');
  const allow = valuesFor('allow');
  const sitemap = valuesFor('sitemap')[0];

  // "Crawl nothing" and a sitemap address in the same file contradict each
  // other, so the address is left out when everything is closed.
  const blocksEverything = disallow.includes('/') && allow.length === 0;

  const rules = {
    userAgent: '*',
    ...(blocksEverything ? {} : { allow: allow.length > 0 ? allow : '/' }),
    disallow: disallow.length > 0 ? disallow : FALLBACK_DISALLOW,
  };

  return blocksEverything || !sitemap ? { rules } : { rules, sitemap };
}

async function fetchRobotsText(): Promise<string | null> {
  try {
    const response = await fetch(`${SERVER_API_URL}/api/seo/robots.txt`, { cache: 'no-store' });

    return response.ok ? await response.text() : null;
  } catch {
    return null;
  }
}

export interface RobotsSettings {
  siteUrl: string;
  /** Hand-written file. Replaces the generated default when filled in. */
  robotsTxt: string | null;
  blockIndexingOutsideProduction: boolean;
  sitemapEnabled: boolean;
}

/**
 * Surfaces that should never appear in search results. Pages sit under a
 * locale, so the /*\/ forms are the ones that match them. The web app keeps a
 * copy of this list as its fallback, in frontend/src/app/robots.ts.
 */
const DISALLOWED = ['/admin', '/api', '/sign-in', '/*/admin', '/*/sign-in'];

const BLOCK_EVERYTHING = `User-agent: *
Disallow: /

# Not production, so nothing here should be indexed.
`;

/**
 * The robots.txt served at the site root.
 *
 * The environment check comes before the hand-written file on purpose. The
 * settings row is created with a filled-in file, so checking the file first
 * would quietly disable the protection from the first save onward, while the
 * switch kept showing as on in the admin panel.
 */
export function buildRobotsTxt(settings: RobotsSettings, nodeEnv: string | undefined): string {
  if (settings.blockIndexingOutsideProduction && nodeEnv !== 'production') {
    return BLOCK_EVERYTHING;
  }

  if (settings.robotsTxt) return settings.robotsTxt;

  const root = settings.siteUrl.replace(/\/+$/, '');
  const lines = ['User-agent: *', 'Allow: /', '', ...DISALLOWED.map((path) => `Disallow: ${path}`)];

  if (settings.sitemapEnabled) lines.push('', `Sitemap: ${root}/sitemap.xml`);

  return `${lines.join('\n')}\n`;
}

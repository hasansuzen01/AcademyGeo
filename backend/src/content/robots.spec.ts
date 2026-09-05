import { describe, expect, it } from 'vitest';

import { buildRobotsTxt } from './robots.js';

const settings = {
  siteUrl: 'https://academygeo.com',
  robotsTxt: null,
  blockIndexingOutsideProduction: true,
  sitemapEnabled: true,
};

describe('buildRobotsTxt', () => {
  it('keeps crawlers away from the admin panel and the API', () => {
    const text = buildRobotsTxt(settings, 'production');

    expect(text).toContain('Disallow: /admin');
    expect(text).toContain('Disallow: /api');
  });

  it('points crawlers at the sitemap', () => {
    expect(buildRobotsTxt(settings, 'production')).toContain(
      'Sitemap: https://academygeo.com/sitemap.xml',
    );
  });

  it('drops a trailing slash on the site address rather than doubling it', () => {
    const text = buildRobotsTxt({ ...settings, siteUrl: 'https://academygeo.com/' }, 'production');

    expect(text).toContain('https://academygeo.com/sitemap.xml');
  });

  it('leaves out the sitemap line when sitemaps are switched off', () => {
    const text = buildRobotsTxt({ ...settings, sitemapEnabled: false }, 'production');

    expect(text).not.toContain('Sitemap:');
  });

  // A staging copy indexed alongside the real site competes with it for the
  // same searches, and the duplicate is hard to get removed afterwards.
  it('blocks everything outside production', () => {
    const text = buildRobotsTxt(settings, 'development');

    expect(text).toContain('Disallow: /');
    expect(text).not.toContain('Sitemap:');
  });

  it('respects an operator who turns that protection off', () => {
    const text = buildRobotsTxt(
      { ...settings, blockIndexingOutsideProduction: false },
      'development',
    );

    expect(text).toContain('Allow: /');
  });

  it('prefers a hand-written file over the generated one', () => {
    const text = buildRobotsTxt(
      { ...settings, robotsTxt: 'User-agent: *\nAllow: /only-this' },
      'production',
    );

    expect(text).toBe('User-agent: *\nAllow: /only-this');
  });

  // The environment check has to win, or the first save of the settings row
  // silently disables it and nobody notices.
  it('still blocks a non-production environment when a file is written', () => {
    const text = buildRobotsTxt(
      { ...settings, robotsTxt: 'User-agent: *\nAllow: /' },
      'development',
    );

    expect(text).toContain('Disallow: /');
  });
});

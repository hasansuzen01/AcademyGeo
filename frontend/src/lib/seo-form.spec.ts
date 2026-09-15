import { describe, expect, it } from 'vitest';

import type { SeoSettings } from './admin-api';
import { toSeoForm } from './seo-form';

const row = {
  id: 'site',
  siteName: 'AcademyGeo',
  siteUrl: 'https://academygeo.com',
  siteDescription: 'Practise the static clues.',
  defaultMetaTitle: 'AcademyGeo',
  defaultMetaDescription: 'Spaced repetition for the clues that decide a round.',
  defaultKeywords: 'geoguessr',
  defaultOgImageUrl: null,
  robotsTxt: null,
  defaultRobotsMeta: 'index,follow',
  blockIndexingOutsideProduction: true,
  sitemapEnabled: true,
  googleSiteVerification: null,
  googleAnalyticsId: null,
  googleTagManagerId: null,
  bingSiteVerification: null,
  twitterSite: null,
  organisationName: 'AcademyGeo',
  organisationLogo: null,
  contactEmail: null,
  updatedAt: '2026-09-15T11:00:00.000Z',
} as SeoSettings & { id: string };

describe('toSeoForm', () => {
  // The API rejects any field it does not accept. The editor used to send the
  // row back as it was read, id and timestamp included, and every save failed.
  it('leaves out the row id and timestamp the API refuses', () => {
    const form = toSeoForm(row);

    expect(form).not.toHaveProperty('id');
    expect(form).not.toHaveProperty('updatedAt');
  });

  it('keeps every setting the editor can change', () => {
    const settings: Record<string, unknown> = { ...row };
    delete settings.id;
    delete settings.updatedAt;

    expect(toSeoForm(row)).toEqual(settings);
  });
});

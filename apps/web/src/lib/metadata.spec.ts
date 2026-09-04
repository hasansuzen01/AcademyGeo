import { describe, expect, it } from 'vitest';

import { buildMetadata } from './metadata';

const site = {
  siteName: 'AcademyGeo',
  siteUrl: 'https://academygeo.com',
  defaultMetaTitle: 'Learn the clues',
  defaultMetaDescription: 'Practice the static clues in a round.',
  defaultKeywords: 'geoguessr, plates',
  defaultOgImageUrl: 'https://cdn.example/default.png',
  defaultRobotsMeta: 'index,follow',
  twitterSite: '@academygeo',
};

describe('buildMetadata', () => {
  it('uses the page title when there is one', () => {
    const meta = buildMetadata({ site, path: '/en/blog', title: 'Blog' });

    expect(meta.title).toBe('Blog');
  });

  it('falls back to the site default when a page has no title of its own', () => {
    const meta = buildMetadata({ site, path: '/en' });

    expect(meta.title).toBe('Learn the clues');
  });

  it('falls back to the site name when even the default is blank', () => {
    const meta = buildMetadata({ site: { ...site, defaultMetaTitle: '' }, path: '/en' });

    expect(meta.title).toBe('AcademyGeo');
  });

  // Two addresses showing the same article split its standing in search
  // results, so every page names the one that counts.
  it('points the canonical link at the page it is on', () => {
    const meta = buildMetadata({ site, path: '/en/blog/reading-bollards' });

    expect(meta.alternates?.canonical).toBe('https://academygeo.com/en/blog/reading-bollards');
  });

  it('lets a page override its canonical address', () => {
    const meta = buildMetadata({ site, path: '/en/x', canonical: 'https://elsewhere.example/x' });

    expect(meta.alternates?.canonical).toBe('https://elsewhere.example/x');
  });

  it('offers the other language as an alternate', () => {
    const meta = buildMetadata({ site, path: '/en/blog' });

    expect(meta.alternates?.languages).toEqual({
      en: 'https://academygeo.com/en/blog',
      tr: 'https://academygeo.com/tr/blog',
    });
  });

  // A post exists in the language it was written in and nowhere else, so
  // claiming a translation points search engines at an address that 404s.
  it('claims no translation when the page exists in one language only', () => {
    const meta = buildMetadata({ site, path: '/tr/blog/norvec-dubalari', locales: ['tr'] });

    expect(meta.alternates?.languages).toEqual({
      tr: 'https://academygeo.com/tr/blog/norvec-dubalari',
    });
  });

  it('reads a page-level robots rule', () => {
    const meta = buildMetadata({ site, path: '/en/x', robots: 'noindex,nofollow' });

    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it('falls back to the site robots rule', () => {
    expect(buildMetadata({ site, path: '/en' }).robots).toEqual({ index: true, follow: true });
  });

  it('shares the page picture when it has one', () => {
    const meta = buildMetadata({ site, path: '/en/x', image: 'https://cdn.example/post.png' });

    expect(meta.openGraph?.images).toEqual(['https://cdn.example/post.png']);
  });

  it('shares the site picture when the page has none', () => {
    expect(buildMetadata({ site, path: '/en' }).openGraph?.images).toEqual([
      'https://cdn.example/default.png',
    ]);
  });

  it('leaves the picture out entirely when neither is set', () => {
    const meta = buildMetadata({ site: { ...site, defaultOgImageUrl: null }, path: '/en' });

    expect(meta.openGraph?.images).toBeUndefined();
  });

  it('does not double the slash when the site address ends in one', () => {
    const meta = buildMetadata({
      site: { ...site, siteUrl: 'https://academygeo.com/' },
      path: '/en',
    });

    expect(meta.alternates?.canonical).toBe('https://academygeo.com/en');
  });
});

import { describe, expect, it } from 'vitest';

import { buildSitemap } from './sitemap';

const now = new Date('2026-09-04T12:00:00.000Z');
const post = { locale: 'en', slug: 'reading-bollards', updatedAt: '2026-09-01T00:00:00.000Z' };
const page = { locale: 'tr', slug: 'gizlilik', updatedAt: '2026-08-20T00:00:00.000Z' };

function urls(entries: { url: string }[]): string[] {
  return entries.map((entry) => entry.url);
}

describe('buildSitemap', () => {
  it('lists the landing page in both languages', () => {
    const listed = urls(buildSitemap({ siteUrl: 'https://academygeo.com', now }));

    expect(listed).toContain('https://academygeo.com/en');
    expect(listed).toContain('https://academygeo.com/tr');
  });

  // The practice screen and the dashboard need an account, so a crawler that
  // follows them only ever sees a sign-in prompt.
  it('leaves out the pages that need an account', () => {
    const listed = urls(buildSitemap({ siteUrl: 'https://academygeo.com', now }));

    expect(listed.some((url) => url.includes('/play'))).toBe(false);
    expect(listed.some((url) => url.includes('/dashboard'))).toBe(false);
    expect(listed.some((url) => url.includes('/admin'))).toBe(false);
  });

  it('files a post under the language it was written in', () => {
    const listed = urls(buildSitemap({ siteUrl: 'https://academygeo.com', now, posts: [post] }));

    expect(listed).toContain('https://academygeo.com/en/blog/reading-bollards');
    expect(listed).not.toContain('https://academygeo.com/tr/blog/reading-bollards');
  });

  it('files a footer page at the site root', () => {
    const listed = urls(buildSitemap({ siteUrl: 'https://academygeo.com', now, pages: [page] }));

    expect(listed).toContain('https://academygeo.com/tr/gizlilik');
  });

  it('reports when each entry last changed', () => {
    const entry = buildSitemap({ siteUrl: 'https://academygeo.com', now, posts: [post] }).find((row) =>
      row.url.endsWith('/reading-bollards'),
    );

    expect(entry?.lastModified).toEqual(new Date(post.updatedAt));
  });

  it('does not double the slash when the site address ends in one', () => {
    const listed = urls(buildSitemap({ siteUrl: 'https://academygeo.com/', now }));

    expect(listed).toContain('https://academygeo.com/en');
  });

  it('lists no address twice', () => {
    const listed = urls(buildSitemap({ siteUrl: 'https://academygeo.com', now, posts: [post, post], pages: [page] }));

    expect(new Set(listed).size).toBe(listed.length);
  });
});

describe('the atlas', () => {
  it('lists the index in every language', () => {
    const listed = urls(buildSitemap({ siteUrl: 'https://academygeo.com', now }));

    expect(listed).toContain('https://academygeo.com/en/atlas');
    expect(listed).toContain('https://academygeo.com/tr/atlas');
  });

  it('lists a country page in every language', () => {
    const listed = urls(buildSitemap({ siteUrl: 'https://academygeo.com', now, countryCodes: ['TR'] }));

    expect(listed).toContain('https://academygeo.com/en/atlas/tr');
    expect(listed).toContain('https://academygeo.com/tr/atlas/tr');
  });
});

describe('the guide library', () => {
  const topic = { locale: 'tr', slug: 'elektrik-direkleri', updatedAt: '2026-09-02T00:00:00.000Z' };
  const entry = { ...topic, entrySlug: 'ahsap-direkler' };

  it('lists the library index in every language', () => {
    const listed = urls(buildSitemap({ siteUrl: 'https://academygeo.com', now }));

    expect(listed).toContain('https://academygeo.com/tr/guides');
    expect(listed).toContain('https://academygeo.com/en/guides');
  });

  it('lists a heading under the language it was written in', () => {
    const listed = urls(buildSitemap({ siteUrl: 'https://academygeo.com', now, guides: [topic] }));

    expect(listed).toContain('https://academygeo.com/tr/guides/elektrik-direkleri');
    expect(listed).not.toContain('https://academygeo.com/en/guides/elektrik-direkleri');
  });

  it('lists an entry under its heading', () => {
    const listed = urls(buildSitemap({ siteUrl: 'https://academygeo.com', now, guides: [entry] }));

    expect(listed).toContain('https://academygeo.com/tr/guides/elektrik-direkleri/ahsap-direkler');
  });
});

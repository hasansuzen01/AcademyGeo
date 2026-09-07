import { describe, expect, it } from 'vitest';

import { measureContent, resolvePublishedAt, sanitiseContent, toSlug } from './content.js';

describe('toSlug', () => {
  it('turns a title into an address', () => {
    expect(toSlug('Reading Norwegian bollards')).toBe('reading-norwegian-bollards');
  });

  // Turkish is half the audience, so a Turkish title has to produce a usable
  // address rather than collapsing to a row of hyphens.
  it('folds Turkish letters to their plain forms', () => {
    expect(toSlug('Türkiye plakaları: şehir kodu ve İzmir')).toBe(
      'turkiye-plakalari-sehir-kodu-ve-izmir',
    );
  });

  it('collapses punctuation and repeated spaces', () => {
    expect(toSlug('  Plates,   bollards & lines!  ')).toBe('plates-bollards-lines');
  });

  it('falls back to a usable word when nothing survives', () => {
    expect(toSlug('!!! ???')).toBe('post');
  });

  // A guide heading called "???" landing at /guides/post reads as a bug. The
  // caller knows what it is naming, so it gets to say what the fallback is.
  it('lets the caller name the fallback', () => {
    expect(toSlug('!!! ???', 'topic')).toBe('topic');
  });
});

describe('measureContent', () => {
  it('counts the words a reader actually sees, not the markup', () => {
    expect(measureContent('<p>one two three</p>').wordCount).toBe(3);
  });

  it('reads entities as spacing rather than words', () => {
    expect(measureContent('<p>one&nbsp;two&amp;three</p>').wordCount).toBe(3);
  });

  // "0 minutes to read" is not a sentence anyone wants to see.
  it('never reports less than a minute', () => {
    expect(measureContent('<p>short</p>').readingTime).toBe(1);
  });

  it('counts roughly two hundred words to the minute', () => {
    const html = `<p>${'word '.repeat(600)}</p>`;

    expect(measureContent(html).readingTime).toBe(3);
  });

  it('handles an empty body', () => {
    expect(measureContent('')).toEqual({ wordCount: 0, readingTime: 1 });
  });
});

describe('sanitiseContent', () => {
  it('keeps the formatting the editor produces', () => {
    const html =
      '<h2>Title</h2><p><strong>bold</strong> and <em>italic</em></p><ul><li>one</li></ul>';

    expect(sanitiseContent(html)).toBe(html);
  });

  it('keeps a link and its address', () => {
    expect(sanitiseContent('<p><a href="https://example.com">go</a></p>')).toContain(
      'href="https://example.com"',
    );
  });

  it('keeps a picture', () => {
    expect(sanitiseContent('<p><img src="https://example.com/a.png" alt="a" /></p>')).toContain(
      'src="https://example.com/a.png"',
    );
  });

  // Posts are written by admins but read by everyone, so a script that reaches
  // storage runs in every reader's browser.
  it('drops a script tag', () => {
    expect(sanitiseContent('<p>hi</p><script>alert(1)</script>')).toBe('<p>hi</p>');
  });

  it('drops an inline event handler', () => {
    expect(sanitiseContent('<p onclick="alert(1)">hi</p>')).toBe('<p>hi</p>');
  });

  it('drops a javascript: link', () => {
    expect(sanitiseContent('<a href="javascript:alert(1)">x</a>')).not.toContain('javascript:');
  });

  it('drops an iframe', () => {
    expect(sanitiseContent('<iframe src="https://evil.example"></iframe>')).toBe('');
  });
});

describe('resolvePublishedAt', () => {
  const now = new Date('2026-09-04T12:00:00.000Z');
  const earlier = new Date('2026-08-01T09:00:00.000Z');

  it('stamps the moment a draft first goes live', () => {
    expect(resolvePublishedAt({ existing: null, status: 'PUBLISHED', now })).toEqual(now);
  });

  // Editing a published post must not move its date to today, which would
  // reorder the feed and change what search engines were told.
  it('leaves an existing date alone', () => {
    expect(resolvePublishedAt({ existing: earlier, status: 'PUBLISHED', now })).toEqual(earlier);
  });

  it('leaves a draft without a date', () => {
    expect(resolvePublishedAt({ existing: null, status: 'DRAFT', now })).toBeNull();
  });

  it('keeps the original date when a post is pulled back to draft', () => {
    expect(resolvePublishedAt({ existing: earlier, status: 'DRAFT', now })).toEqual(earlier);
  });
});

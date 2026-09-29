import { describe, expect, it } from 'vitest';

import { PRIVACY_SUPPORT_SECTIONS, withSupportSection } from './privacy-support.ts';

const tr = PRIVACY_SUPPORT_SECTIONS.find((section) => section.locale === 'tr')!;

describe('withSupportSection', () => {
  it('puts the section in front of the children heading', () => {
    const content = '<h2>Ne saklanıyor</h2><p>a</p>\n\n<h2>Çocuklar</h2>\n<p>b</p>';
    const updated = withSupportSection(content, tr);

    expect(updated).not.toBeNull();
    expect(updated!.indexOf('Buy Me a Coffee')).toBeLessThan(updated!.indexOf('<h2>Çocuklar</h2>'));
    expect(updated).toContain('<h2>Ne saklanıyor</h2><p>a</p>');
    expect(updated).toContain('<p>b</p>');
  });

  // A page rewritten in the panel may have lost its children heading; the
  // section still gets in, at the end.
  it('adds it at the end when there is no children heading', () => {
    const updated = withSupportSection('<h2>Ne saklanıyor</h2><p>a</p>', tr);

    expect(updated?.startsWith('<h2>Ne saklanıyor</h2><p>a</p>')).toBe(true);
    expect(updated?.endsWith(tr.html.trimEnd())).toBe(true);
  });

  // The seed runs on every deploy, so a page that already speaks about
  // donations, in whatever words, is left exactly as it is.
  it('leaves a page that already mentions Buy Me a Coffee alone', () => {
    expect(withSupportSection('<p>Buy Me a Coffee üzerinden…</p>', tr)).toBeNull();
  });

  it('names what is shown, what is not, and how to be left out', () => {
    for (const section of PRIVACY_SUPPORT_SECTIONS) {
      expect(section.html).toContain('Buy Me a Coffee');
      expect(section.html).toContain('Stripe');
      expect(section.html).toContain(`/${section.locale}/support`);
      expect(section.html).toContain('academygeoo@gmail.com');
    }
  });
});

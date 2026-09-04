import { describe, expect, it } from 'vitest';

import { toJsonLd } from './json-ld';

describe('toJsonLd', () => {
  it('serialises the object', () => {
    expect(toJsonLd({ name: 'AcademyGeo' })).toBe('{"name":"AcademyGeo"}');
  });

  // JSON.stringify leaves angle brackets alone, so a value carrying
  // "</script>" closes the tag it was written into and everything after it is
  // parsed as markup. The fields come from the admin panel, but the result is
  // served to every reader.
  it('cannot close the script tag it sits in', () => {
    const html = toJsonLd({ name: '</script><img src=x onerror=alert(1)>' });

    expect(html).not.toContain('</script>');
    expect(html).not.toContain('<img');
  });

  it('escapes angle brackets as unicode so the value still reads back', () => {
    expect(JSON.parse(toJsonLd({ name: 'a<b>c' }))).toEqual({ name: 'a<b>c' });
  });

  it('escapes an ampersand, which can start an entity', () => {
    expect(toJsonLd({ name: 'a&b' })).not.toContain('&');
  });
});

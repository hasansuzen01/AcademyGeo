import { describe, expect, it } from 'vitest';

import { resolveLocale } from './detect-locale';

describe('resolveLocale', () => {
  it('serves Turkish to visitors from Turkey and English to everyone else', () => {
    expect(resolveLocale({ cookie: undefined, country: 'TR' })).toBe('tr');
    expect(resolveLocale({ cookie: undefined, country: 'DE' })).toBe('en');
    expect(resolveLocale({ cookie: undefined, country: null })).toBe('en');
  });

  it('lets a stored language choice override the visitor country', () => {
    expect(resolveLocale({ cookie: 'en', country: 'TR' })).toBe('en');
    expect(resolveLocale({ cookie: 'tr', country: 'US' })).toBe('tr');
  });

  it('ignores a cookie that is not a language the app ships', () => {
    expect(resolveLocale({ cookie: 'de', country: 'TR' })).toBe('tr');
  });
});

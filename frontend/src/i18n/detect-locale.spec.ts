import { describe, expect, it } from 'vitest';

import { resolveLocale } from './detect-locale';

describe('resolveLocale', () => {
  it('serves English to a visitor from a country that is not Turkey', () => {
    expect(resolveLocale({ cookie: undefined, country: 'DE' })).toBe('en');
    expect(resolveLocale({ cookie: undefined, country: 'US' })).toBe('en');
  });

  // Turkish is the default, so a visitor the platform cannot place gets it.
  it('falls back to Turkish when there is no country to go on', () => {
    expect(resolveLocale({ cookie: undefined, country: 'TR' })).toBe('tr');
    expect(resolveLocale({ cookie: undefined, country: null })).toBe('tr');
    expect(resolveLocale({ cookie: undefined, country: undefined })).toBe('tr');
  });

  it('lets a stored language choice override the visitor country', () => {
    expect(resolveLocale({ cookie: 'en', country: 'TR' })).toBe('en');
    expect(resolveLocale({ cookie: 'tr', country: 'US' })).toBe('tr');
  });

  it('ignores a cookie that is not a language the app ships', () => {
    expect(resolveLocale({ cookie: 'de', country: 'TR' })).toBe('tr');
  });
});

import { describe, expect, it } from 'vitest';

import { supportHref } from './support-link';

describe('supportHref', () => {
  it('passes a secure page address through', () => {
    expect(supportHref('https://buymeacoffee.com/academygeo')).toBe(
      'https://buymeacoffee.com/academygeo',
    );
  });

  it('trims the spaces a pasted link brings with it', () => {
    expect(supportHref('  https://buymeacoffee.com/academygeo \n')).toBe(
      'https://buymeacoffee.com/academygeo',
    );
  });

  // No address means no button: an empty setting hides it rather than
  // drawing a button that goes nowhere.
  it.each([null, '', '   '])('answers null for an empty setting (%j)', (value) => {
    expect(supportHref(value)).toBeNull();
  });

  // The address is typed into the panel and lands in an href, so anything
  // that is not a plain https page is refused rather than trusted.
  it.each([
    'javascript:alert(1)',
    'http://buymeacoffee.com/academygeo',
    'buymeacoffee.com/academygeo',
    'data:text/html,hi',
    'not a link',
  ])('refuses %j', (value) => {
    expect(supportHref(value)).toBeNull();
  });
});

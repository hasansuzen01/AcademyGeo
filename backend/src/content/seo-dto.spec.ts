import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { UpdateSeoDto } from './dto.js';

const errorsFor = (supportUrl: unknown) =>
  validateSync(plainToInstance(UpdateSeoDto, { supportUrl })).map((error) => error.property);

describe('UpdateSeoDto supportUrl', () => {
  it('takes a whole https address', () => {
    expect(errorsFor('https://buymeacoffee.com/academygeo')).toEqual([]);
  });

  // Emptying the field is how the support button is taken down again.
  it('takes an empty value, which clears the setting', () => {
    expect(errorsFor('')).toEqual([]);
  });

  // The address ends up in an href on every page.
  it.each(['javascript:alert(1)', 'http://buymeacoffee.com/academygeo', 'buymeacoffee.com/x'])(
    'refuses %j',
    (value) => {
      expect(errorsFor(value)).toEqual(['supportUrl']);
    },
  );
});

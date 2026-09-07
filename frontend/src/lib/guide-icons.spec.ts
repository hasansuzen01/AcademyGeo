import { describe, expect, it } from 'vitest';

import { GUIDE_ICONS, guideIcon } from './guide-icons';

describe('guideIcon', () => {
  it('answers with the icon an admin picked', () => {
    expect(guideIcon('utility-pole')).toBe(GUIDE_ICONS['utility-pole']);
  });

  // The name is stored as text, so a heading written before an icon existed,
  // or one renamed since, must still draw something rather than nothing.
  it('falls back to a default for a name it does not know', () => {
    expect(guideIcon('rocket')).toBe(GUIDE_ICONS.signpost);
  });

  it('falls back for a heading with no icon at all', () => {
    expect(guideIcon('')).toBe(GUIDE_ICONS.signpost);
  });
});

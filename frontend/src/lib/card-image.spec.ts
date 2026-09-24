import { describe, expect, it } from 'vitest';

import { imageSourceAfterPicture, needsRealPhoto } from './card-image';

describe('needsRealPhoto', () => {
  it('flags a card still showing a stand-in diagram', () => {
    expect(needsRealPhoto('ILLUSTRATION')).toBe(true);
  });

  it('leaves a card with a real photograph alone', () => {
    expect(needsRealPhoto('PHOTO')).toBe(false);
  });
});

describe('imageSourceAfterPicture', () => {
  // An object key exists only for a file the admin uploaded, so that is the
  // one signal that the card now shows a real picture.
  it('marks the card a photograph once a file has been uploaded', () => {
    expect(imageSourceAfterPicture('ILLUSTRATION', 'metas/oslo-street-a1b2.jpg')).toBe('PHOTO');
  });

  // Typing a path into the box is how the seeded diagrams are selected. It
  // used to mark them as photographs, which then rendered them cropped.
  it('leaves the choice alone when a path is typed in by hand', () => {
    expect(imageSourceAfterPicture('ILLUSTRATION', null)).toBe('ILLUSTRATION');
  });

  it('does not undo an admin who deliberately called a pasted URL a photo', () => {
    expect(imageSourceAfterPicture('PHOTO', null)).toBe('PHOTO');
  });
});

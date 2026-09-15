import { describe, expect, it } from 'vitest';

import { imageFitClass, imageSourceAfterPicture, needsRealPhoto } from './card-image';

describe('imageFitClass', () => {
  // A photograph of a street should fill the card the way it fills a game
  // screen. Letterboxing one leaves grey bars and makes the card look like a
  // diagram rather than a place.
  it('fills the frame with a photograph', () => {
    expect(imageFitClass('PHOTO')).toBe('object-cover');
  });

  // Diagrams are drawn to their own edges, so cropping one can remove the very
  // detail the card is asking about.
  it('letterboxes a diagram so nothing is cropped away', () => {
    expect(imageFitClass('ILLUSTRATION')).toBe('object-contain');
  });

  it('letterboxes anything it does not recognise, which never crops', () => {
    expect(imageFitClass(undefined)).toBe('object-contain');
  });

  // A number plate is about three times wider than it is tall. Filling the card
  // with one cuts off the characters, which are the whole point of the card.
  it('shows the whole plate when a plate is photographed', () => {
    expect(imageFitClass('PHOTO', 'PLATE')).toBe('object-contain');
  });

  it('still fills the frame with photographs of other clues', () => {
    expect(imageFitClass('PHOTO', 'ROAD_LINE')).toBe('object-cover');
  });
});

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

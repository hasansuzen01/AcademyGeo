export type ImageSource = 'PHOTO' | 'ILLUSTRATION';

/**
 * How a card picture should sit in its frame.
 *
 * A photograph is a view of a place, so it fills the frame the way the game
 * screen does. A diagram is drawn to its own edges, so it is letterboxed:
 * cropping one can cut off the exact detail the card asks about.
 */
export function imageFitClass(source: ImageSource | undefined): string {
  return source === 'PHOTO' ? 'object-cover' : 'object-contain';
}

/** Cards still showing a seeded diagram, waiting for a real picture. */
export function needsRealPhoto(source: ImageSource | undefined): boolean {
  return source !== 'PHOTO';
}

/**
 * The picture type after the admin changes a card's image.
 *
 * An object key is handed back only for a file uploaded to the bucket, so it
 * is the one reliable sign that the card now shows a real picture. Typing a
 * path by hand, which is how the seeded diagrams are chosen, leaves the
 * current choice untouched.
 */
export function imageSourceAfterPicture(
  current: ImageSource,
  uploadedKey: string | null,
): ImageSource {
  return uploadedKey ? 'PHOTO' : current;
}

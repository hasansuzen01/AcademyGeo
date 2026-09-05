/**
 * A card is a picture with a question attached, so it cannot go into a
 * practice session without one. Cards can be written long before anyone has a
 * photograph for them, and those sit as drafts until someone uploads one.
 */
export type PublishBlocker = 'no-picture';

export interface PublishCandidate {
  imageUrl: string;
  isPublished?: boolean;
}

/** Why the card cannot go live, or null when nothing is stopping it. */
export function publishBlocker(meta: PublishCandidate): PublishBlocker | null {
  if (!meta.isPublished) return null;

  return meta.imageUrl.trim() === '' ? 'no-picture' : null;
}

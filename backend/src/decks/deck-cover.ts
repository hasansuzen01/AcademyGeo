import { type CreditColumns, type ImageCredit, imageCredit } from '../metas/image-credit.js';

/** The picture at the top of a collection, and who it is owed to. */
export interface DeckCover {
  url: string;
  credit: ImageCredit | null;
}

interface CoverCandidate extends CreditColumns {
  imageUrl: string;
  imageSource: string;
  isPublished: boolean;
}

/**
 * The cover a collection is shown with.
 *
 * A cover set in the panel wins. Without one, the collection borrows the
 * photograph of its first published card, credit and all, so a collection is
 * never a blank box just because nobody uploaded a cover for it. Diagrams are
 * skipped: a cover is meant to look like the road, not like a drawing of it.
 */
export function deckCover(coverImageUrl: string | null, cards: CoverCandidate[]): DeckCover | null {
  if (coverImageUrl?.trim()) return { url: coverImageUrl, credit: null };

  const photo = cards.find(
    (card) => card.isPublished && card.imageSource === 'PHOTO' && card.imageUrl.trim() !== '',
  );

  return photo ? { url: photo.imageUrl, credit: imageCredit(photo) } : null;
}

import { SERVER_API_URL } from './api-base';

export interface Collection {
  slug: string;
  nameEn: string;
  nameTr: string;
  descriptionEn: string;
  descriptionTr: string;
  coverImageUrl: string | null;
  /** Set when the collection is an event with a closing date. */
  endsAt: string | null;
  cardCount: number;
}

/**
 * Collections change only when an admin edits them, so they are read on the
 * server and cached rather than fetched again in every visitor's browser.
 */
const COLLECTIONS_REVALIDATE_SECONDS = 300;

export async function fetchCollections(): Promise<Collection[]> {
  try {
    const response = await fetch(`${SERVER_API_URL}/api/decks`, {
      next: { revalidate: COLLECTIONS_REVALIDATE_SECONDS },
    });

    return response.ok ? ((await response.json()) as Collection[]) : [];
  } catch {
    return [];
  }
}

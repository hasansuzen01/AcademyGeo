/** The three credit columns a card row carries. */
export interface CreditColumns {
  imageAuthor: string | null;
  imageLicense: string | null;
  imageSourceUrl: string | null;
}

/** What a player is shown under a licensed photograph. */
export interface ImageCredit {
  author: string | null;
  license: string | null;
  sourceUrl: string | null;
}

/**
 * The credit for a card's picture, or null when it credits nobody.
 *
 * Blank fields count as missing, so a half-cleared form in the panel does not
 * draw an empty "Photo:" line under a picture.
 *
 * Only ever attached to an answer, an atlas entry or the landing strip. Never
 * to the card a question is asked about: a photographer's caption or a source
 * address can name the place and give the answer away.
 */
export function imageCredit(meta: CreditColumns): ImageCredit | null {
  const author = filled(meta.imageAuthor);
  const license = filled(meta.imageLicense);
  const sourceUrl = filled(meta.imageSourceUrl);

  return author || license || sourceUrl ? { author, license, sourceUrl } : null;
}

/** Select these on any card read that will go through withCredit. */
export const CREDIT_COLUMNS = { imageAuthor: true, imageLicense: true, imageSourceUrl: true } as const;

/** A row with its three credit columns swapped for the one credit a client is sent. */
export function withCredit<T extends CreditColumns>({
  imageAuthor,
  imageLicense,
  imageSourceUrl,
  ...row
}: T): Omit<T, keyof CreditColumns> & { credit: ImageCredit | null } {
  return { ...row, credit: imageCredit({ imageAuthor, imageLicense, imageSourceUrl }) };
}

function filled(value: string | null): string | null {
  const trimmed = value?.trim() ?? '';

  return trimmed === '' ? null : trimmed;
}

/**
 * One support as the Buy Me a Coffee API returns it. Only the fields read
 * here are named; the API sends more, and its documentation is marked
 * unmaintained, so every one of them is treated as possibly missing.
 */
export interface BmcSupport {
  support_id: number;
  supporter_name?: string | null;
  payer_name?: string | null;
  payer_email?: string | null;
  support_note?: string | null;
  support_coffees?: number | string | null;
  support_created_on?: string | null;
  support_hidden?: number | null;
  support_visibility?: number | null;
  is_refunded?: number | string | boolean | null;
}

/** What the supporters page shows. Nothing else leaves the API. */
export interface PublicSupporter {
  id: number;
  /** The name they chose to show, or null for "someone". */
  name: string | null;
  note: string | null;
  coffees: number;
  createdAt: string | null;
}

const NOTE_LIMIT = 400;

/**
 * An ISO time, or null. The API writes "2026-09-28 10:15:00" with no zone,
 * which is read as UTC; a time that names its own zone keeps it.
 */
function toIso(value: string | null | undefined): string | null {
  if (!value) return null;

  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value);
  const date = new Date(hasZone ? value : `${value.replace(' ', 'T')}Z`);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

const isTrue = (value: unknown) => value === true || value === 1 || value === '1' || value === 'true';

/**
 * The supports that may be shown, with only what may be shown of them.
 *
 * A support hidden by the creator, kept private by the supporter or refunded
 * is dropped. The name is the one the supporter typed, never the payer name,
 * which can be the name on their card.
 */
export function toPublicSupporters(rows: BmcSupport[]): PublicSupporter[] {
  return rows
    .filter(
      (row) => row.support_hidden !== 1 && row.support_visibility !== 0 && !isTrue(row.is_refunded),
    )
    .map((row) => {
      const note = row.support_note?.trim() || null;

      return {
        id: row.support_id,
        name: row.supporter_name?.trim() || null,
        note: note && note.length > NOTE_LIMIT ? `${note.slice(0, NOTE_LIMIT - 1)}…` : note,
        coffees: Number(row.support_coffees) || 1,
        createdAt: toIso(row.support_created_on),
      };
    });
}

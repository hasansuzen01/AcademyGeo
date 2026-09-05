export interface DeckEntry {
  metaId: string;
  position: number;
}

/**
 * Turns the editor's ordered list of metas into gap-free deck positions.
 * The list arrives from the browser, so ids that no longer exist and repeated
 * entries are dropped rather than trusted.
 */
export function buildDeckOrder(requested: string[], known: Set<string>): DeckEntry[] {
  const seen = new Set<string>();

  return requested
    .filter((metaId) => {
      if (!known.has(metaId) || seen.has(metaId)) return false;
      seen.add(metaId);
      return true;
    })
    .map((metaId, position) => ({ metaId, position }));
}

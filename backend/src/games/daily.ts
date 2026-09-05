/**
 * The daily challenge is the same hand for everyone, so a score is worth
 * comparing. The day itself is the seed: no row has to be written before the
 * first player of the day arrives, and a replay of an old day deals the same
 * cards it dealt then.
 */

/** Deals the cards for one UTC day, in a stable order. */
export function pickDailyMetaIds(metaIds: string[], day: string, count: number): string[] {
  const random = seededRandom(hashString(day));

  return shuffle([...metaIds].sort(), random).slice(0, count);
}

function shuffle<T>(items: T[], random: () => number): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/** FNV-1a. Small, stable across runs, and good enough to seed a shuffle. */
function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Mulberry32: one number in, a repeatable stream of them out. */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

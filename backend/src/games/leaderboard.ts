export interface ScoreRow {
  userId: string;
  score: number;
}

export type RankedRow<T extends ScoreRow> = T & { rank: number };

/**
 * Standard competition ranking: equal scores share a rank and the next score
 * down skips the places they took, so a rank always counts the players above.
 */
export function rankRows<T extends ScoreRow>(rows: T[]): RankedRow<T>[] {
  const sorted = [...rows].sort((left, right) => right.score - left.score);

  let rank = 0;
  let previousScore: number | null = null;

  return sorted.map((row, index) => {
    if (row.score !== previousScore) {
      rank = index + 1;
      previousScore = row.score;
    }
    return { ...row, rank };
  });
}

export interface DueCard {
  metaId: string;
  dueAt: Date;
}

export interface QueueInput {
  dueCards: DueCard[];
  newMetaIds: string[];
  limit: number;
  now: Date;
}

/** Orders one practice session: overdue cards first, then unseen metas. */
export function buildReviewQueue({ dueCards, newMetaIds, limit, now }: QueueInput): string[] {
  const due = dueCards
    .filter((card) => card.dueAt.getTime() <= now.getTime())
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())
    .map((card) => card.metaId);

  return [...due, ...newMetaIds].slice(0, limit);
}

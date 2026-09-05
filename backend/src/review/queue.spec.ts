import { describe, expect, it } from 'vitest';

import { buildReviewQueue } from './queue.js';

const NOW = new Date('2026-01-01T12:00:00.000Z');

describe('buildReviewQueue', () => {
  it('puts due cards ahead of unseen metas and respects the session limit', () => {
    const queue = buildReviewQueue({
      dueCards: [
        { metaId: 'due-1', dueAt: new Date('2026-01-01T09:00:00.000Z') },
        { metaId: 'due-2', dueAt: new Date('2026-01-01T11:00:00.000Z') },
      ],
      newMetaIds: ['new-1', 'new-2'],
      limit: 3,
      now: NOW,
    });

    expect(queue).toEqual(['due-1', 'due-2', 'new-1']);
  });

  it('drops cards that are not due yet and starts with the most overdue one', () => {
    const queue = buildReviewQueue({
      dueCards: [
        { metaId: 'later-today', dueAt: new Date('2026-01-01T11:59:00.000Z') },
        { metaId: 'tomorrow', dueAt: new Date('2026-01-02T12:00:00.000Z') },
        { metaId: 'yesterday', dueAt: new Date('2025-12-31T12:00:00.000Z') },
      ],
      newMetaIds: [],
      limit: 10,
      now: NOW,
    });

    expect(queue).toEqual(['yesterday', 'later-today']);
  });
});

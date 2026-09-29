import { describe, expect, it } from 'vitest';

import { type BmcSupport, toPublicSupporters } from './supporters.js';

const support = (overrides: Partial<BmcSupport> = {}): BmcSupport => ({
  support_id: 1,
  supporter_name: 'Ayşe',
  payer_name: 'Ayşe Yılmaz',
  payer_email: 'ayse@example.com',
  support_note: 'Harika site!',
  support_coffees: 2,
  support_created_on: '2026-09-28 10:15:00',
  support_hidden: 0,
  support_visibility: 1,
  is_refunded: null,
  ...overrides,
});

describe('toPublicSupporters', () => {
  it('keeps the name, the message, the coffees and the date', () => {
    expect(toPublicSupporters([support()])).toEqual([
      {
        id: 1,
        name: 'Ayşe',
        note: 'Harika site!',
        coffees: 2,
        createdAt: '2026-09-28T10:15:00.000Z',
      },
    ]);
  });

  // The API writes its times without a zone; they are read as UTC and sent
  // on in a form every browser parses the same way.
  it('keeps a date that already carries a zone and drops one it cannot read', () => {
    const dates = toPublicSupporters([
      support({ support_created_on: '2026-09-28T10:15:00+03:00' }),
      support({ support_created_on: 'yesterday' }),
    ]).map((row) => row.createdAt);

    expect(dates).toEqual(['2026-09-28T07:15:00.000Z', null]);
  });

  // Nothing that identifies a payer beyond the name they chose to show is
  // passed on: no email, and not the name on the card.
  it('never passes on the email or the payer name', () => {
    const [row] = toPublicSupporters([support({ supporter_name: '' })]);

    expect(JSON.stringify(row)).not.toContain('example.com');
    expect(JSON.stringify(row)).not.toContain('Yılmaz');
    expect(row?.name).toBeNull();
  });

  // Buy Me a Coffee lets a supporter keep their support private, and the
  // creator can hide one. Either way it stays off the page.
  it.each([
    ['hidden by the creator', { support_hidden: 1 }],
    ['kept private by the supporter', { support_visibility: 0 }],
    ['refunded', { is_refunded: 1 }],
    ['refunded, as text', { is_refunded: 'true' }],
  ])('leaves out a support %s', (_, overrides) => {
    expect(toPublicSupporters([support(overrides as Partial<BmcSupport>)])).toEqual([]);
  });

  it('turns an empty message into no message', () => {
    expect(toPublicSupporters([support({ support_note: '   ' })])[0]?.note).toBeNull();
  });

  // A message is someone else's words printed on the site, so a wall of text
  // is cut down rather than allowed to swallow the page.
  it('shortens a very long message', () => {
    const [row] = toPublicSupporters([support({ support_note: 'a'.repeat(900) })]);

    expect(row?.note?.length).toBeLessThanOrEqual(400);
    expect(row?.note?.endsWith('…')).toBe(true);
  });

  it('reads a coffee count sent as text', () => {
    expect(
      toPublicSupporters([support({ support_coffees: '3' as unknown as number })])[0]?.coffees,
    ).toBe(3);
  });
});

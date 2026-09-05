import { describe, expect, it } from 'vitest';

import { pickDuelOpponent } from './duel.js';

const ANSWER = { code: 'NO', region: 'EUROPE' };
const POOL = [
  { code: 'NO', region: 'EUROPE' },
  { code: 'SE', region: 'EUROPE' },
  { code: 'FI', region: 'EUROPE' },
  { code: 'BR', region: 'SOUTH_AMERICA' },
];

const always = () => 0;

describe('pickDuelOpponent', () => {
  it('offers the country the player keeps mistaking this one for', () => {
    const opponent = pickDuelOpponent(ANSWER, POOL, { NO: { FI: 9, SE: 2 } }, always);

    expect(opponent).toBe('FI');
  });

  it('falls back to a neighbour when the player has no history with it', () => {
    const opponent = pickDuelOpponent(ANSWER, POOL, {}, always);

    expect(['SE', 'FI']).toContain(opponent);
  });

  it('never offers the answer as the other side of the duel', () => {
    const opponent = pickDuelOpponent(ANSWER, POOL, { NO: { NO: 99 } }, always);

    expect(opponent).not.toBe('NO');
  });

  it('reaches outside the region when nothing else is left', () => {
    const opponent = pickDuelOpponent(ANSWER, [POOL[0], POOL[3]], {}, always);

    expect(opponent).toBe('BR');
  });

  it('has nothing to offer when the answer is the only country', () => {
    expect(pickDuelOpponent(ANSWER, [POOL[0]], {}, always)).toBeNull();
  });
});

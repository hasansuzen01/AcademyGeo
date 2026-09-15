import { describe, expect, it } from 'vitest';

import { tooltipPlacement } from './map-tooltip';

describe('tooltipPlacement', () => {
  const box = { width: 800, height: 400 };

  it('sits centred above the pointer in the open middle of the map', () => {
    expect(tooltipPlacement({ x: 400, y: 200 }, box)).toEqual({ align: 'center', side: 'above' });
  });

  it('drops below the pointer near the top edge so it is not cut off', () => {
    expect(tooltipPlacement({ x: 400, y: 20 }, box).side).toBe('below');
  });

  it('hangs to the right of the pointer near the left edge', () => {
    expect(tooltipPlacement({ x: 30, y: 200 }, box).align).toBe('start');
  });

  it('hangs to the left of the pointer near the right edge', () => {
    expect(tooltipPlacement({ x: 780, y: 200 }, box).align).toBe('end');
  });
});

import { describe, expect, it } from 'vitest';

import {
  MAX_ZOOM,
  type Viewport,
  panBy,
  startedDragging,
  wholeMap,
  zoomAt,
} from './map-viewport';

const WORLD = { width: 960, height: 460 };
const FULL: Viewport = wholeMap(WORLD);

/** The centre of the box, which is what a fixed point is measured against. */
function centre(view: Viewport) {
  return { x: view.x + view.width / 2, y: view.y + view.height / 2 };
}

describe('zoomAt', () => {
  it('starts showing the whole map', () => {
    expect(FULL).toEqual({ x: 0, y: 0, width: 960, height: 460 });
  });

  it('shows less of the map as you zoom in', () => {
    expect(zoomAt(FULL, 2, centre(FULL), WORLD).width).toBeLessThan(FULL.width);
  });

  it('keeps the point under the pointer where it was', () => {
    const pointer = { x: 300, y: 200 };
    const zoomed = zoomAt(FULL, 2, pointer, WORLD);

    // The pointer sat 300/960 across the box before, and must still.
    expect((pointer.x - zoomed.x) / zoomed.width).toBeCloseTo(300 / 960, 5);
    expect((pointer.y - zoomed.y) / zoomed.height).toBeCloseTo(200 / 460, 5);
  });

  it('will not zoom out past the whole map', () => {
    expect(zoomAt(FULL, 0.5, centre(FULL), WORLD)).toEqual(FULL);
  });

  it('stops zooming in somewhere a person can still read', () => {
    let view = FULL;
    for (let step = 0; step < 40; step += 1) view = zoomAt(view, 2, centre(view), WORLD);

    expect(view.width).toBeCloseTo(WORLD.width / MAX_ZOOM, 5);
  });

  it('never shows anything outside the map', () => {
    const corner = zoomAt(FULL, 4, { x: 0, y: 0 }, WORLD);

    expect(corner.x).toBeGreaterThanOrEqual(0);
    expect(corner.y).toBeGreaterThanOrEqual(0);
    expect(corner.x + corner.width).toBeLessThanOrEqual(WORLD.width);
  });
});

describe('panBy', () => {
  it('moves the view', () => {
    const zoomed = zoomAt(FULL, 4, centre(FULL), WORLD);

    expect(panBy(zoomed, 20, 0, WORLD).x).toBeGreaterThan(zoomed.x);
  });

  it('cannot drag the map off the edge', () => {
    const zoomed = zoomAt(FULL, 4, centre(FULL), WORLD);

    expect(panBy(zoomed, -10_000, 0, WORLD).x).toBe(0);
  });

  it('has nothing to move when the whole map is already shown', () => {
    expect(panBy(FULL, 200, 200, WORLD)).toEqual(FULL);
  });
});

describe('startedDragging', () => {
  const origin = { x: 100, y: 100 };

  it('says no when the pointer has not really moved', () => {
    expect(startedDragging(origin, { x: 100, y: 100 })).toBe(false);
    expect(startedDragging(origin, { x: 102, y: 101 })).toBe(false);
  });

  it('says yes once the pointer has travelled far enough to mean it', () => {
    expect(startedDragging(origin, { x: 130, y: 100 })).toBe(true);
    expect(startedDragging(origin, { x: 100, y: 60 })).toBe(true);
  });

  // A press that wobbles a pixel or two is someone clicking a small country,
  // not someone dragging the map, and it has to open the country.
  it('treats a wobbly click as a click', () => {
    expect(startedDragging(origin, { x: 101, y: 99 })).toBe(false);
  });
});

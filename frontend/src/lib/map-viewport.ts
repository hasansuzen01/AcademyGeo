/**
 * Where the map is looking.
 *
 * Zooming an SVG is a matter of narrowing its viewBox, so all of this is
 * arithmetic on one rectangle. Keeping it here rather than in the component
 * means the two rules that matter can be stated as tests: the point under the
 * pointer stays put, and the view never leaves the map.
 */

export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WorldSize {
  width: number;
  height: number;
}

/** Past this a country is a smear of pixels rather than a shape. */
export const MAX_ZOOM = 12;

export function wholeMap(world: WorldSize): Viewport {
  return { x: 0, y: 0, width: world.width, height: world.height };
}

/**
 * Zooms by a factor around a point given in map coordinates, so whatever the
 * pointer is over stays under the pointer.
 */
export function zoomAt(
  view: Viewport,
  factor: number,
  pointer: { x: number; y: number },
  world: WorldSize,
): Viewport {
  const width = clamp(view.width / factor, world.width / MAX_ZOOM, world.width);
  const scale = width / view.width;

  return contain(
    {
      // The pointer keeps its position within the box, so the map slides
      // under it rather than away from it.
      x: pointer.x - (pointer.x - view.x) * scale,
      y: pointer.y - (pointer.y - view.y) * scale,
      width,
      height: view.height * scale,
    },
    world,
  );
}

/** Drags the view. The offsets are in map coordinates. */
export function panBy(view: Viewport, dx: number, dy: number, world: WorldSize): Viewport {
  return contain({ ...view, x: view.x + dx, y: view.y + dy }, world);
}

/** Keeps the view inside the map, whatever was asked for. */
function contain(view: Viewport, world: WorldSize): Viewport {
  return {
    ...view,
    x: clamp(view.x, 0, world.width - view.width),
    y: clamp(view.y, 0, world.height - view.height),
  };
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), high);
}

/**
 * A press that wobbles is a click, not a drag.
 *
 * The distinction matters because the map only takes hold of the pointer once
 * a drag has really started: taking hold of it on the way down would send the
 * click that follows to the map instead of to the country under it, and small
 * countries would stop opening.
 */
const DRAG_SLOP = 6;

export function startedDragging(
  origin: { x: number; y: number },
  point: { x: number; y: number },
): boolean {
  return Math.hypot(point.x - origin.x, point.y - origin.y) > DRAG_SLOP;
}

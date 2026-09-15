/**
 * Where the country label goes relative to the pointer.
 *
 * The label normally floats centred above the pointer. Near an edge of the map
 * it would be cut off by the card around it, so it flips below the pointer at
 * the top and hangs inwards at the sides. The label's own size is never
 * measured: these margins are wide enough for the longest country name.
 */

const ROOM_ABOVE = 72;
const ROOM_SIDE = 130;

export interface TooltipPlacement {
  align: 'start' | 'center' | 'end';
  side: 'above' | 'below';
}

export function tooltipPlacement(
  pointer: { x: number; y: number },
  box: { width: number; height: number },
): TooltipPlacement {
  const align =
    pointer.x < ROOM_SIDE ? 'start' : pointer.x > box.width - ROOM_SIDE ? 'end' : 'center';

  return { align, side: pointer.y < ROOM_ABOVE ? 'below' : 'above' };
}

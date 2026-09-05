'use client';

import { Minus, Plus, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/cn';
import {
  type Viewport,
  type WorldSize,
  panBy,
  startedDragging,
  wholeMap,
  zoomAt,
} from '@/lib/map-viewport';

/** How much one notch of the wheel, or one press of a button, zooms. */
const WHEEL_STEP = 1.18;
const BUTTON_STEP = 1.6;

/**
 * The window onto the map: wheel to zoom, drag to move, buttons for anyone not
 * using a mouse.
 *
 * The map itself is passed in as children and rendered on the server, so the
 * country shapes never enter the browser bundle. All that ships here is the
 * arithmetic for one rectangle.
 */
export function MapViewport({
  world,
  label,
  children,
}: {
  world: WorldSize;
  label: string;
  children: ReactNode;
}) {
  const t = useTranslations('atlas');
  const svg = useRef<SVGSVGElement>(null);
  const [view, setView] = useState<Viewport>(() => wholeMap(world));
  // The view as it stands right now. Wheel notches and pointer moves arrive
  // faster than React re-renders, so each one has to build on the last rather
  // than on whatever the component was last rendered with.
  const latest = useRef<Viewport>(view);
  // Where the pointer went down, and null the moment it comes back up. A
  // press is not a drag until it has travelled, so this is set on the way down
  // but the map is not taken hold of until the pointer actually moves.
  const origin = useRef<{ x: number; y: number } | null>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  // Whether the press turned into a drag, kept past the release so the click
  // that follows knows whether it was one.
  const dragged = useRef(false);
  const [dragging, setDragging] = useState(false);

  const zoomed = view.width < world.width;

  useEffect(() => {
    latest.current = view;
  }, [view]);

  /** Moves the view, keeping the immediate copy and the rendered one together. */
  const moveTo = useCallback((next: Viewport) => {
    latest.current = next;
    setView(next);
  }, []);

  /** Where a screen point falls on the map. */
  const toMap = useCallback((clientX: number, clientY: number, from: Viewport) => {
    const rect = svg.current?.getBoundingClientRect();
    if (!rect) return { x: from.x + from.width / 2, y: from.y + from.height / 2 };

    return {
      x: from.x + ((clientX - rect.left) / rect.width) * from.width,
      y: from.y + ((clientY - rect.top) / rect.height) * from.height,
    };
  }, []);

  // React listens for wheel events passively, which cannot stop the page
  // scrolling underneath, so this one is attached by hand.
  useEffect(() => {
    const element = svg.current;
    if (!element) return;

    const onWheel = (event: WheelEvent) => {
      // The wheel belongs to the map while the pointer is over it, so the page
      // stays where it is. This has to happen here rather than inside the
      // state update: by the time React runs an updater the event has already
      // been handled and asking it to stop is too late.
      event.preventDefault();

      const current = latest.current;

      moveTo(
        zoomAt(
          current,
          event.deltaY < 0 ? WHEEL_STEP : 1 / WHEEL_STEP,
          toMap(event.clientX, event.clientY, current),
          world,
        ),
      );
    };

    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [moveTo, toMap, world]);

  /** The button is up, so nothing that moves the pointer is a drag any more. */
  function endDrag() {
    origin.current = null;
    last.current = null;
    setDragging(false);
  }

  function step(factor: number) {
    const current = latest.current;

    moveTo(
      zoomAt(
        current,
        factor,
        { x: current.x + current.width / 2, y: current.y + current.height / 2 },
        world,
      ),
    );
  }

  return (
    <div className="relative">
      <svg
        ref={svg}
        viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
        role="group"
        aria-label={label}
        className={cn(
          'h-auto w-full touch-pan-y',
          zoomed && (dragging ? 'cursor-grabbing' : 'cursor-grab'),
        )}
        onPointerDown={(event) => {
          if (!zoomed) return;
          origin.current = { x: event.clientX, y: event.clientY };
          last.current = origin.current;
          dragged.current = false;
        }}
        onPointerMove={(event) => {
          const start = origin.current;
          const previous = last.current;
          if (!start || !previous) return;

          const point = { x: event.clientX, y: event.clientY };

          // Taking hold of the pointer sends the click that follows to the map
          // rather than to the country under it, so it only happens once the
          // press has become a drag. Below that a press is still a click, and
          // a small country still opens.
          if (!dragged.current) {
            if (!startedDragging(start, point)) return;
            dragged.current = true;
            setDragging(true);
            event.currentTarget.setPointerCapture(event.pointerId);
          }

          const current = latest.current;
          const rect = event.currentTarget.getBoundingClientRect();
          const dx = ((point.x - previous.x) / rect.width) * current.width;
          const dy = ((point.y - previous.y) / rect.height) * current.height;

          last.current = point;
          moveTo(panBy(current, -dx, -dy, world));
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(event) => {
          // A drag that ended over a country is not a click on it.
          if (dragged.current) event.preventDefault();
          dragged.current = false;
        }}
      >
        {children}
      </svg>

      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <ZoomButton label={t('zoomIn')} onClick={() => step(BUTTON_STEP)}>
          <Plus className="size-4" aria-hidden />
        </ZoomButton>
        <ZoomButton label={t('zoomOut')} onClick={() => step(1 / BUTTON_STEP)}>
          <Minus className="size-4" aria-hidden />
        </ZoomButton>
        {zoomed && (
          <ZoomButton label={t('zoomReset')} onClick={() => moveTo(wholeMap(world))}>
            <RotateCcw className="size-4" aria-hidden />
          </ZoomButton>
        )}
      </div>
    </div>
  );
}

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-xl border-2 border-line bg-paper p-2 text-muted transition-colors hover:border-edge hover:text-ink"
    >
      {children}
    </button>
  );
}

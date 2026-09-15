'use client';

import { ChevronRight, Minus, Plus, RotateCcw } from 'lucide-react';
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
import { type TooltipPlacement, tooltipPlacement } from '@/lib/map-tooltip';

/** The country under the pointer, read off the data attributes of its shape. */
interface CountryTip {
  name: string;
  detail: string;
  flag: string;
  open: boolean;
  /** Position within the frame, in CSS pixels. */
  x: number;
  y: number;
  placement: TooltipPlacement;
}

const ALIGN: Record<TooltipPlacement['align'], string> = {
  start: 'translate-x-4',
  center: '-translate-x-1/2',
  end: '-translate-x-[calc(100%+16px)]',
};

const SIDE: Record<TooltipPlacement['side'], string> = {
  above: '-translate-y-[calc(100%+14px)]',
  below: 'translate-y-5',
};

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
  const frame = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<CountryTip | null>(null);

  const zoomed = view.width < world.width;

  /** Labels whichever country the target belongs to, at a screen point. */
  function showTip(target: EventTarget, clientX: number, clientY: number) {
    const rect = frame.current?.getBoundingClientRect();
    const country = target instanceof Element ? target.closest<SVGElement>('[data-country]') : null;
    if (!rect || !country) {
      setTip(null);
      return;
    }

    const point = { x: clientX - rect.left, y: clientY - rect.top };
    const { name = '', detail = '', flag = '', open } = country.dataset;

    setTip({ name, detail, flag, open: open === 'true', ...point, placement: tooltipPlacement(point, rect) });
  }

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
    <div ref={frame} className="relative">
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
          // A finger has no hover, so a label would only ever trail a drag.
          if (event.pointerType !== 'touch' && !dragged.current) {
            showTip(event.target, event.clientX, event.clientY);
          }

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
            setTip(null);
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
        onPointerLeave={() => setTip(null)}
        onFocus={(event) => {
          // Tabbing onto a country labels it too, pinned to the shape's middle.
          const box = event.target.getBoundingClientRect();
          showTip(event.target, box.left + box.width / 2, box.top + box.height / 2);
        }}
        onBlur={() => setTip(null)}
        onClickCapture={(event) => {
          // A drag that ended over a country is not a click on it.
          if (dragged.current) event.preventDefault();
          dragged.current = false;
        }}
      >
        {children}
      </svg>

      {tip && <CountryLabel tip={tip} />}

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

/**
 * The floating name card. It is decoration for sighted pointer users: the link
 * underneath already carries the same words as its accessible name.
 */
function CountryLabel({ tip }: { tip: CountryTip }) {
  return (
    <div
      aria-hidden
      style={{ left: tip.x, top: tip.y }}
      className={cn(
        'pointer-events-none absolute z-10 flex max-w-72 items-center gap-2.5 rounded-2xl border-2 border-b-4 border-line bg-paper py-2 pr-3.5 pl-2.5 whitespace-nowrap shadow-[0_12px_28px_-14px_rgb(23_40_45/0.45)]',
        ALIGN[tip.placement.align],
        SIDE[tip.placement.side],
      )}
    >
      <span
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-xl text-xl leading-none',
          tip.open ? 'bg-go-wash' : 'bg-canvas',
        )}
      >
        {tip.flag || '🌍'}
      </span>

      <span className="min-w-0">
        <span className="block truncate font-display text-sm font-900 text-ink">{tip.name}</span>
        <span
          className={cn(
            'mt-0.5 flex items-center gap-0.5 text-xs font-800',
            tip.open ? 'text-go-deep' : 'text-muted',
          )}
        >
          {tip.detail}
          {tip.open && <ChevronRight className="size-3.5" aria-hidden />}
        </span>
      </span>
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

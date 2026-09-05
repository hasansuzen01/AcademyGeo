'use client';

import { Timer } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/cn';

const INSTANT_MS = 2_500;
const HESITANT_MS = 8_000;

/**
 * The answer clock. Its colour crosses the same thresholds the scheduler
 * grades on, so how fast you are is visible rather than hidden in the maths.
 */
export function RoadTimer({ startedAt, frozenAt }: { startedAt: number; frozenAt?: number }) {
  const [now, setNow] = useState(startedAt);

  useEffect(() => {
    if (frozenAt !== undefined) return;

    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [frozenAt, startedAt]);

  const elapsed = Math.max(0, (frozenAt ?? now) - startedAt);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-900 tabular-nums',
        toneFor(elapsed),
      )}
    >
      <Timer className="size-3.5" aria-hidden />
      {(elapsed / 1000).toFixed(1)}s
    </span>
  );
}

function toneFor(elapsed: number): string {
  if (elapsed < INSTANT_MS) return 'bg-go/15 text-go-deep';
  if (elapsed < HESITANT_MS) return 'bg-paint/25 text-paint-deep';
  return 'bg-stop/15 text-stop-deep';
}

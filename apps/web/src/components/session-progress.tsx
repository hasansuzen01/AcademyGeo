'use client';

import { motion } from 'framer-motion';

/**
 * Session progress drawn as a stretch of road: the centre line only exists on
 * the part you have already covered, so the road paints itself in as you go.
 */
export function SessionProgress({ done, total }: { done: number; total: number }) {
  const percent = total === 0 ? 0 : Math.min(100, (done / total) * 100);

  return (
    <div className="flex items-center gap-3">
      <div className="h-4 flex-1 overflow-hidden rounded-full bg-edge">
        <motion.div
          className="relative h-full rounded-full bg-go"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            aria-hidden
            className="absolute inset-y-[6px] left-0 w-full"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to right, rgb(255 255 255 / 0.9) 0 12px, transparent 12px 26px)',
            }}
          />
        </motion.div>
      </div>

      <span className="w-12 text-right font-display text-sm font-900 tabular-nums text-muted">
        {done}/{total}
      </span>
    </div>
  );
}

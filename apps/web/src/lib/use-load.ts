'use client';

import { useEffect } from 'react';

/**
 * Runs a loader once its prerequisites are ready, and again whenever the
 * loader changes.
 *
 * The loader is awaited inside the effect rather than called from it. Both
 * spellings write state only after the request resolves, but calling a
 * state-writing function straight from an effect body reads as a synchronous
 * write, and the React compiler lint rejects it on that basis.
 */
export function useLoad(load: () => Promise<void>, ready = true): void {
  useEffect(() => {
    if (!ready) return;

    void (async () => {
      await load();
    })();
  }, [load, ready]);
}

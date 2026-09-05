'use client';

import { useEffect, useState } from 'react';

import { fetchStorageStatus } from './admin-api';

/**
 * Whether picture uploads are available.
 *
 * Every screen with a file picker needs this before offering one, so the
 * question is asked in one place rather than repeated in each of them.
 */
export function useStorageReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetchStorageStatus()
      .then((status) => setReady(status.configured))
      .catch(() => setReady(false));
  }, []);

  return ready;
}

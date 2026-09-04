'use client';

import { useCallback, useEffect, useState } from 'react';

import { useSession } from '@/lib/auth-client';
import { type Me, fetchMe } from '@/lib/admin-api';

type Status = 'loading' | 'anonymous' | 'ready';

/**
 * The signed-in account with its role. The role comes from the API rather than
 * the session cookie, so a change takes effect on the next page load.
 */
export function useMe() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;

  const [me, setMe] = useState<Me | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  const load = useCallback(async () => {
    try {
      setMe(await fetchMe());
      setStatus('ready');
    } catch {
      setMe(null);
      setStatus('anonymous');
    }
  }, []);

  useEffect(() => {
    if (isPending) return;
    if (!userId) {
      setStatus('anonymous');
      return;
    }
    void load();
  }, [isPending, load, userId]);

  return { me, status, reload: load };
}

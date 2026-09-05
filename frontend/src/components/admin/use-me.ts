'use client';

import { useCallback, useState } from 'react';

import { useSession } from '@/lib/auth-client';
import { type Me, fetchMe } from '@/lib/admin-api';
import { useLoad } from '@/lib/use-load';

import { resolveMeStatus } from './me-status';

/**
 * The signed-in account with its role. The role comes from the API rather than
 * the session cookie, so a change takes effect on the next page load.
 */
export function useMe() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;

  const [me, setMe] = useState<Me | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      setMe(await fetchMe());
      setFailed(false);
    } catch {
      setMe(null);
      setFailed(true);
    }
  }, []);

  useLoad(load, !isPending && Boolean(userId));

  const status = resolveMeStatus({
    sessionPending: isPending,
    signedIn: Boolean(userId),
    me,
    failed,
  });

  return { me, status, reload: load };
}

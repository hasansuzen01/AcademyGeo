import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { AdminShell } from '@/components/admin/admin-shell';
import { fetchViewer } from '@/lib/server-api';

/**
 * The admin area has no sign-in screen of its own. Anyone without the role,
 * signed in or not, is told the page does not exist rather than that it is
 * locked, so the panel leaves no trace for people who cannot use it.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const viewer = await fetchViewer();
  if (viewer?.role !== 'ADMIN') notFound();

  return <AdminShell>{children}</AdminShell>;
}

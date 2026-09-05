'use client';

import { Flame, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useMe } from '@/components/admin/use-me';
import { Link } from '@/i18n/navigation';
import { fetchDashboard } from '@/lib/api';
import { signOut } from '@/lib/auth-client';
import { cn } from '@/lib/cn';

import { LocaleSwitch } from './locale-switch';

export function SiteHeader() {
  const t = useTranslations('nav');
  const brand = useTranslations('brand');
  const pathname = usePathname();
  const { me, status } = useMe();
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    if (!me) return;

    // The streak sits in the header the way a game keeps its score in view.
    fetchDashboard()
      .then((stats) => setStreak(stats.streak))
      .catch(() => setStreak(null));
  }, [me]);

  const links = [
    { href: '/play', label: t('play') },
    { href: '/collections', label: t('collections') },
    { href: '/atlas', label: t('atlas') },
    { href: '/leaderboard', label: t('leaderboard') },
    { href: '/dashboard', label: t('dashboard') },
    ...(me ? [{ href: '/profile', label: t('profile') }] : []),
    ...(me?.role === 'ADMIN' ? [{ href: '/admin', label: t('admin') }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b-2 border-line bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center gap-3 px-4 sm:gap-5 sm:px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="centre-line h-2 w-11 rounded-full" />
          <span className="hidden font-display text-lg font-900 tracking-tight sm:inline">
            {brand('name')}
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 overflow-x-auto">
          {links.map((link) => {
            const active = pathname.includes(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'shrink-0 rounded-xl px-3 py-2 text-sm font-800 transition-colors',
                  active ? 'bg-canvas text-ink' : 'text-muted hover:bg-canvas hover:text-ink',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {streak !== null && (
            <span
              title={t('streak')}
              className="flex items-center gap-1.5 rounded-xl bg-paint/25 px-2.5 py-1.5 text-sm font-900 text-paint-deep"
            >
              <Flame className="size-4" aria-hidden />
              {streak}
            </span>
          )}

          <LocaleSwitch />

          {status === 'ready' ? (
            <button
              type="button"
              aria-label={t('signOut')}
              onClick={() => void signOut()}
              className="rounded-xl p-2 text-muted transition-colors hover:bg-canvas hover:text-ink"
            >
              <LogOut className="size-4" aria-hidden />
            </button>
          ) : (
            <Link href="/sign-in" className="btn btn-go px-4 py-2 text-sm">
              {t('signIn')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

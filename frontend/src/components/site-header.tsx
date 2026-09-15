'use client';

import { Flame, LogOut, Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { Me } from '@/lib/admin-api';
import { Link, useRouter } from '@/i18n/navigation';
import { fetchDashboard } from '@/lib/api';
import { signOut } from '@/lib/auth-client';
import { cn } from '@/lib/cn';

import { BrandMark } from './brand-mark';
import { LocaleSwitch } from './locale-switch';
import { SoundToggle } from './sound-toggle';

/**
 * The site bar.
 *
 * Who is signed in is resolved on the server and handed down, so the bar
 * draws right the first time instead of flashing a sign-in button at someone
 * who is already signed in.
 */
export function SiteHeader({ viewer }: { viewer: Me | null }) {
  const t = useTranslations('nav');
  const brand = useTranslations('brand');
  const router = useRouter();
  const pathname = usePathname();
  const [streak, setStreak] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!viewer) return;

    // The streak sits in the header the way a game keeps its score in view.
    fetchDashboard()
      .then((stats) => setStreak(stats.streak))
      .catch(() => setStreak(null));
  }, [viewer]);

  const links = [
    { href: '/play', label: t('play') },
    { href: '/guides', label: t('guides') },
    { href: '/collections', label: t('collections') },
    { href: '/atlas', label: t('atlas') },
    { href: '/leaderboard', label: t('leaderboard') },
    { href: '/dashboard', label: t('dashboard') },
    ...(viewer ? [{ href: '/profile', label: t('profile') }] : []),
    ...(viewer?.role === 'ADMIN' ? [{ href: '/admin', label: t('admin') }] : []),
  ];

  const isActive = (href: string) => pathname.includes(href);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-line bg-paper/95 backdrop-blur-md">
      <div className="page-shell flex h-[68px] items-center gap-3 px-4 sm:gap-5 sm:px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <BrandMark className="size-9" />
          <span className="hidden font-display text-lg font-900 tracking-tight sm:inline">
            {brand('name')}
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={cn(
                'shrink-0 rounded-xl px-3 py-2 text-sm font-800 transition-colors',
                isActive(link.href)
                  ? 'bg-canvas text-ink'
                  : 'text-muted hover:bg-canvas hover:text-ink',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          {streak !== null && (
            <span
              aria-label={t('streak')}
              className="flex items-center gap-1.5 rounded-xl bg-paint/25 px-2.5 py-1.5 text-sm font-900 text-paint-deep"
            >
              <Flame className="size-4" aria-hidden />
              {streak}
            </span>
          )}

          <SoundToggle />
          <LocaleSwitch />

          {viewer ? (
            <button
              type="button"
              aria-label={t('signOut')}
              // The bar was drawn on the server for the signed-in viewer, and
              // navigating alone keeps that layout, so it has to be refreshed
              // or it goes on showing them as signed in after the session is gone.
              onClick={() =>
                void signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push('/');
                      router.refresh();
                    },
                  },
                })
              }
              className="rounded-xl p-2 text-muted transition-colors hover:bg-canvas hover:text-ink"
            >
              <LogOut className="size-4" aria-hidden />
            </button>
          ) : (
            <Link href="/sign-in" className="btn btn-go px-4 py-2 text-sm">
              {t('signIn')}
            </Link>
          )}

          <button
            type="button"
            aria-label={menuOpen ? t('close') : t('menu')}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-xl p-2 text-muted transition-colors hover:bg-canvas hover:text-ink lg:hidden"
          >
            {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {/* The small-screen menu is a sheet rather than a row that scrolls
          sideways: a link nobody can see is a link nobody presses. */}
      {menuOpen && (
        <nav className="border-t-2 border-line bg-paper lg:hidden">
          <ul className="page-shell grid gap-1 px-4 py-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  // A tapped link leaves the sheet closed behind it.
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'block rounded-xl px-3 py-3 text-base font-800 transition-colors',
                    isActive(link.href) ? 'bg-canvas text-ink' : 'text-muted hover:bg-canvas',
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

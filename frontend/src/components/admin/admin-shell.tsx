'use client';

import {
  ClipboardList,
  FileText,
  Flag,
  Layers,
  LayoutDashboard,
  Library,
  Map,
  PenLine,
  Search,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { useMe } from '@/components/admin/use-me';
import { SignInPrompt } from '@/components/sign-in-prompt';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

const SECTIONS = [
  { href: '/admin', key: 'overview', icon: LayoutDashboard },
  { href: '/admin/metas', key: 'metas', icon: Map },
  { href: '/admin/decks', key: 'decks', icon: Layers },
  { href: '/admin/countries', key: 'countries', icon: Flag },
  { href: '/admin/guides', key: 'guides', icon: Library },
  { href: '/admin/posts', key: 'posts', icon: PenLine },
  { href: '/admin/pages', key: 'pages', icon: FileText },
  { href: '/admin/seo', key: 'seo', icon: Search },
  { href: '/admin/users', key: 'users', icon: Users },
  { href: '/admin/audit', key: 'audit', icon: ClipboardList },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const { me, status } = useMe();

  if (status === 'loading') {
    return <div className="page-shell h-64 animate-pulse px-5 py-12" />;
  }

  if (status === 'anonymous') {
    return (
      <div className="page-shell px-5 py-16">
        <SignInPrompt reason="progress" />
      </div>
    );
  }

  if (me?.role !== 'ADMIN') {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-900 tracking-tight">{t('deniedTitle')}</h1>
        <p className="mt-2 text-sm text-muted">{t('deniedBody')}</p>
      </div>
    );
  }

  return (
    <div className="page-shell gap-8 px-5 py-10 lg:flex">
      <aside className="lg:w-56 lg:shrink-0">
        <p className="eyebrow">{t('title')}</p>
        <nav className="mt-4 flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {SECTIONS.map((section) => {
            const active =
              section.href === '/admin'
                ? pathname.endsWith('/admin')
                : pathname.includes(section.href);
            const Icon = section.icon;

            return (
              <Link
                key={section.href}
                href={section.href}
                className={cn(
                  'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                  active ? 'bg-edge text-ink' : 'text-muted hover:text-ink',
                )}
              >
                <Icon className="size-4" aria-hidden />
                {t(`nav.${section.key}`)}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="mt-8 min-w-0 flex-1 lg:mt-0">{children}</div>
    </div>
  );
}

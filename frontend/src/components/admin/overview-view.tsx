'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Link } from '@/i18n/navigation';
import { type AdminOverview, fetchOverview } from '@/lib/admin-api';
import { buildActivityWindow } from '@/lib/activity-window';
import { cn } from '@/lib/cn';

import { Badge, EmptyRow, Panel, TableShell, Td, Th } from './ui';

const ACTIVITY_DAYS = 30;

export function OverviewView() {
  const t = useTranslations('admin.overview');
  const categories = useTranslations('categories');
  const errors = useTranslations('errors');

  const [data, setData] = useState<AdminOverview | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetchOverview()
      .then(setData)
      .catch(() => setFailed(true));
  }, []);

  if (failed)
    return <p className="card-raised px-5 py-8 text-sm text-muted">{errors('generic')}</p>;
  if (!data) return <div className="card-raised h-64 animate-pulse" />;

  const tiles = [
    {
      label: t('metas'),
      value: data.counts.metas,
      hint: t('metasHint', { drafts: data.counts.draftMetas }),
    },
    {
      label: t('illustratedMetas'),
      value: data.counts.illustratedMetas,
      hint: t('illustratedMetasHint'),
    },
    {
      label: t('picturelessMetas'),
      value: data.counts.picturelessMetas,
      hint: t('picturelessMetasHint'),
    },
    {
      label: t('countries'),
      value: data.counts.countries,
      hint: t('countriesHint'),
    },
    { label: t('decks'), value: data.counts.decks, hint: t('decksHint') },
    {
      label: t('players'),
      value: data.counts.users,
      hint: t('playersHint', { admins: data.counts.admins }),
    },
    { label: t('answers'), value: data.counts.answers, hint: t('answersHint') },
    {
      label: t('activeToday'),
      value: data.counts.activeToday,
      hint: t('activeTodayHint'),
    },
  ];

  const days = buildActivityWindow(data.activity, ACTIVITY_DAYS);
  const busiest = Math.max(1, ...days.map((day) => day.reviews));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="card-raised px-5 py-5">
            <span className="eyebrow">{tile.label}</span>
            <p className="mt-3 font-display text-4xl font-900 tracking-tight tabular-nums">
              {tile.value}
            </p>
            <p className="mt-3 text-xs text-muted">{tile.hint}</p>
          </div>
        ))}
      </div>

      <Panel title={t('activityTitle')}>
        <div className="px-5 py-5">
          {data.activity.length === 0 ? (
            <p className="text-sm text-muted">{t('activityEmpty')}</p>
          ) : (
            <div className="flex h-24 items-end gap-[3px]">
              {days.map((day) => (
                <motion.div
                  key={day.key}
                  initial={{ height: 4 }}
                  animate={{
                    height: `${Math.max(4, (day.reviews / busiest) * 96)}px`,
                  }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  title={`${day.key}: ${day.reviews}`}
                  className={cn('flex-1 rounded-[2px]', day.reviews > 0 ? 'bg-paint' : 'bg-edge')}
                />
              ))}
            </div>
          )}
        </div>
      </Panel>

      <Panel title={t('hardestTitle')}>
        <TableShell
          head={
            <>
              <Th>{t('columnMeta')}</Th>
              <Th>{t('columnCategory')}</Th>
              <Th>{t('columnAnswers')}</Th>
              <Th>{t('columnWinRate')}</Th>
            </>
          }
        >
          {data.hardestMetas.length === 0 ? (
            <EmptyRow colSpan={4}>{t('hardestEmpty')}</EmptyRow>
          ) : (
            data.hardestMetas.map((meta) => (
              <tr key={meta.id} className="transition-colors hover:bg-canvas">
                <Td>
                  <Link href={`/admin/metas/${meta.id}`} className="hover:text-paint">
                    <span className="font-mono text-xs text-muted">{meta.countryCode}</span>{' '}
                    {meta.slug}
                  </Link>
                </Td>
                <Td className="text-muted">{categories(meta.category)}</Td>
                <Td className="font-mono tabular-nums">{meta.answers}</Td>
                <Td>
                  <Badge tone={meta.winRate >= 60 ? 'good' : 'warn'}>{meta.winRate}%</Badge>
                </Td>
              </tr>
            ))
          )}
        </TableShell>
      </Panel>
    </div>
  );
}

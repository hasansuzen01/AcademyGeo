'use client';

import { ArrowLeft, LogOut, ShieldCheck, ShieldOff, Trash2, UserCheck, UserX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCallback, useState } from 'react';

import { Link } from '@/i18n/navigation';
import {
  type AdminUserDetail,
  deleteAdminUser,
  fetchAdminUser,
  setUserRole,
  setUserStatus,
  signOutUserEverywhere,
  updateAdminUser,
} from '@/lib/admin-api';
import { useRouter } from '@/i18n/navigation';
import { formatDuration } from '@/lib/run-clock';
import { useLoad } from '@/lib/use-load';

import { Badge, Button, EmptyRow, Field, Input, Panel, TableShell, Td, Th } from './ui';

/**
 * One account, with everything an admin needs to decide what to do about it:
 * what the player has built up, where they keep going wrong, what they have
 * been doing lately, and the four buttons that change any of it.
 */
export function UserDetail({ id }: { id: string }) {
  const t = useTranslations('admin.users');
  const games = useTranslations('games');
  const errors = useTranslations('errors');
  const router = useRouter();

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchAdminUser(id);
      setUser(data);
      setName(data.name);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : errors('generic'));
    }
  }, [errors, id]);

  useLoad(load);

  /** Every button here does the same three things around its own call. */
  async function run(action: () => Promise<unknown>, message?: string) {
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      await action();
      setNote(message ?? null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : errors('generic'));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!user || !window.confirm(t('confirmDelete', { name: user.name }))) return;

    setBusy(true);
    setError(null);
    try {
      await deleteAdminUser(id);
      router.push('/admin/users');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : errors('generic'));
      setBusy(false);
    }
  }

  if (!user) {
    return error ? (
      <p className="card-raised px-5 py-8 text-sm text-stop-deep">{error}</p>
    ) : (
      <div className="card-raised h-64 animate-pulse" />
    );
  }

  const suspended = user.status === 'SUSPENDED';

  const tiles = [
    { label: t('statLevel'), value: user.level.level },
    { label: t('statXp'), value: user.xp },
    { label: t('statAnswers'), value: user.stats.answers },
    {
      label: t('statWinRate'),
      value: user.stats.winRate === null ? '—' : `${user.stats.winRate}%`,
    },
    { label: t('statStreak'), value: user.stats.streak },
    { label: t('statRuns'), value: user.stats.runs },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm font-800 text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t('backToList')}
      </Link>

      <Panel>
        <div className="flex flex-wrap items-start gap-4 px-5 py-5">
          {user.image ? (
            <Image
              src={user.image}
              alt=""
              width={56}
              height={56}
              className="size-14 rounded-full border-2 border-line object-cover"
              unoptimized
            />
          ) : (
            <span
              className="flex size-14 items-center justify-center rounded-full bg-canvas font-display text-xl font-900 text-muted"
              aria-hidden
            >
              {user.name.slice(0, 1).toUpperCase()}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <p className="font-display text-xl font-900 tracking-tight">{user.name}</p>
            <p className="font-mono text-xs text-muted">{user.email}</p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone={user.role === 'ADMIN' ? 'good' : 'neutral'}>
                {user.role === 'ADMIN' ? t('roleAdmin') : t('roleUser')}
              </Badge>
              <Badge tone={suspended ? 'warn' : 'neutral'}>
                {suspended ? t('statusSuspended') : t('statusActive')}
              </Badge>
              <Badge tone="neutral">
                {t('joined', { date: new Date(user.createdAt).toLocaleDateString() })}
              </Badge>
              <Badge tone="neutral">
                {user.lastSeenAt
                  ? t('lastSeen', { date: new Date(user.lastSeenAt).toLocaleString() })
                  : t('neverSeen')}
              </Badge>
            </div>

            {suspended && user.suspendReason && (
              <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-sm text-muted">
                {t('suspendedBecause', { reason: user.suspendReason })}
              </p>
            )}
          </div>
        </div>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((tile) => (
          <div key={tile.label} className="card-raised px-4 py-3">
            <p className="eyebrow">{tile.label}</p>
            <p className="mt-1 font-display text-2xl font-900 tabular-nums">{tile.value}</p>
          </div>
        ))}
      </div>

      <Panel title={t('actionsTitle')}>
        <div className="space-y-5 px-5 py-5">
          <Field label={t('nameLabel')} hint={t('nameHint')}>
            <div className="flex gap-2">
              <Input value={name} onChange={(event) => setName(event.target.value)} />
              <Button
                type="button"
                disabled={busy || name.trim() === '' || name === user.name}
                onClick={() => void run(() => updateAdminUser(id, { name: name.trim() }), t('saved'))}
              >
                {t('saveName')}
              </Button>
            </div>
          </Field>

          {!suspended && (
            <Field label={t('reasonLabel')} hint={t('reasonHint')}>
              <Input value={reason} onChange={(event) => setReason(event.target.value)} />
            </Field>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() =>
                void run(() => setUserRole(id, user.role === 'ADMIN' ? 'USER' : 'ADMIN'))
              }
            >
              {user.role === 'ADMIN' ? (
                <ShieldOff className="size-3.5" aria-hidden />
              ) : (
                <ShieldCheck className="size-3.5" aria-hidden />
              )}
              {user.role === 'ADMIN' ? t('demote') : t('promote')}
            </Button>

            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() =>
                void run(() =>
                  setUserStatus(id, suspended ? 'ACTIVE' : 'SUSPENDED', reason || undefined),
                )
              }
            >
              {suspended ? (
                <UserCheck className="size-3.5" aria-hidden />
              ) : (
                <UserX className="size-3.5" aria-hidden />
              )}
              {suspended ? t('restore') : t('suspend')}
            </Button>

            <Button
              type="button"
              variant="ghost"
              disabled={busy || user.stats.openSessions === 0}
              onClick={() =>
                void run(async () => {
                  const { revoked } = await signOutUserEverywhere(id);
                  setNote(t('signedOut', { count: revoked }));
                })
              }
            >
              <LogOut className="size-3.5" aria-hidden />
              {t('signOutEverywhere', { count: user.stats.openSessions })}
            </Button>

            <Button type="button" variant="ghost" disabled={busy} onClick={() => void remove()}>
              <Trash2 className="size-3.5" aria-hidden />
              {t('deleteAccount')}
            </Button>
          </div>

          <p className="text-xs text-muted">{t('deleteWarning')}</p>

          {note && <p className="text-sm text-go-deep">{note}</p>}
          {error && <p className="text-sm text-stop-deep">{error}</p>}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={t('weakestTitle')}>
          <TableShell
            head={
              <>
                <Th>{t('columnCountry')}</Th>
                <Th>{t('columnMisses')}</Th>
                <Th>{t('columnWinRate')}</Th>
              </>
            }
          >
            {user.weakestCountries.length === 0 && (
              <EmptyRow colSpan={3}>{t('weakestEmpty')}</EmptyRow>
            )}
            {user.weakestCountries.map((row) => (
              <tr key={row.countryCode}>
                <Td className="font-mono text-xs">{row.countryCode}</Td>
                <Td className="font-mono tabular-nums">{row.misses}</Td>
                <Td>
                  <Badge tone={row.winRate >= 60 ? 'good' : 'warn'}>{row.winRate}%</Badge>
                </Td>
              </tr>
            ))}
          </TableShell>
        </Panel>

        <Panel title={t('runsTitle')}>
          <TableShell
            head={
              <>
                <Th>{t('columnMode')}</Th>
                <Th>{t('columnScore')}</Th>
                <Th>{t('columnResult')}</Th>
                <Th>{t('columnWhen')}</Th>
              </>
            }
          >
            {user.recentRuns.length === 0 && <EmptyRow colSpan={4}>{t('runsEmpty')}</EmptyRow>}
            {user.recentRuns.map((run) => (
              <tr key={run.id}>
                <Td>{games(`modes.${run.mode}.name`)}</Td>
                <Td className="font-mono tabular-nums">{run.score}</Td>
                <Td className="text-xs text-muted">
                  {run.correct}/{run.answered} · {formatDuration(run.durationMs)}
                </Td>
                <Td className="text-xs text-muted">
                  {new Date(run.finishedAt).toLocaleDateString()}
                </Td>
              </tr>
            ))}
          </TableShell>
        </Panel>
      </div>

      <Panel title={t('badgesTitle')}>
        <div className="flex flex-wrap gap-2 px-5 py-5">
          {user.achievements.map((achievement) => (
            <Badge key={achievement.code} tone={achievement.unlocked ? 'good' : 'neutral'}>
              {achievement.code}
              {!achievement.unlocked && ` ${achievement.current}/${achievement.threshold}`}
            </Badge>
          ))}
        </div>
      </Panel>
    </div>
  );
}

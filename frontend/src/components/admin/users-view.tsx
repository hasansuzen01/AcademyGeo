'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { Link } from '@/i18n/navigation';
import { type AdminUser, fetchAdminUsers } from '@/lib/admin-api';

import {
  Badge,
  EmptyRow,
  Input,
  Pagination,
  Panel,
  Select,
  TableShell,
  Td,
  Th,
} from './ui';

const PAGE_SIZE = 20;

export function UsersView() {
  const t = useTranslations('admin.users');
  const errors = useTranslations('errors');

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [skip, setSkip] = useState(0);
  const [items, setItems] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const page = await fetchAdminUsers({
        search: search || undefined,
        role: role || undefined,
        status: status || undefined,
        take: PAGE_SIZE,
        skip,
      });
      setItems(page.items);
      setTotal(page.total);
      setError(null);
    } catch {
      setError(errors('generic'));
    }
  }, [errors, role, status, search, skip]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 200);
    return () => window.clearTimeout(timer);
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-48 flex-1">
          <Input
            value={search}
            placeholder={t('searchPlaceholder')}
            onChange={(event) => {
              setSkip(0);
              setSearch(event.target.value);
            }}
          />
        </div>
        <Select
          value={role}
          onChange={(event) => {
            setSkip(0);
            setRole(event.target.value);
          }}
          className="w-40"
        >
          <option value="">{t('anyRole')}</option>
          <option value="ADMIN">{t('roleAdmin')}</option>
          <option value="USER">{t('roleUser')}</option>
        </Select>
        <Select
          value={status}
          onChange={(event) => {
            setSkip(0);
            setStatus(event.target.value);
          }}
          className="w-40"
        >
          <option value="">{t('anyStatus')}</option>
          <option value="ACTIVE">{t('statusActive')}</option>
          <option value="SUSPENDED">{t('statusSuspended')}</option>
        </Select>
      </div>

      {error && <p className="card-raised px-5 py-3 text-sm text-stop-deep">{error}</p>}

      <Panel>
        <TableShell
          head={
            <>
              <Th>{t('columnPerson')}</Th>
              <Th>{t('columnLevel')}</Th>
              <Th>{t('columnAnswers')}</Th>
              <Th>{t('columnLastSeen')}</Th>
              <Th>{t('columnRole')}</Th>
              <Th className="w-32" />
            </>
          }
        >
          {items.length === 0 && <EmptyRow colSpan={6}>{t('empty')}</EmptyRow>}
          {items.map((user) => (
            <tr key={user.id} className="transition-colors hover:bg-canvas">
              <Td>
                <Link href={`/admin/users/${user.id}`} className="hover:text-paint-deep">
                  <span className="block">{user.name}</span>
                  <span className="font-mono text-xs text-muted">{user.email}</span>
                </Link>
              </Td>
              <Td className="font-mono tabular-nums text-muted">{user.level}</Td>
              <Td className="font-mono tabular-nums text-muted">{user._count?.reviewLogs ?? 0}</Td>
              <Td className="text-xs text-muted">
                {user.lastSeenAt ? new Date(user.lastSeenAt).toLocaleDateString() : t('neverSeen')}
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone={user.role === 'ADMIN' ? 'good' : 'neutral'}>
                    {user.role === 'ADMIN' ? t('roleAdmin') : t('roleUser')}
                  </Badge>
                  {user.status === 'SUSPENDED' && (
                    <Badge tone="warn">{t('statusSuspended')}</Badge>
                  )}
                </div>
              </Td>
              <Td>
                <div className="flex justify-end">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="rounded-md border border-line px-2.5 py-1.5 text-xs font-800 text-muted transition-colors hover:border-muted hover:text-ink"
                  >
                    {t('manage')}
                  </Link>
                </div>
              </Td>
            </tr>
          ))}
        </TableShell>

        <Pagination total={total} skip={skip} take={PAGE_SIZE} onChange={setSkip} />
      </Panel>
    </div>
  );
}

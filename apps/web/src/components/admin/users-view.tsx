'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { type AdminUser, fetchAdminUsers, setUserRole } from '@/lib/admin-api';

import {
  Badge,
  Button,
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
  const [skip, setSkip] = useState(0);
  const [items, setItems] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const page = await fetchAdminUsers({
        search: search || undefined,
        role: role || undefined,
        take: PAGE_SIZE,
        skip,
      });
      setItems(page.items);
      setTotal(page.total);
      setError(null);
    } catch {
      setError(errors('generic'));
    }
  }, [errors, role, search, skip]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 200);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function toggleRole(user: AdminUser) {
    setError(null);
    try {
      await setUserRole(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : errors('generic'));
    }
  }

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
      </div>

      {error && <p className="card-raised px-5 py-3 text-sm text-stop">{error}</p>}

      <Panel>
        <TableShell
          head={
            <>
              <Th>{t('columnPerson')}</Th>
              <Th>{t('columnJoined')}</Th>
              <Th>{t('columnAnswers')}</Th>
              <Th>{t('columnRole')}</Th>
              <Th className="w-32" />
            </>
          }
        >
          {items.length === 0 && <EmptyRow colSpan={5}>{t('empty')}</EmptyRow>}
          {items.map((user) => (
            <tr key={user.id} className="transition-colors hover:bg-canvas">
              <Td>
                <span className="block">{user.name}</span>
                <span className="font-mono text-xs text-muted">{user.email}</span>
              </Td>
              <Td className="text-xs text-muted">
                {new Date(user.createdAt).toLocaleDateString()}
              </Td>
              <Td className="font-mono tabular-nums text-muted">{user._count?.reviewLogs ?? 0}</Td>
              <Td>
                <Badge tone={user.role === 'ADMIN' ? 'good' : 'neutral'}>
                  {user.role === 'ADMIN' ? t('roleAdmin') : t('roleUser')}
                </Badge>
              </Td>
              <Td>
                <div className="flex justify-end">
                  <Button variant="ghost" type="button" onClick={() => void toggleRole(user)}>
                    {user.role === 'ADMIN' ? t('demote') : t('promote')}
                  </Button>
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

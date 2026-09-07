'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { type AuditEntry, fetchAuditLog } from '@/lib/admin-api';
import { useLoad } from '@/lib/use-load';

import { Badge, EmptyRow, Pagination, Panel, TableShell, Td, Th } from './ui';

const PAGE_SIZE = 25;

export function AuditView() {
  const t = useTranslations('admin.audit');
  const errors = useTranslations('errors');

  const [items, setItems] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const page = await fetchAuditLog({ take: PAGE_SIZE, skip });
      setItems(page.items);
      setTotal(page.total);
    } catch {
      setError(errors('generic'));
    }
  }, [errors, skip]);

  useLoad(load);

  return (
    <Panel title={t('title')}>
      {error && <p className="px-5 py-3 text-sm text-stop-deep">{error}</p>}

      <TableShell
        head={
          <>
            <Th>{t('columnWhen')}</Th>
            <Th>{t('columnWho')}</Th>
            <Th>{t('columnAction')}</Th>
            <Th>{t('columnWhat')}</Th>
          </>
        }
      >
        {items.length === 0 && <EmptyRow colSpan={4}>{t('empty')}</EmptyRow>}
        {items.map((entry) => (
          <tr key={entry.id} className="transition-colors hover:bg-canvas">
            <Td className="font-mono text-xs whitespace-nowrap text-muted">
              {new Date(entry.createdAt).toLocaleString()}
            </Td>
            <Td className="text-sm">{entry.actor?.name ?? t('unknownActor')}</Td>
            <Td>
              <Badge tone={entry.action === 'delete' ? 'warn' : 'neutral'}>
                {entry.action} {entry.entity}
              </Badge>
            </Td>
            <Td className="text-sm text-muted">{entry.summary}</Td>
          </tr>
        ))}
      </TableShell>

      <Pagination total={total} skip={skip} take={PAGE_SIZE} onChange={setSkip} />
    </Panel>
  );
}

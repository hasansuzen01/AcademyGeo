'use client';

import { Plus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Link } from '@/i18n/navigation';
import { type AdminDeck, fetchAdminDecks } from '@/lib/admin-api';

import { Badge, EmptyRow, Panel, TableShell, Td, Th } from './ui';

export function DecksView() {
  const t = useTranslations('admin.decks');
  const errors = useTranslations('errors');
  const locale = useLocale();

  const [items, setItems] = useState<AdminDeck[]>([]);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminDecks({ take: 50 })
      .then((page) => setItems(page.items))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{t('lede')}</p>
        <Link href="/admin/decks/new" className="inline-flex items-center gap-2 btn btn-go">
          <Plus className="size-4" aria-hidden />
          {t('create')}
        </Link>
      </div>

      <Panel>
        <TableShell
          head={
            <>
              <Th>{t('columnName')}</Th>
              <Th>{t('columnCards')}</Th>
              <Th>{t('columnWindow')}</Th>
              <Th>{t('columnState')}</Th>
            </>
          }
        >
          {failed && <EmptyRow colSpan={4}>{errors('generic')}</EmptyRow>}
          {!failed && !loading && items.length === 0 && (
            <EmptyRow colSpan={4}>{t('empty')}</EmptyRow>
          )}
          {items.map((deck) => (
            <tr key={deck.id} className="transition-colors hover:bg-canvas">
              <Td>
                <Link href={`/admin/decks/${deck.id}`} className="hover:text-paint">
                  <span className="block">{locale === 'tr' ? deck.nameTr : deck.nameEn}</span>
                  <span className="font-mono text-xs text-muted">{deck.slug}</span>
                </Link>
              </Td>
              <Td className="font-mono tabular-nums">{deck._count?.metas ?? 0}</Td>
              <Td className="text-xs text-muted">{formatWindow(deck, t('always'))}</Td>
              <Td>
                <Badge tone={deck.isPublished ? 'good' : 'warn'}>
                  {deck.isPublished ? t('published') : t('draft')}
                </Badge>
              </Td>
            </tr>
          ))}
        </TableShell>
      </Panel>
    </div>
  );
}

function formatWindow(deck: AdminDeck, always: string): string {
  if (!deck.startsAt && !deck.endsAt) return always;

  const from = deck.startsAt ? new Date(deck.startsAt).toLocaleDateString() : '…';
  const to = deck.endsAt ? new Date(deck.endsAt).toLocaleDateString() : '…';

  return `${from} → ${to}`;
}

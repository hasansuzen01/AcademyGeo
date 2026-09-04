'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { Link } from '@/i18n/navigation';
import { type AdminPage, fetchAdminPages } from '@/lib/admin-api';
import { useLoad } from '@/lib/use-load';

import { Badge, EmptyRow, Panel, Select, TableShell, Td, Th } from './ui';

/** The standing pages the footer links to. */
export function PagesView() {
  const t = useTranslations('admin.pages');
  const errors = useTranslations('errors');

  const [locale, setLocale] = useState('');
  const [items, setItems] = useState<AdminPage[]>([]);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const page = await fetchAdminPages({ locale: locale || undefined });
      setItems(page.items);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [locale]);

  useLoad(load);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={locale} onChange={(event) => setLocale(event.target.value)} className="w-36">
          <option value="">{t('anyLocale')}</option>
          <option value="en">EN</option>
          <option value="tr">TR</option>
        </Select>
        <Link href="/admin/pages/new" className="inline-flex items-center gap-2 btn btn-go">
          <Plus className="size-4" aria-hidden />
          {t('create')}
        </Link>
      </div>

      <Panel title={t('title')}>
        <TableShell
          head={
            <>
              <Th>{t('columnTitle')}</Th>
              <Th>{t('columnLocale')}</Th>
              <Th>{t('columnOrder')}</Th>
              <Th>{t('columnSitemap')}</Th>
              <Th>{t('columnState')}</Th>
            </>
          }
        >
          {failed && <EmptyRow colSpan={5}>{errors('generic')}</EmptyRow>}
          {!failed && items.length === 0 && <EmptyRow colSpan={5}>{t('empty')}</EmptyRow>}

          {items.map((page) => (
            <tr key={page.id} className="border-t border-line">
              <Td>
                <Link href={`/admin/pages/${page.id}`} className="hover:text-go-deep">
                  <span className="block font-600">{page.title}</span>
                  <span className="font-mono text-xs text-muted">/{page.slug}</span>
                </Link>
              </Td>
              <Td className="font-mono text-xs uppercase text-muted">{page.locale}</Td>
              <Td className="font-mono tabular-nums text-muted">{page.footerOrder}</Td>
              <Td>
                <Badge tone={page.includeInSitemap ? 'good' : 'warn'}>
                  {page.includeInSitemap ? t('inSitemap') : t('outOfSitemap')}
                </Badge>
              </Td>
              <Td>
                <Badge tone={page.status === 'PUBLISHED' ? 'good' : 'warn'}>
                  {page.status === 'PUBLISHED' ? t('published') : t('draft')}
                </Badge>
              </Td>
            </tr>
          ))}
        </TableShell>
      </Panel>
    </div>
  );
}

'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { Link } from '@/i18n/navigation';
import { type AdminGuideTopic, fetchAdminGuides } from '@/lib/admin-api';
import { GuideIcon } from '@/lib/guide-icons';
import { useLoad } from '@/lib/use-load';

import { Badge, EmptyRow, Input, Panel, Select, TableShell, Td, Th } from './ui';

/** The headings, in the order they appear in the library. */
export function GuidesView() {
  const t = useTranslations('admin.guides');
  const errors = useTranslations('errors');

  const [search, setSearch] = useState('');
  const [locale, setLocale] = useState('');
  const [status, setStatus] = useState('');

  const [items, setItems] = useState<AdminGuideTopic[]>([]);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const page = await fetchAdminGuides({
        search: search || undefined,
        locale: locale || undefined,
        status: status || undefined,
      });
      setItems(page.items);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [locale, search, status]);

  useLoad(load);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          placeholder={t('searchPlaceholder')}
          onChange={(event) => setSearch(event.target.value)}
          className="w-64"
        />
        <Select value={locale} onChange={(event) => setLocale(event.target.value)} className="w-36">
          <option value="">{t('anyLocale')}</option>
          <option value="tr">TR</option>
          <option value="en">EN</option>
        </Select>
        <Select value={status} onChange={(event) => setStatus(event.target.value)} className="w-40">
          <option value="">{t('anyState')}</option>
          <option value="PUBLISHED">{t('published')}</option>
          <option value="DRAFT">{t('draft')}</option>
        </Select>
        <Link href="/admin/guides/new" className="inline-flex items-center gap-2 btn btn-go">
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
              <Th>{t('columnEntries')}</Th>
              <Th>{t('columnPosition')}</Th>
              <Th>{t('columnState')}</Th>
            </>
          }
        >
          {failed && <EmptyRow colSpan={5}>{errors('generic')}</EmptyRow>}
          {!failed && items.length === 0 && <EmptyRow colSpan={5}>{t('empty')}</EmptyRow>}

          {items.map((topic) => (
            <tr key={topic.id} className="border-t border-line">
              <Td>
                <Link
                  href={`/admin/guides/${topic.id}`}
                  className="flex items-center gap-3 hover:text-go-deep"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-paint/25 text-paint-deep">
                    <GuideIcon name={topic.icon} className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-600">{topic.title}</span>
                    <span className="font-mono text-xs text-muted">{topic.slug}</span>
                  </span>
                </Link>
              </Td>
              <Td className="font-mono text-xs uppercase text-muted">{topic.locale}</Td>
              <Td className="font-mono tabular-nums text-muted">{topic._count.entries}</Td>
              <Td className="font-mono tabular-nums text-muted">{topic.position}</Td>
              <Td>
                <Badge tone={topic.status === 'PUBLISHED' ? 'good' : 'warn'}>
                  {topic.status === 'PUBLISHED' ? t('published') : t('draft')}
                </Badge>
              </Td>
            </tr>
          ))}
        </TableShell>
      </Panel>
    </div>
  );
}

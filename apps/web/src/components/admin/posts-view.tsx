'use client';

import { Plus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { Link } from '@/i18n/navigation';
import { type AdminPost, fetchAdminPosts } from '@/lib/admin-api';
import { useLoad } from '@/lib/use-load';

import { Badge, EmptyRow, Input, Pagination, Panel, Select, TableShell, Td, Th } from './ui';

const PAGE_SIZE = 20;

export function PostsView() {
  const t = useTranslations('admin.posts');
  const errors = useTranslations('errors');
  const uiLocale = useLocale();

  const [search, setSearch] = useState('');
  const [locale, setLocale] = useState('');
  const [status, setStatus] = useState('');
  const [skip, setSkip] = useState(0);

  const [items, setItems] = useState<AdminPost[]>([]);
  const [total, setTotal] = useState(0);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const page = await fetchAdminPosts({
        search: search || undefined,
        locale: locale || undefined,
        status: status || undefined,
        take: PAGE_SIZE,
        skip,
      });
      setItems(page.items);
      setTotal(page.total);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [locale, search, skip, status]);

  useLoad(load);

  function changeFilter(apply: () => void) {
    apply();
    setSkip(0);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          placeholder={t('searchPlaceholder')}
          onChange={(event) => changeFilter(() => setSearch(event.target.value))}
          className="w-64"
        />
        <Select
          value={locale}
          onChange={(event) => changeFilter(() => setLocale(event.target.value))}
          className="w-36"
        >
          <option value="">{t('anyLocale')}</option>
          <option value="en">EN</option>
          <option value="tr">TR</option>
        </Select>
        <Select
          value={status}
          onChange={(event) => changeFilter(() => setStatus(event.target.value))}
          className="w-40"
        >
          <option value="">{t('anyState')}</option>
          <option value="PUBLISHED">{t('published')}</option>
          <option value="DRAFT">{t('draft')}</option>
        </Select>
        <Link href="/admin/posts/new" className="inline-flex items-center gap-2 btn btn-go">
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
              <Th>{t('columnReading')}</Th>
              <Th>{t('columnViews')}</Th>
              <Th>{t('columnState')}</Th>
            </>
          }
        >
          {failed && <EmptyRow colSpan={5}>{errors('generic')}</EmptyRow>}
          {!failed && items.length === 0 && <EmptyRow colSpan={5}>{t('empty')}</EmptyRow>}

          {items.map((post) => (
            <tr key={post.id} className="border-t border-line">
              <Td>
                <Link href={`/admin/posts/${post.id}`} className="hover:text-go-deep">
                  <span className="block font-600">{post.title}</span>
                  <span className="font-mono text-xs text-muted">{post.slug}</span>
                </Link>
              </Td>
              <Td className="font-mono text-xs uppercase text-muted">{post.locale}</Td>
              <Td className="font-mono tabular-nums text-muted">{post.readingTime}</Td>
              <Td className="font-mono tabular-nums text-muted">{post.viewCount}</Td>
              <Td>
                <Badge tone={post.status === 'PUBLISHED' ? 'good' : 'warn'}>
                  {post.status === 'PUBLISHED' ? t('published') : t('draft')}
                </Badge>
                {post.publishedAt && (
                  <span className="ml-2 font-mono text-xs text-muted">
                    {new Date(post.publishedAt).toLocaleDateString(uiLocale)}
                  </span>
                )}
              </Td>
            </tr>
          ))}
        </TableShell>

        <Pagination total={total} skip={skip} take={PAGE_SIZE} onChange={setSkip} />
      </Panel>
    </div>
  );
}

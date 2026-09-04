'use client';

import { Plus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import { Link } from '@/i18n/navigation';
import {
  type AdminCountry,
  type AdminMeta,
  META_CATEGORIES,
  fetchAdminCountries,
  fetchAdminMetas,
} from '@/lib/admin-api';

import { needsRealPhoto } from '@/lib/card-image';

import { Badge, EmptyRow, Input, Pagination, Panel, Select, TableShell, Td, Th } from './ui';

const PAGE_SIZE = 20;

export function MetasView() {
  const t = useTranslations('admin.metas');
  const categories = useTranslations('categories');
  const errors = useTranslations('errors');
  const locale = useLocale();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [published, setPublished] = useState('');
  const [imageSource, setImageSource] = useState('');
  const [skip, setSkip] = useState(0);

  const [countries, setCountries] = useState<AdminCountry[]>([]);
  const [items, setItems] = useState<AdminMeta[]>([]);
  const [total, setTotal] = useState(0);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminCountries()
      .then(setCountries)
      .catch(() => undefined);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await fetchAdminMetas({
        search: search || undefined,
        category: category || undefined,
        countryCode: countryCode || undefined,
        isPublished: published === '' ? undefined : published === 'true',
        imageSource: imageSource || undefined,
        take: PAGE_SIZE,
        skip,
      });
      setItems(page.items);
      setTotal(page.total);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [category, countryCode, published, imageSource, search, skip]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 200);
    return () => window.clearTimeout(timer);
  }, [load]);

  function changeFilter(apply: () => void) {
    setSkip(0);
    apply();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-48 flex-1">
          <Input
            value={search}
            placeholder={t('searchPlaceholder')}
            onChange={(event) => changeFilter(() => setSearch(event.target.value))}
          />
        </div>
        <Select
          value={category}
          onChange={(event) => changeFilter(() => setCategory(event.target.value))}
          className="w-44"
        >
          <option value="">{t('allCategories')}</option>
          {META_CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {categories(value)}
            </option>
          ))}
        </Select>
        <Select
          value={countryCode}
          onChange={(event) => changeFilter(() => setCountryCode(event.target.value))}
          className="w-44"
        >
          <option value="">{t('allCountries')}</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {locale === 'tr' ? country.nameTr : country.nameEn}
            </option>
          ))}
        </Select>
        <Select
          value={published}
          onChange={(event) => changeFilter(() => setPublished(event.target.value))}
          className="w-36"
        >
          <option value="">{t('anyState')}</option>
          <option value="true">{t('published')}</option>
          <option value="false">{t('draft')}</option>
        </Select>
        <Select
          value={imageSource}
          onChange={(event) => changeFilter(() => setImageSource(event.target.value))}
          className="w-40"
        >
          <option value="">{t('filterAll')}</option>
          <option value="PHOTO">{t('filterPhoto')}</option>
          <option value="ILLUSTRATION">{t('filterIllustration')}</option>
        </Select>
        <Link href="/admin/metas/new" className="inline-flex items-center gap-2 btn btn-go">
          <Plus className="size-4" aria-hidden />
          {t('create')}
        </Link>
      </div>

      <Panel>
        <TableShell
          head={
            <>
              <Th className="w-20">{t('columnImage')}</Th>
              <Th>{t('columnSlug')}</Th>
              <Th>{t('columnCountry')}</Th>
              <Th>{t('columnCategory')}</Th>
              <Th>{t('columnDifficulty')}</Th>
              <Th>{t('columnAnswers')}</Th>
              <Th>{t('columnState')}</Th>
            </>
          }
        >
          {failed && <EmptyRow colSpan={7}>{errors('generic')}</EmptyRow>}
          {!failed && items.length === 0 && !loading && (
            <EmptyRow colSpan={7}>{t('empty')}</EmptyRow>
          )}
          {items.map((meta) => (
            <tr key={meta.id} className="transition-colors hover:bg-canvas">
              <Td>
                <span className="relative block h-9 w-14 overflow-hidden rounded border border-line bg-canvas">
                  <Image src={meta.imageUrl} alt="" fill sizes="56px" className="object-contain" />
                </span>
              </Td>
              <Td>
                <Link href={`/admin/metas/${meta.id}`} className="hover:text-paint">
                  <span className="block">{locale === 'tr' ? meta.titleTr : meta.titleEn}</span>
                  <span className="font-mono text-xs text-muted">{meta.slug}</span>
                </Link>
              </Td>
              <Td className="font-mono text-xs text-muted">{meta.countryCode}</Td>
              <Td className="text-muted">{categories(meta.category)}</Td>
              <Td className="font-mono tabular-nums">{meta.difficulty}</Td>
              <Td className="font-mono tabular-nums text-muted">{meta._count?.logs ?? 0}</Td>
              <Td>
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone={meta.isPublished ? 'good' : 'warn'}>
                    {meta.isPublished ? t('published') : t('draft')}
                  </Badge>
                  {needsRealPhoto(meta.imageSource) && <Badge tone="warn">{t('needsPhoto')}</Badge>}
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

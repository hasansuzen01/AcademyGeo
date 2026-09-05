'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import {
  type AdminCountry,
  REGIONS,
  type Region,
  createAdminCountry,
  deleteAdminCountry,
  fetchAdminCountries,
  updateAdminCountry,
} from '@/lib/admin-api';
import { useLoad } from '@/lib/use-load';

import { Badge, Button, EmptyRow, Field, Input, Panel, Select, TableShell, Td, Th } from './ui';

type Draft = Omit<AdminCountry, '_count'>;

const BLANK: Draft = { code: '', nameEn: '', nameTr: '', region: 'EUROPE' };

export function CountriesView() {
  const t = useTranslations('admin.countries');
  const regions = useTranslations('regions');
  const errors = useTranslations('errors');

  const [items, setItems] = useState<AdminCountry[]>([]);
  const [draft, setDraft] = useState<Draft>(BLANK);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await fetchAdminCountries());
    } catch {
      setError(errors('generic'));
    }
  }, [errors]);

  useLoad(load);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const body = { ...draft, code: draft.code.toUpperCase() };
      if (editingCode) {
        await updateAdminCountry(editingCode, body);
      } else {
        await createAdminCountry(body);
      }
      setDraft(BLANK);
      setEditingCode(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : errors('generic'));
    } finally {
      setSaving(false);
    }
  }

  async function remove(country: AdminCountry) {
    if (!window.confirm(t('confirmDelete', { name: country.nameEn }))) return;

    setError(null);
    try {
      await deleteAdminCountry(country.code);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : errors('generic'));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <Panel title={t('title')}>
        <TableShell
          head={
            <>
              <Th className="w-16">{t('columnCode')}</Th>
              <Th>{t('columnNameEn')}</Th>
              <Th>{t('columnNameTr')}</Th>
              <Th>{t('columnRegion')}</Th>
              <Th>{t('columnMetas')}</Th>
              <Th className="w-24" />
            </>
          }
        >
          {items.length === 0 && <EmptyRow colSpan={6}>{t('empty')}</EmptyRow>}
          {items.map((country) => (
            <tr key={country.code} className="transition-colors hover:bg-canvas">
              <Td className="font-mono text-xs">{country.code}</Td>
              <Td>{country.nameEn}</Td>
              <Td>{country.nameTr}</Td>
              <Td className="text-muted">{regions(country.region)}</Td>
              <Td>
                <Badge>{country._count?.metas ?? 0}</Badge>
              </Td>
              <Td>
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    aria-label={t('edit')}
                    onClick={() => {
                      setEditingCode(country.code);
                      setDraft({
                        code: country.code,
                        nameEn: country.nameEn,
                        nameTr: country.nameTr,
                        region: country.region,
                      });
                    }}
                    className="rounded-md border border-line p-1.5 text-muted transition-colors hover:border-muted hover:text-ink"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={t('delete')}
                    onClick={() => void remove(country)}
                    className="rounded-md border border-line p-1.5 text-muted transition-colors hover:border-stop hover:text-stop"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </Td>
            </tr>
          ))}
        </TableShell>
      </Panel>

      <Panel title={editingCode ? t('editTitle', { code: editingCode }) : t('createTitle')}>
        <div className="space-y-4 px-5 py-5">
          <Field label={t('columnCode')} hint={t('codeHint')}>
            <Input
              value={draft.code}
              maxLength={2}
              disabled={Boolean(editingCode)}
              onChange={(event) => setDraft({ ...draft, code: event.target.value.toUpperCase() })}
            />
          </Field>
          <Field label={t('columnNameEn')}>
            <Input
              value={draft.nameEn}
              onChange={(event) => setDraft({ ...draft, nameEn: event.target.value })}
            />
          </Field>
          <Field label={t('columnNameTr')}>
            <Input
              value={draft.nameTr}
              onChange={(event) => setDraft({ ...draft, nameTr: event.target.value })}
            />
          </Field>
          <Field label={t('columnRegion')} hint={t('regionHint')}>
            <Select
              value={draft.region}
              onChange={(event) => setDraft({ ...draft, region: event.target.value as Region })}
            >
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {regions(region)}
                </option>
              ))}
            </Select>
          </Field>

          {error && <p className="text-sm text-stop">{error}</p>}

          <div className="flex gap-2">
            <Button type="button" disabled={saving} onClick={() => void save()}>
              <Plus className="size-3.5" aria-hidden />
              {editingCode ? t('save') : t('add')}
            </Button>
            {editingCode && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditingCode(null);
                  setDraft(BLANK);
                }}
              >
                {t('cancel')}
              </Button>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}

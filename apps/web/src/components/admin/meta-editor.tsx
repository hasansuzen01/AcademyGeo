'use client';

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useRouter } from '@/i18n/navigation';
import {
  type AdminCountry,
  type AdminMetaDetail,
  META_CATEGORIES,
  type MetaCategory,
  type MetaInput,
  createAdminMeta,
  deleteAdminMeta,
  fetchAdminCountries,
  fetchAdminMeta,
  fetchStorageStatus,
  updateAdminMeta,
} from '@/lib/admin-api';

import { ImageField } from './image-field';
import { Badge, Button, Field, Input, Panel, Select, Textarea } from './ui';

const BLANK: MetaInput = {
  slug: '',
  countryCode: '',
  category: 'PLATE',
  titleEn: '',
  titleTr: '',
  descriptionEn: '',
  descriptionTr: '',
  imageUrl: '',
  imageKey: null,
  difficulty: 2,
  isPublished: false,
};

export function MetaEditor({ metaId }: { metaId?: string }) {
  const t = useTranslations('admin.metaEditor');
  const categories = useTranslations('categories');
  const router = useRouter();

  const [form, setForm] = useState<MetaInput>(BLANK);
  const [detail, setDetail] = useState<AdminMetaDetail | null>(null);
  const [countries, setCountries] = useState<AdminCountry[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(metaId));

  useEffect(() => {
    fetchAdminCountries()
      .then((list) => {
        setCountries(list);
        setForm((current) =>
          current.countryCode ? current : { ...current, countryCode: list[0]?.code ?? '' },
        );
      })
      .catch(() => undefined);
    fetchStorageStatus()
      .then((status) => setStorageReady(status.configured))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!metaId) return;

    fetchAdminMeta(metaId)
      .then((meta) => {
        setDetail(meta);
        setForm({
          slug: meta.slug,
          countryCode: meta.countryCode,
          category: meta.category,
          titleEn: meta.titleEn,
          titleTr: meta.titleTr,
          descriptionEn: meta.descriptionEn,
          descriptionTr: meta.descriptionTr,
          imageUrl: meta.imageUrl,
          imageKey: meta.imageKey,
          difficulty: meta.difficulty,
          isPublished: meta.isPublished,
        });
      })
      .catch(() => setError(t('loadFailed')))
      .finally(() => setLoading(false));
  }, [metaId, t]);

  function set<K extends keyof MetaInput>(key: K, value: MetaInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const saved = metaId ? await updateAdminMeta(metaId, form) : await createAdminMeta(form);
      router.push(`/admin/metas/${saved.id}`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!metaId || !window.confirm(t('confirmDelete'))) return;

    try {
      await deleteAdminMeta(metaId);
      router.push('/admin/metas');
    } catch {
      setError(t('saveFailed'));
    }
  }

  if (loading) return <div className="card-raised h-96 animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-800 tracking-tight">
            {metaId ? t('editTitle') : t('createTitle')}
          </h1>
          {detail && (
            <p className="mt-1 font-mono text-xs text-muted">
              {t('lastEdited', {
                when: new Date(detail.updatedAt).toLocaleString(),
              })}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {metaId && (
            <Button variant="danger" type="button" onClick={() => void remove()}>
              <Trash2 className="size-3.5" aria-hidden />
              {t('delete')}
            </Button>
          )}
          <Button type="button" disabled={saving} onClick={() => void save()}>
            {saving ? t('saving') : t('save')}
          </Button>
        </div>
      </div>

      {error && <p className="card-raised px-5 py-3 text-sm text-stop">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Panel title={t('sectionBasics')}>
            <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
              <Field label={t('slug')} hint={t('slugHint')}>
                <Input value={form.slug} onChange={(event) => set('slug', event.target.value)} />
              </Field>
              <Field label={t('country')}>
                <Select
                  value={form.countryCode}
                  onChange={(event) => set('countryCode', event.target.value)}
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.code} · {country.nameEn}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t('category')}>
                <Select
                  value={form.category}
                  onChange={(event) => set('category', event.target.value as MetaCategory)}
                >
                  {META_CATEGORIES.map((value) => (
                    <option key={value} value={value}>
                      {categories(value)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t('difficulty')} hint={t('difficultyHint')}>
                <Select
                  value={String(form.difficulty)}
                  onChange={(event) => set('difficulty', Number(event.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Panel>

          <Panel title={t('sectionImage')}>
            <div className="px-5 py-5">
              <ImageField
                value={form.imageUrl}
                prefix="metas"
                storageReady={storageReady}
                onChange={({ url, key }) => {
                  set('imageUrl', url);
                  set('imageKey', key);
                }}
              />
            </div>
          </Panel>

          <Panel title={t('sectionEnglish')}>
            <div className="space-y-4 px-5 py-5">
              <Field label={t('title')}>
                <Input
                  value={form.titleEn}
                  onChange={(event) => set('titleEn', event.target.value)}
                />
              </Field>
              <Field label={t('description')} hint={t('descriptionHint')}>
                <Textarea
                  value={form.descriptionEn}
                  onChange={(event) => set('descriptionEn', event.target.value)}
                />
              </Field>
            </div>
          </Panel>

          <Panel title={t('sectionTurkish')}>
            <div className="space-y-4 px-5 py-5">
              <Field label={t('title')}>
                <Input
                  value={form.titleTr}
                  onChange={(event) => set('titleTr', event.target.value)}
                />
              </Field>
              <Field label={t('description')} hint={t('descriptionHint')}>
                <Textarea
                  value={form.descriptionTr}
                  onChange={(event) => set('descriptionTr', event.target.value)}
                />
              </Field>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title={t('sectionPublishing')}>
            <div className="space-y-4 px-5 py-5">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) => set('isPublished', event.target.checked)}
                  className="size-4 accent-[var(--color-paint)]"
                />
                {t('publishedLabel')}
              </label>
              <p className="text-xs text-muted">{t('publishedHint')}</p>
            </div>
          </Panel>

          {detail && (
            <Panel title={t('sectionPerformance')}>
              <dl className="space-y-3 px-5 py-5 text-sm">
                <Row label={t('answers')} value={String(detail.stats.totalAnswers)} />
                <Row
                  label={t('winRate')}
                  value={detail.stats.winRate === null ? '—' : `${detail.stats.winRate}%`}
                />
                {detail.createdBy && <Row label={t('author')} value={detail.createdBy.name} />}
              </dl>

              {detail.stats.topWrongGuesses.length > 0 && (
                <div className="border-t border-line px-5 py-4">
                  <p className="eyebrow">{t('confusedWith')}</p>
                  <ul className="mt-3 space-y-2">
                    {detail.stats.topWrongGuesses.map((guess) => (
                      <li
                        key={guess.countryCode}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-mono text-xs text-stop">{guess.countryCode}</span>
                        <Badge>{guess.count}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="font-mono tabular-nums">{value}</dd>
    </div>
  );
}

'use client';

import { Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useRouter } from '@/i18n/navigation';
import {
  type ContentStatus,
  type GuideEntryInput,
  createAdminGuideEntry,
  deleteAdminGuideEntry,
  fetchAdminGuideEntry,
  updateAdminGuideEntry,
} from '@/lib/admin-api';
import { type Country, fetchCountries } from '@/lib/api';
import { toSlug } from '@/lib/slug';
import { useStorageReady } from '@/lib/use-storage-ready';

import { ImageField } from './image-field';
import { SeoFields } from './seo-fields';
import { RichTextEditor } from './rich-text-editor';
import { Button, Field, Input, Panel, Select, Textarea } from './ui';

const BLANK: GuideEntryInput = {
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  coverImageKey: '',
  countryCode: '',
  position: 0,
  status: 'DRAFT',
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  canonicalUrl: '',
  robotsMeta: 'index,follow',
};

/** One article under a heading: a picture, a body, and where it applies. */
export function GuideEntryEditor({ topicId, entryId }: { topicId: string; entryId?: string }) {
  const t = useTranslations('admin.guideEntryEditor');
  const router = useRouter();
  const uiLocale = useLocale();
  const storageReady = useStorageReady();

  const [form, setForm] = useState<GuideEntryInput>(BLANK);
  const [countries, setCountries] = useState<Country[]>([]);
  const [slugTouched, setSlugTouched] = useState(Boolean(entryId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(entryId));

  // An empty list only costs the country box, so a failure here is not worth
  // stopping the author from writing.
  useEffect(() => {
    fetchCountries()
      .then(setCountries)
      .catch(() => setCountries([]));
  }, []);

  useEffect(() => {
    if (!entryId) return;

    fetchAdminGuideEntry(entryId)
      .then((entry) => {
        setForm({
          slug: entry.slug,
          title: entry.title,
          excerpt: entry.excerpt,
          content: entry.content,
          coverImageUrl: entry.coverImageUrl ?? '',
          coverImageKey: entry.coverImageKey ?? '',
          countryCode: entry.countryCode ?? '',
          position: entry.position,
          status: entry.status,
          metaTitle: entry.metaTitle ?? '',
          metaDescription: entry.metaDescription ?? '',
          keywords: entry.keywords,
          canonicalUrl: entry.canonicalUrl ?? '',
          robotsMeta: entry.robotsMeta,
        });
      })
      .catch(() => setError(t('loadFailed')))
      .finally(() => setLoading(false));
  }, [entryId, t]);

  function set<K extends keyof GuideEntryInput>(key: K, value: GuideEntryInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function setTitle(title: string) {
    setForm((current) => ({
      ...current,
      title,
      slug: slugTouched ? current.slug : toSlug(title, 'entry'),
    }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      if (entryId) {
        await updateAdminGuideEntry(entryId, form);
      } else {
        const created = await createAdminGuideEntry(topicId, form);
        router.replace(`/admin/guides/${topicId}/entries/${created.id}`);
      }
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!entryId || !window.confirm(t('confirmDelete'))) return;

    try {
      await deleteAdminGuideEntry(entryId);
      router.push(`/admin/guides/${topicId}`);
    } catch {
      setError(t('saveFailed'));
    }
  }

  if (loading) return <div className="card-raised h-96 animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-900 tracking-tight">
          {entryId ? t('editTitle') : t('createTitle')}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            type="button"
            onClick={() => router.push(`/admin/guides/${topicId}`)}
          >
            {t('backToTopic')}
          </Button>
          {entryId && (
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

      {error && <p className="card-raised px-5 py-3 text-sm text-stop-deep">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <Panel title={t('sectionContent')}>
            <div className="space-y-4 px-5 py-5">
              <Field label={t('entryTitle')} hint={t('entryTitleHint')}>
                <Input value={form.title} onChange={(event) => setTitle(event.target.value)} />
              </Field>
              <Field label={t('excerpt')} hint={t('excerptHint')}>
                <Textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={(event) => set('excerpt', event.target.value)}
                />
              </Field>
            </div>
          </Panel>

          <RichTextEditor
            value={form.content}
            storageReady={storageReady}
            onChange={(html) => set('content', html)}
          />
          <SeoFields values={form} titlePlaceholder={form.title} t={t} onChange={set} />
        </div>

        <div className="space-y-6">
          <Panel title={t('sectionPublishing')}>
            <div className="space-y-4 px-5 py-5">
              <Field label={t('slug')} hint={t('slugHint')}>
                <Input
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    set('slug', event.target.value);
                  }}
                />
              </Field>
              <Field label={t('position')} hint={t('positionHint')}>
                <Input
                  type="number"
                  min={0}
                  max={999}
                  value={form.position}
                  onChange={(event) => set('position', Number(event.target.value))}
                />
              </Field>
              <Field label={t('country')} hint={t('countryHint')}>
                <Select
                  value={form.countryCode}
                  onChange={(event) => set('countryCode', event.target.value)}
                >
                  <option value="">{t('noCountry')}</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {uiLocale === 'tr' ? country.nameTr : country.nameEn}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t('status')} hint={t('statusHint')}>
                <Select
                  value={form.status}
                  onChange={(event) => set('status', event.target.value as ContentStatus)}
                >
                  <option value="DRAFT">{t('draft')}</option>
                  <option value="PUBLISHED">{t('published')}</option>
                </Select>
              </Field>
            </div>
          </Panel>

          <Panel title={t('sectionCover')}>
            <div className="px-5 py-5">
              <ImageField
                value={form.coverImageUrl}
                prefix="decks"
                storageReady={storageReady}
                onChange={({ url, key }) => {
                  set('coverImageUrl', url);
                  set('coverImageKey', key ?? '');
                }}
              />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

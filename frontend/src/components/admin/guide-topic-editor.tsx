'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Link, useRouter } from '@/i18n/navigation';
import {
  type AdminGuideEntry,
  type ContentStatus,
  type GuideTopicInput,
  META_CATEGORIES,
  type MetaCategory,
  createAdminGuide,
  deleteAdminGuide,
  fetchAdminGuide,
  updateAdminGuide,
} from '@/lib/admin-api';
import { GUIDE_ICON_NAMES } from '@/lib/guide-icons';
import { toSlug } from '@/lib/slug';
import { useStorageReady } from '@/lib/use-storage-ready';

import { ImageField } from './image-field';
import { SeoFields } from './seo-fields';
import {
  Badge,
  Button,
  EmptyRow,
  Field,
  Input,
  Panel,
  Select,
  TableShell,
  Td,
  Th,
  Textarea,
} from './ui';

const BLANK: GuideTopicInput = {
  locale: 'tr',
  slug: '',
  title: '',
  summary: '',
  icon: 'signpost',
  coverImageUrl: '',
  coverImageKey: '',
  category: '',
  position: 0,
  status: 'DRAFT',
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  canonicalUrl: '',
  robotsMeta: 'index,follow',
};

/**
 * A heading and what sits under it.
 *
 * The entries are listed on the same screen rather than behind another tab:
 * writing a heading and filling it are one job, and splitting them would mean
 * saving, navigating and finding the heading again to add the first article.
 */
export function GuideTopicEditor({ topicId }: { topicId?: string }) {
  const t = useTranslations('admin.guideEditor');
  const categories = useTranslations('categories');
  const router = useRouter();
  const storageReady = useStorageReady();

  const [form, setForm] = useState<GuideTopicInput>(BLANK);
  const [entries, setEntries] = useState<AdminGuideEntry[]>([]);
  const [slugTouched, setSlugTouched] = useState(Boolean(topicId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(topicId));

  useEffect(() => {
    if (!topicId) return;

    fetchAdminGuide(topicId)
      .then((topic) => {
        setForm({
          locale: topic.locale,
          slug: topic.slug,
          title: topic.title,
          summary: topic.summary,
          icon: topic.icon || 'signpost',
          coverImageUrl: topic.coverImageUrl ?? '',
          coverImageKey: topic.coverImageKey ?? '',
          category: topic.category ?? '',
          position: topic.position,
          status: topic.status,
          metaTitle: topic.metaTitle ?? '',
          metaDescription: topic.metaDescription ?? '',
          keywords: topic.keywords,
          canonicalUrl: topic.canonicalUrl ?? '',
          robotsMeta: topic.robotsMeta,
        });
        setEntries(topic.entries);
      })
      .catch(() => setError(t('loadFailed')))
      .finally(() => setLoading(false));
  }, [topicId, t]);

  function set<K extends keyof GuideTopicInput>(key: K, value: GuideTopicInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  // Typing a heading fills the address until the author edits it themselves.
  function setTitle(title: string) {
    setForm((current) => ({
      ...current,
      title,
      slug: slugTouched ? current.slug : toSlug(title, 'topic'),
    }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const saved = topicId ? await updateAdminGuide(topicId, form) : await createAdminGuide(form);
      router.push(`/admin/guides/${saved.id}`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!topicId || !window.confirm(t('confirmDelete', { count: entries.length }))) return;

    try {
      await deleteAdminGuide(topicId);
      router.push('/admin/guides');
    } catch {
      setError(t('saveFailed'));
    }
  }

  if (loading) return <div className="card-raised h-96 animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-900 tracking-tight">
          {topicId ? t('editTitle') : t('createTitle')}
        </h1>
        <div className="flex gap-2">
          {topicId && (
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
          <Panel title={t('sectionHeading')}>
            <div className="space-y-4 px-5 py-5">
              <Field label={t('topicTitle')} hint={t('topicTitleHint')}>
                <Input value={form.title} onChange={(event) => setTitle(event.target.value)} />
              </Field>
              <Field label={t('summary')} hint={t('summaryHint')}>
                <Textarea
                  rows={3}
                  value={form.summary}
                  onChange={(event) => set('summary', event.target.value)}
                />
              </Field>
              <Field label={t('category')} hint={t('categoryHint')}>
                <Select
                  value={form.category}
                  onChange={(event) => set('category', event.target.value as MetaCategory | '')}
                >
                  <option value="">{t('noCategory')}</option>
                  {META_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {categories(category)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Panel>

          {/* An unsaved heading has no id, so there is nowhere to hang an
              entry yet. Saying so beats a link that cannot work. */}
          <Panel
            title={t('sectionEntries')}
            action={
              topicId && (
                <Link
                  href={`/admin/guides/${topicId}/entries/new`}
                  className="inline-flex items-center gap-2 btn btn-go px-4 py-2 text-sm"
                >
                  <Plus className="size-4" aria-hidden />
                  {t('addEntry')}
                </Link>
              )
            }
          >
            {topicId ? (
              <TableShell
                head={
                  <>
                    <Th>{t('entryTitle')}</Th>
                    <Th>{t('entryPosition')}</Th>
                    <Th>{t('entryReading')}</Th>
                    <Th>{t('entryState')}</Th>
                  </>
                }
              >
                {entries.length === 0 && <EmptyRow colSpan={4}>{t('noEntries')}</EmptyRow>}
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-t border-line">
                    <Td>
                      <Link
                        href={`/admin/guides/${topicId}/entries/${entry.id}`}
                        className="hover:text-go-deep"
                      >
                        <span className="block font-600">{entry.title}</span>
                        <span className="font-mono text-xs text-muted">{entry.slug}</span>
                      </Link>
                    </Td>
                    <Td className="font-mono tabular-nums text-muted">{entry.position}</Td>
                    <Td className="font-mono tabular-nums text-muted">{entry.readingTime}</Td>
                    <Td>
                      <Badge tone={entry.status === 'PUBLISHED' ? 'good' : 'warn'}>
                        {entry.status === 'PUBLISHED' ? t('published') : t('draft')}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </TableShell>
            ) : (
              <p className="px-5 py-10 text-center text-sm text-muted">{t('saveFirst')}</p>
            )}
          </Panel>
          <SeoFields values={form} titlePlaceholder={form.title} t={t} onChange={set} />
        </div>

        <div className="space-y-6">
          <Panel title={t('sectionPublishing')}>
            <div className="space-y-4 px-5 py-5">
              <Field label={t('locale')} hint={t('localeHint')}>
                <Select value={form.locale} onChange={(event) => set('locale', event.target.value)}>
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </Select>
              </Field>
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

          <Panel title={t('sectionIcon')}>
            <div className="px-5 py-5">
              <Field label={t('icon')} hint={t('iconHint')}>
                <Select value={form.icon} onChange={(event) => set('icon', event.target.value)}>
                  {GUIDE_ICON_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
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

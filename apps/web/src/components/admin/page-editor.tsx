'use client';

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useRouter } from '@/i18n/navigation';
import {
  type ContentStatus,
  type PageInput,
  createAdminPage,
  deleteAdminPage,
  fetchAdminPage,
  updateAdminPage,
} from '@/lib/admin-api';
import { useStorageReady } from '@/lib/use-storage-ready';

import { RichTextEditor } from './rich-text-editor';
import { Button, Field, Input, Panel, Select, Textarea } from './ui';

const BLANK: PageInput = {
  locale: 'tr',
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  metaTitle: '',
  metaDescription: '',
  canonicalUrl: '',
  robotsMeta: 'index,follow',
  status: 'PUBLISHED',
  includeInSitemap: true,
  footerOrder: 0,
};

export function PageEditor({ pageId }: { pageId?: string }) {
  const t = useTranslations('admin.pageEditor');
  const router = useRouter();
  const storageReady = useStorageReady();

  const [form, setForm] = useState<PageInput>(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(pageId));

  useEffect(() => {
    if (!pageId) return;

    fetchAdminPage(pageId)
      .then((page) => {
        setForm({
          locale: page.locale,
          slug: page.slug,
          title: page.title,
          excerpt: page.excerpt,
          content: page.content,
          metaTitle: page.metaTitle ?? '',
          metaDescription: page.metaDescription ?? '',
          canonicalUrl: page.canonicalUrl ?? '',
          robotsMeta: page.robotsMeta,
          status: page.status,
          includeInSitemap: page.includeInSitemap,
          footerOrder: page.footerOrder,
        });
      })
      .catch(() => setError(t('loadFailed')))
      .finally(() => setLoading(false));
  }, [pageId, t]);

  function set<K extends keyof PageInput>(key: K, value: PageInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const saved = pageId ? await updateAdminPage(pageId, form) : await createAdminPage(form);
      router.push(`/admin/pages/${saved.id}`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!pageId || !window.confirm(t('confirmDelete'))) return;

    try {
      await deleteAdminPage(pageId);
      router.push('/admin/pages');
    } catch {
      setError(t('saveFailed'));
    }
  }

  if (loading) return <div className="card-raised h-96 animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-800 tracking-tight">
          {pageId ? t('editTitle') : t('createTitle')}
        </h1>
        <div className="flex gap-2">
          {pageId && (
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

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <Panel title={t('sectionContent')}>
            <div className="space-y-4 px-5 py-5">
              <Field label={t('pageTitle')}>
                <Input value={form.title} onChange={(event) => set('title', event.target.value)} />
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

          <Panel title={t('sectionSeo')}>
            <div className="space-y-4 px-5 py-5">
              <Field label={t('metaTitle')}>
                <Input
                  value={form.metaTitle}
                  placeholder={form.title}
                  onChange={(event) => set('metaTitle', event.target.value)}
                />
              </Field>
              <Field label={t('metaDescription')}>
                <Textarea
                  rows={3}
                  value={form.metaDescription}
                  onChange={(event) => set('metaDescription', event.target.value)}
                />
              </Field>
              <Field label={t('canonical')}>
                <Input
                  value={form.canonicalUrl}
                  onChange={(event) => set('canonicalUrl', event.target.value)}
                />
              </Field>
              <Field label={t('robots')}>
                <Select
                  value={form.robotsMeta}
                  onChange={(event) => set('robotsMeta', event.target.value)}
                >
                  <option value="index,follow">{t('robotsIndex')}</option>
                  <option value="noindex,follow">{t('robotsNoindex')}</option>
                  <option value="noindex,nofollow">{t('robotsNone')}</option>
                </Select>
              </Field>
            </div>
          </Panel>
        </div>

        <Panel title={t('sectionPlacement')}>
          <div className="space-y-4 px-5 py-5">
            <Field label={t('locale')}>
              <Select value={form.locale} onChange={(event) => set('locale', event.target.value)}>
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </Select>
            </Field>
            <Field label={t('slug')} hint={t('slugHint')}>
              <Input value={form.slug} onChange={(event) => set('slug', event.target.value)} />
            </Field>
            <Field label={t('footerOrder')} hint={t('footerOrderHint')}>
              <Input
                type="number"
                min={0}
                value={String(form.footerOrder)}
                onChange={(event) => set('footerOrder', Number(event.target.value))}
              />
            </Field>
            <Field label={t('status')}>
              <Select
                value={form.status}
                onChange={(event) => set('status', event.target.value as ContentStatus)}
              >
                <option value="PUBLISHED">{t('published')}</option>
                <option value="DRAFT">{t('draft')}</option>
              </Select>
            </Field>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.includeInSitemap}
                onChange={(event) => set('includeInSitemap', event.target.checked)}
                className="mt-1 size-4 accent-[var(--color-go)]"
              />
              <span>
                <span className="block font-600">{t('includeInSitemap')}</span>
                <span className="block text-xs text-muted">{t('includeInSitemapHint')}</span>
              </span>
            </label>
          </div>
        </Panel>
      </div>
    </div>
  );
}

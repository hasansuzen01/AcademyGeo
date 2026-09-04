'use client';

import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { useRouter } from '@/i18n/navigation';
import {
  type AdminDeckDetail,
  type AdminMeta,
  type DeckInput,
  createAdminDeck,
  deleteAdminDeck,
  fetchAdminDeck,
  fetchAdminMetas,
  fetchStorageStatus,
  setDeckMetas,
  updateAdminDeck,
} from '@/lib/admin-api';

import { ImageField } from './image-field';
import { Button, Field, Input, Panel, Textarea } from './ui';

const BLANK: DeckInput = {
  slug: '',
  nameEn: '',
  nameTr: '',
  descriptionEn: '',
  descriptionTr: '',
  coverImageUrl: null,
  coverImageKey: null,
  isPublished: false,
  startsAt: null,
  endsAt: null,
};

export function DeckEditor({ deckId }: { deckId?: string }) {
  const t = useTranslations('admin.deckEditor');
  const locale = useLocale();
  const router = useRouter();

  const [form, setForm] = useState<DeckInput>(BLANK);
  const [selected, setSelected] = useState<AdminMeta[]>([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<AdminMeta[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(deckId));

  useEffect(() => {
    fetchStorageStatus()
      .then((status) => setStorageReady(status.configured))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!deckId) return;

    fetchAdminDeck(deckId)
      .then((deck) => {
        setForm(toForm(deck));
        setSelected(deck.metas.map((entry) => entry.meta));
      })
      .catch(() => setError(t('loadFailed')))
      .finally(() => setLoading(false));
  }, [deckId, t]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchAdminMetas({ search: search || undefined, take: 12 })
        .then((page) => setResults(page.items))
        .catch(() => undefined);
    }, 200);

    return () => window.clearTimeout(timer);
  }, [search]);

  function set<K extends keyof DeckInput>(key: K, value: DeckInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function add(meta: AdminMeta) {
    setSelected((current) =>
      current.some((item) => item.id === meta.id) ? current : [...current, meta],
    );
  }

  function move(index: number, delta: number) {
    setSelected((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setError(null);

    // Saving is two calls: the deck, then its cards. If the second one fails
    // the deck already exists, so move to it rather than leaving the editor in
    // create mode, where a retry would collide with its own slug.
    let savedId = deckId;

    try {
      const saved = deckId ? await updateAdminDeck(deckId, form) : await createAdminDeck(form);
      savedId = saved.id;

      await setDeckMetas(
        saved.id,
        selected.map((meta) => meta.id),
      );

      router.push(`/admin/decks/${saved.id}`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('saveFailed'));
      if (savedId && savedId !== deckId) router.replace(`/admin/decks/${savedId}`);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deckId || !window.confirm(t('confirmDelete'))) return;

    try {
      await deleteAdminDeck(deckId);
      router.push('/admin/decks');
    } catch {
      setError(t('saveFailed'));
    }
  }

  if (loading) return <div className="card-raised h-96 animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-800 tracking-tight">
          {deckId ? t('editTitle') : t('createTitle')}
        </h1>
        <div className="flex gap-2">
          {deckId && (
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

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <Panel title={t('sectionDetails')}>
            <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
              <Field label={t('slug')} hint={t('slugHint')}>
                <Input value={form.slug} onChange={(event) => set('slug', event.target.value)} />
              </Field>
              <Field label={t('nameEn')}>
                <Input
                  value={form.nameEn}
                  onChange={(event) => set('nameEn', event.target.value)}
                />
              </Field>
              <Field label={t('nameTr')}>
                <Input
                  value={form.nameTr}
                  onChange={(event) => set('nameTr', event.target.value)}
                />
              </Field>
              <Field label={t('startsAt')} hint={t('windowHint')}>
                <Input
                  type="date"
                  value={toDateInput(form.startsAt)}
                  onChange={(event) => set('startsAt', fromDateInput(event.target.value))}
                />
              </Field>
              <Field label={t('endsAt')}>
                <Input
                  type="date"
                  value={toDateInput(form.endsAt)}
                  onChange={(event) => set('endsAt', fromDateInput(event.target.value))}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label={t('descriptionEn')}>
                  <Textarea
                    value={form.descriptionEn ?? ''}
                    onChange={(event) => set('descriptionEn', event.target.value)}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label={t('descriptionTr')}>
                  <Textarea
                    value={form.descriptionTr ?? ''}
                    onChange={(event) => set('descriptionTr', event.target.value)}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(event) => set('isPublished', event.target.checked)}
                    className="size-4 accent-[var(--color-paint)]"
                  />
                  {t('publishedLabel')}
                </label>
              </div>
            </div>
          </Panel>

          <Panel title={t('sectionCover')}>
            <div className="px-5 py-5">
              <ImageField
                value={form.coverImageUrl ?? ''}
                prefix="decks"
                storageReady={storageReady}
                onChange={({ url, key }) => {
                  set('coverImageUrl', url || null);
                  set('coverImageKey', key);
                }}
              />
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title={t('sectionCards', { count: selected.length })}>
            <ul className="divide-y divide-line">
              {selected.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-muted">{t('noCards')}</li>
              )}
              {selected.map((meta, index) => (
                <li key={meta.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="w-6 font-mono text-xs text-muted">{index + 1}</span>
                  <span className="relative block h-8 w-12 shrink-0 overflow-hidden rounded border border-line bg-canvas">
                    <Image
                      src={meta.imageUrl}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-contain"
                      unoptimized
                    />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {locale === 'tr' ? meta.titleTr : meta.titleEn}
                  </span>
                  <div className="flex gap-1">
                    <IconButton label={t('moveUp')} onClick={() => move(index, -1)}>
                      <ArrowUp className="size-3.5" />
                    </IconButton>
                    <IconButton label={t('moveDown')} onClick={() => move(index, 1)}>
                      <ArrowDown className="size-3.5" />
                    </IconButton>
                    <IconButton
                      label={t('removeCard')}
                      onClick={() =>
                        setSelected((current) => current.filter((item) => item.id !== meta.id))
                      }
                    >
                      <X className="size-3.5" />
                    </IconButton>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title={t('sectionPicker')}>
            <div className="px-5 py-4">
              <Input
                value={search}
                placeholder={t('searchPlaceholder')}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <ul className="max-h-80 divide-y divide-line overflow-y-auto">
              {results.map((meta) => (
                <li key={meta.id} className="flex items-center gap-3 px-5 py-2.5">
                  <span className="min-w-0 flex-1 truncate text-sm">
                    <span className="font-mono text-xs text-muted">{meta.countryCode}</span>{' '}
                    {locale === 'tr' ? meta.titleTr : meta.titleEn}
                  </span>
                  <IconButton label={t('addCard')} onClick={() => add(meta)}>
                    <Plus className="size-3.5" />
                  </IconButton>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="rounded-md border border-line p-1.5 text-muted transition-colors hover:border-muted hover:text-ink"
    >
      {children}
    </button>
  );
}

function toForm(deck: AdminDeckDetail): DeckInput {
  return {
    slug: deck.slug,
    nameEn: deck.nameEn,
    nameTr: deck.nameTr,
    descriptionEn: deck.descriptionEn,
    descriptionTr: deck.descriptionTr,
    coverImageUrl: deck.coverImageUrl,
    coverImageKey: deck.coverImageKey,
    isPublished: deck.isPublished,
    startsAt: deck.startsAt,
    endsAt: deck.endsAt,
  };
}

function toDateInput(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : '';
}

function fromDateInput(value: string): string | null {
  return value ? new Date(`${value}T00:00:00.000Z`).toISOString() : null;
}

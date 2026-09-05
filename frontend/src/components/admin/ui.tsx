'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <div className="mt-2">{children}</div>
      {hint && !error && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1.5 block text-xs text-stop">{error}</span>}
    </label>
  );
}

const CONTROL =
  'w-full rounded-xl border-2 border-line bg-paper px-3.5 py-2.5 text-sm font-600 text-ink placeholder:text-muted/70 transition-colors focus:border-sky focus:outline-none disabled:bg-canvas disabled:text-muted';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(CONTROL, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(CONTROL, 'min-h-28 resize-y', props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(CONTROL, props.className)} />;
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
}) {
  return (
    <button
      {...props}
      className={cn(
        'btn px-4 py-2 text-sm',
        variant === 'primary' && 'btn-go',
        variant === 'ghost' && 'btn-quiet',
        variant === 'danger' && 'btn-quiet border-stop/50 text-stop-deep hover:bg-stop/10',
        className,
      )}
    />
  );
}

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'good' | 'warn';
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-900 uppercase',
        tone === 'neutral' && 'bg-canvas text-muted',
        tone === 'good' && 'bg-go/15 text-go-deep',
        tone === 'warn' && 'bg-paint/25 text-paint-deep',
      )}
    >
      {children}
    </span>
  );
}

export function Panel({
  title,
  action,
  children,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="card-raised overflow-hidden">
      {title && (
        <header className="flex items-center justify-between gap-4 border-b-2 border-line px-5 py-3.5">
          <h2 className="font-display text-base font-900 tracking-tight">{title}</h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/** Tables scroll inside their card so a wide row never widens the page. */
export function TableShell({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[46rem] border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-line text-left">{head}</tr>
        </thead>
        <tbody className="divide-y-2 divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'px-5 py-3 text-[11px] font-900 tracking-[0.12em] text-muted uppercase',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn('px-5 py-3 align-middle font-600', className)}>{children}</td>;
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-10 text-center text-sm text-muted">
        {children}
      </td>
    </tr>
  );
}

export function Pagination({
  total,
  skip,
  take,
  onChange,
}: {
  total: number;
  skip: number;
  take: number;
  onChange: (skip: number) => void;
}) {
  const t = useTranslations('admin.pagination');

  if (total <= take) return null;

  return (
    <div className="flex items-center justify-between gap-4 border-t-2 border-line px-5 py-3">
      <span className="text-xs font-700 text-muted">
        {t('range', { from: total === 0 ? 0 : skip + 1, to: Math.min(skip + take, total), total })}
      </span>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          disabled={skip === 0}
          onClick={() => onChange(Math.max(0, skip - take))}
        >
          {t('previous')}
        </Button>
        <Button
          variant="ghost"
          disabled={skip + take >= total}
          onClick={() => onChange(skip + take)}
        >
          {t('next')}
        </Button>
      </div>
    </div>
  );
}

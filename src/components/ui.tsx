// @ts-nocheck
import React from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

// 8. BUTTON & BUTTON CLASS
interface ButtonClassProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  className?: string
}

export function buttonClass({
  variant = 'primary',
  size = 'md',
  className = '',
}: ButtonClassProps = {}): string {
  const base =
    'focus-ring inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100'

  const variants = {
    primary:
      'bg-gradient-to-br from-[#1c1c1e] to-[#000000] text-white shadow-fab border border-white/40 hover:brightness-125 active:brightness-90',
    secondary: 'glass text-ink hover:brightness-95',
    ghost: 'text-accent-press hover:bg-accent-subtle',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
  }

  return `${base} ${variants[variant]} ${sizes[size]} ${className}`
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonClassProps) {
  return (
    <button className={buttonClass({ variant, size, className })} {...props}>
      {children}
    </button>
  )
}

// 8. CARD
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  nested?: boolean
  className?: string
  children: React.ReactNode
}

export function Card({ nested = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`glass p-4 ${nested ? 'rounded-concentric' : 'rounded-xl'} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// 8. SECTION
interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function Section({
  title,
  description,
  action,
  className = '',
  children,
  ...props
}: SectionProps) {
  return (
    <section className={`rounded-xl bg-section p-1.5 ${className}`} {...props}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-2 px-1.5 pb-1.5 pt-0.5">
          <div className="min-w-0">
            {title && <h2 className="text-base font-medium text-muted-strong">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

// 8. INPUT & SELECT
export const inputClass =
  'focus-ring w-full min-w-0 rounded-lg border border-border-strong bg-card px-3 py-2 text-base text-ink placeholder:text-muted focus:border-accent disabled:bg-zinc-100 disabled:text-muted'

export function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputClass} ${className}`} {...props} />
}

export function Select({
  className = '',
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${inputClass} ${className}`} {...props}>
      {children}
    </select>
  )
}

// 8. FIELD
interface FieldProps {
  label: string
  htmlFor?: string
  error?: string
  helper?: string
  children: React.ReactNode
  className?: string
}

export function Field({
  label,
  htmlFor,
  error,
  helper,
  children,
  className = '',
}: FieldProps) {
  return (
    <div className={`grid min-w-0 gap-2 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : helper ? (
        <p className="text-sm text-muted">{helper}</p>
      ) : null}
    </div>
  )
}

// 7. BADGE / PILL
interface BadgeProps {
  variant?: 'neutral' | 'accent' | 'positive' | 'warning'
  className?: string
  children: React.ReactNode
}

export function Badge({ variant = 'neutral', className = '', children }: BadgeProps) {
  const variants = {
    neutral: 'bg-zinc-100 text-zinc-600 ring-zinc-900/5',
    accent: 'bg-accent-subtle text-accent-press ring-accent/15',
    positive: 'bg-positive-subtle text-positive ring-positive/15',
    warning: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

// 10. EMPTY STATE
interface EmptyStateProps {
  icon: LucideIcon
  message: string
  actionHref?: string
  actionLabel?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  message,
  actionHref,
  actionLabel,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong bg-card p-10 text-center shadow-card ${className}`}
    >
      <span className="chip-3d chip-3d-accent grid size-11 place-items-center rounded-full">
        <Icon size={22} />
      </span>
      <p className="text-sm text-muted">{message}</p>
      {action
        ? action
        : actionHref && actionLabel && (
            <Link href={actionHref} className={buttonClass({ size: 'sm' })}>
              {actionLabel}
            </Link>
          )}
    </div>
  )
}

// 11. CONFIRM DIALOG
interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4 backdrop-blur-sm">
      <div className="glass w-full max-w-sm animate-pop-in rounded-xl p-5">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        <div className="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-border-strong bg-zinc-100 px-4 py-2 text-sm font-medium text-muted-strong transition hover:bg-zinc-200 active:scale-[0.98]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

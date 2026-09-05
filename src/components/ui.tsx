// @ts-nocheck
import React from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

// BUTTON & BUTTON CLASS (Toko Kita 3D Puffy Buttons)
export interface ButtonClassProps {
  variant?: 'primary' | 'navy' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function buttonClass({
  variant = 'primary',
  size = 'md',
  className = '',
}: ButtonClassProps = {}): string {
  const base =
    'inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-sora font-bold transition-all active:scale-[0.96] active:translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none'

  const variants = {
    primary:
      'bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-white rounded-[var(--radius-md)] shadow-[0_8px_20px_-2px_rgba(255,107,53,.42),inset_0_1px_0_rgba(255,255,255,.4)] active:shadow-[0_3px_8px_-1px_rgba(232,85,33,.35),inset_0_2px_4px_rgba(0,0,0,.2)]',
    navy:
      'bg-gradient-to-br from-[#2B1810] to-[#3D221A] text-white rounded-[var(--radius-md)] shadow-[0_8px_20px_-2px_rgba(43,24,16,.3),inset_0_1px_0_rgba(255,255,255,.2)] active:shadow-[0_3px_8px_-1px_rgba(43,24,16,.4),inset_0_2px_4px_rgba(0,0,0,.3)]',
    secondary:
      'bg-transparent border border-[var(--line)] text-[var(--ink-soft)] font-inter font-semibold rounded-[var(--radius-md)] hover:bg-[var(--paper)] active:bg-[var(--paper)]',
    ghost:
      'text-[var(--accent-2)] font-inter font-semibold hover:bg-[var(--accent-bg)] rounded-[var(--radius-md)]',
    danger:
      'bg-[var(--danger)] text-white rounded-[var(--radius-md)] shadow-[0_8px_20px_-2px_rgba(231,76,60,.35)] active:shadow-[0_3px_8px_-1px_rgba(231,76,60,.4)]',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-[var(--radius-sm)]',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3.5 text-base',
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

// 3D PUFFY CARD (Radius 20px, Shadow-3D)
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  nested?: boolean
  className?: string
  children: React.ReactNode
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] shadow-3d p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// SECTION CONTAINER
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
    <section className={`mb-4 ${className}`} {...props}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-2 px-1 pb-2">
          <div className="min-w-0">
            {title && <h2 className="text-base font-sora font-bold text-[var(--ink)]">{title}</h2>}
            {description && <p className="text-xs text-[var(--ink-soft)] mt-0.5">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

// INPUT & SELECT (Radius 14px, Line Border, Warm Inset Shadow)
export const inputClass =
  'w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] shadow-[0_4px_10px_-2px_rgba(43,24,16,.04),inset_0_1px_0_#ffffff] outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 disabled:bg-zinc-100 disabled:opacity-60'

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

// FORM FIELD (Label font 12px font-semibold text-ink-soft)
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
    <div className={`grid min-w-0 gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-xs font-semibold text-[var(--ink-soft)]">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-[var(--danger)] font-medium">{error}</p>
      ) : helper ? (
        <p className="text-xs text-[var(--ink-soft)]">{helper}</p>
      ) : null}
    </div>
  )
}

// BADGE & STATUS PILL (Accent-bg background + Accent-2 text, 999px pill)
interface BadgeProps {
  variant?: 'accent' | 'navy' | 'neutral' | 'positive' | 'danger'
  className?: string
  children: React.ReactNode
}

export function Badge({ variant = 'accent', className = '', children }: BadgeProps) {
  const variants = {
    accent: 'bg-[var(--accent-bg)] text-[var(--accent-2)]',
    navy: 'bg-[#2B1810]/10 text-[#2B1810]',
    neutral: 'bg-[var(--paper)] text-[var(--ink-soft)] border border-[var(--line)]',
    positive: 'bg-emerald-50 text-emerald-700',
    danger: 'bg-red-50 text-[var(--danger)]',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[var(--text-caption)] font-bold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

// EMPTY STATE (Toko Kita Warm Card + Dashed Border)
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
      className={`flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--line)] bg-card p-8 text-center shadow-3d ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-white flex items-center justify-center shadow-[0_6px_16px_-2px_rgba(255,107,53,.4),inset_0_1px_0_rgba(255,255,255,.3)]">
        <Icon size={24} />
      </div>
      <p className="text-xs font-medium text-[var(--ink-soft)] max-w-xs">{message}</p>
      {action
        ? action
        : actionHref && actionLabel && (
            <Link href={actionHref} className={buttonClass({ size: 'sm', variant: 'primary' })}>
              {actionLabel}
            </Link>
          )}
    </div>
  )
}

// CONFIRM MODAL (Toko Kita Backdrop Blur + 24px Radius)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#23150F]/75 px-4 backdrop-blur-sm">
      <div className="bg-card w-full max-w-[420px] animate-page-in rounded-[var(--radius-xl)] p-5 shadow-[0_20px_40px_-10px_rgba(0,0,0,.35),inset_0_1px_0_#ffffff] border border-[rgba(232,214,205,0.9)]">
        <h3 className="text-base font-sora font-bold text-[var(--ink)]">{title}</h3>
        {description && <p className="mt-1.5 text-xs text-[var(--ink-soft)]">{description}</p>}
        <div className="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-[var(--radius-md)] border border-[var(--line)] bg-transparent px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] hover:bg-[var(--paper)]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-[var(--radius-md)] bg-[var(--danger)] px-4 py-2 text-xs font-sora font-bold text-white shadow-[0_4px_12px_rgba(231,76,60,.35)] disabled:opacity-50"
          >
            {isLoading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

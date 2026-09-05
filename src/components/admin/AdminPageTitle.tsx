import React from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export interface AdminPageTitleProps {
  title: string
  subtitle?: string
  backHref?: string
  rightSlot?: React.ReactNode
  className?: string
}

export default function AdminPageTitle({
  title,
  subtitle,
  backHref,
  rightSlot,
  className = '',
}: AdminPageTitleProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 ${className}`}>
      <div className="flex items-center gap-2.5">
        {backHref && (
          <Link
            href={backHref}
            prefetch={true}
            className="press p-1.5 -ml-1 rounded-xl bg-white border border-[rgba(232,214,205,0.9)] text-[var(--ink)] hover:bg-[var(--line)]/40 shadow-xs transition-colors shrink-0"
            aria-label="Kembali"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
        )}
        <div>
          <h1 className="text-xl font-sora font-bold text-[var(--ink)] leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[var(--ink-soft)] mt-0.5 font-medium leading-normal">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {rightSlot && (
        <div className="shrink-0 flex items-center gap-2">
          {rightSlot}
        </div>
      )}
    </div>
  )
}

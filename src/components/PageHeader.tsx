'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  backHref?: string
  sticky?: boolean
  rightSlot?: React.ReactNode
  className?: string
  children?: React.ReactNode
  printHidden?: boolean
}

export default function PageHeader({
  title,
  subtitle,
  showBack = false,
  backHref,
  sticky = true,
  rightSlot,
  className = '',
  children,
  printHidden = false,
}: PageHeaderProps) {
  const router = useRouter()

  return (
    <header
      className={`top-header ${sticky ? 'sticky top-0 z-40' : ''} px-4 py-3.5 border-b border-[rgba(232,214,205,0.8)] bg-[rgba(250,240,235,0.92)] backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(43,24,16,0.06)] ${
        printHidden ? 'print:hidden' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBack &&
            (backHref ? (
              <Link
                href={backHref}
                prefetch={true}
                className="press p-1.5 -ml-1.5 rounded-full hover:bg-[var(--line)]/50 text-[var(--ink)] shrink-0 transition-colors"
                aria-label="Kembali"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => router.back()}
                className="press p-1.5 -ml-1.5 rounded-full hover:bg-[var(--line)]/50 text-[var(--ink)] shrink-0 transition-colors"
                aria-label="Kembali"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ))}

          <div className="min-w-0 flex-1">
            <h1 className="font-sora font-bold text-base text-[var(--ink)] leading-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-[var(--ink-soft)] font-medium leading-tight mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {rightSlot && <div className="shrink-0 flex items-center">{rightSlot}</div>}
      </div>

      {children && <div className="mt-2.5">{children}</div>}
    </header>
  )
}

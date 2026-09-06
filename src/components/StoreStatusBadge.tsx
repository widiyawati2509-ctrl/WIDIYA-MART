// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { isStoreOpen } from '@/lib/utils'

interface StoreStatusBadgeProps {
  jamBuka?: string | null
  jamTutup?: string | null
  jamOperasional?: string | null
  variant?: 'compact' | 'full' | 'pill'
  className?: string
}

export default function StoreStatusBadge({
  jamBuka,
  jamTutup,
  jamOperasional,
  variant = 'compact',
  className = '',
}: StoreStatusBadgeProps) {
  // Initial state calculated immediately
  const [status, setStatus] = useState(() => isStoreOpen(jamBuka, jamTutup, jamOperasional))

  // Re-calculate every 10 seconds so the status always matches the real-world current time
  useEffect(() => {
    setStatus(isStoreOpen(jamBuka, jamTutup, jamOperasional))
    const interval = setInterval(() => {
      setStatus(isStoreOpen(jamBuka, jamTutup, jamOperasional))
    }, 10000)
    return () => clearInterval(interval)
  }, [jamBuka, jamTutup, jamOperasional])

  if (variant === 'pill') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sora font-extrabold border shadow-2xs ${
          status.isOpen
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : 'bg-rose-50 text-rose-800 border-rose-300'
        } ${className}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            status.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
          }`}
        />
        <span>{status.statusText}</span>
      </span>
    )
  }

  if (variant === 'full') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-sora font-bold border shadow-xs ${
          status.isOpen
            ? 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-2 ring-emerald-400/20'
            : 'bg-rose-50 text-rose-900 border-rose-300 ring-2 ring-rose-400/20'
        } ${className}`}
      >
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            status.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
          }`}
        />
        <span className="font-extrabold">{status.statusText}</span>
        <span className="text-[11px] font-medium opacity-85">({status.timeRange})</span>
        <span className="text-[10px] opacity-70 bg-black/5 px-1.5 py-0.5 rounded-md">
          {status.currentWitaTime} WITA
        </span>
      </div>
    )
  }

  // Default: compact
  return (
    <div className={`flex items-center gap-2 text-xs truncate ${className}`}>
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          status.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
        }`}
      />
      <div className="flex items-center gap-1.5 truncate">
        <span
          className={`font-sora font-extrabold ${
            status.isOpen ? 'text-emerald-700' : 'text-rose-700'
          }`}
        >
          {status.statusText}
        </span>
        <span className="text-[var(--ink-soft)] font-medium">·</span>
        <span className="text-[var(--ink-soft)] font-medium truncate">
          {status.timeRange}
        </span>
      </div>
    </div>
  )
}

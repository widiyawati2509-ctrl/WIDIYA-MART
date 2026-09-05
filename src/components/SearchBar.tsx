// @ts-nocheck
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useCallback } from 'react'

interface SearchBarProps {
  defaultValue?: string
}

export default function SearchBar({ defaultValue }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const form = e.currentTarget
      const q = (form.elements.namedItem('q') as HTMLInputElement).value.trim()
      const params = new URLSearchParams(searchParams)

      if (q) {
        params.set('q', q)
      } else {
        params.delete('q')
      }

      router.push(`/kategori?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-soft)]" />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Cari produk kebutuhan..."
        className="w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--line)] bg-white pl-10 pr-4 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] shadow-[0_4px_10px_-2px_rgba(43,24,16,.04),inset_0_1px_0_#ffffff] outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
      />
    </form>
  )
}

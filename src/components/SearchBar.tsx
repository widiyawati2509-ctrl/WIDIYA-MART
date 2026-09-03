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
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Cari produk..."
        className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
      />
    </form>
  )
}

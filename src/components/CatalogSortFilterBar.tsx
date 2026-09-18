// @ts-nocheck
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowUpDown, Tag, CheckCircle2, Flame } from 'lucide-react'

interface CatalogSortFilterBarProps {
  activeSort?: string
  activeFilter?: string
}

export default function CatalogSortFilterBar({
  activeSort = 'nama',
  activeFilter = '',
}: CatalogSortFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams)
    if (newSort && newSort !== 'nama') {
      params.set('urutan', newSort)
    } else {
      params.delete('urutan')
    }
    router.push(`/kategori?${params.toString()}`)
  }

  const handleFilterToggle = (filterType: string) => {
    const params = new URLSearchParams(searchParams)
    const current = params.get('filter') || ''

    if (current === filterType) {
      params.delete('filter')
    } else {
      params.set('filter', filterType)
    }
    router.push(`/kategori?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide py-1">
      {/* Quick Filter Chips */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => handleFilterToggle('promo')}
          className={`press inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-sora font-semibold transition-all ${
            activeFilter === 'promo'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'bg-white border border-[rgba(232,214,205,0.9)] text-[var(--ink-soft)] hover:text-rose-600 hover:border-rose-200'
          }`}
        >
          <Flame size={13} className={activeFilter === 'promo' ? 'text-white' : 'text-rose-500'} />
          <span>Promo</span>
        </button>

        <button
          type="button"
          onClick={() => handleFilterToggle('ready')}
          className={`press inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-sora font-semibold transition-all ${
            activeFilter === 'ready'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-[rgba(232,214,205,0.9)] text-[var(--ink-soft)] hover:text-emerald-700 hover:border-emerald-200'
          }`}
        >
          <CheckCircle2 size={13} className={activeFilter === 'ready' ? 'text-white' : 'text-emerald-600'} />
          <span>Stok Tersedia</span>
        </button>
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="relative inline-flex items-center">
          <ArrowUpDown size={13} className="absolute left-2.5 text-[var(--ink-soft)] pointer-events-none" />
          <select
            value={activeSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="pl-7 pr-3 py-1.5 text-xs font-sora font-semibold bg-white border border-[rgba(232,214,205,0.9)] text-[var(--ink)] rounded-full outline-hidden shadow-xs cursor-pointer hover:border-[var(--accent)] transition-all"
            aria-label="Urutan Produk"
          >
            <option value="nama">Urutan: Nama A-Z</option>
            <option value="termurah">Harga: Termurah</option>
            <option value="termahal">Harga: Termahal</option>
            <option value="terbaru">Terbaru</option>
          </select>
        </div>
      </div>
    </div>
  )
}

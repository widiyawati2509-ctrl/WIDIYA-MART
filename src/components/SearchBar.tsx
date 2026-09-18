// @ts-nocheck
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Search, X, Loader2, Package, ArrowRight } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { fetchCatalogProductsWithSWR } from '@/lib/catalogCache'

interface SearchBarProps {
  defaultValue?: string
  placeholder?: string
}

export default function SearchBar({
  defaultValue = '',
  placeholder = 'Cari produk kebutuhan...',
}: SearchBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(defaultValue)
  const [liveResults, setLiveResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [totalMatches, setTotalMatches] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const isCatalogPage = pathname === '/kategori'

  // Sync internal state when defaultValue or searchParams changes externally
  useEffect(() => {
    if (defaultValue !== undefined) {
      setQuery(defaultValue)
    }
  }, [defaultValue])

  // Click outside listener to close floating dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced live search
  useEffect(() => {
    const trimmed = query.trim()

    if (!trimmed) {
      setLiveResults([])
      setTotalMatches(0)
      setIsLoading(false)
      if (isCatalogPage && searchParams.get('q')) {
        const params = new URLSearchParams(searchParams)
        params.delete('q')
        router.replace(`/kategori?${params.toString()}`)
      }
      return
    }

    setIsLoading(true)

    const timer = setTimeout(async () => {
      // If on catalog page, update URL with debounce so the catalog list updates live
      if (isCatalogPage) {
        const params = new URLSearchParams(searchParams)
        params.set('q', trimmed)
        router.replace(`/kategori?${params.toString()}`)
      }

      // Fetch preview results for floating dropdown with SWR cache
      try {
        const data = await fetchCatalogProductsWithSWR({ q: trimmed, limit: 5 })
        setLiveResults(data.products || [])
        setTotalMatches(data.totalCount || 0)
        if (!isCatalogPage && (data.products?.length > 0 || trimmed.length >= 2)) {
          setIsOpen(true)
        }
      } catch (err) {
        console.warn('Live search error:', err)
      } finally {
        setIsLoading(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [query, isCatalogPage, router, searchParams])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsOpen(false)
    const trimmed = query.trim()
    const params = new URLSearchParams(isCatalogPage ? searchParams : undefined)

    if (trimmed) {
      params.set('q', trimmed)
    } else {
      params.delete('q')
    }

    router.push(`/kategori?${params.toString()}`)
  }

  const handleClear = () => {
    setQuery('')
    setLiveResults([])
    setIsOpen(false)
    if (isCatalogPage) {
      const params = new URLSearchParams(searchParams)
      params.delete('q')
      router.replace(`/kategori?${params.toString()}`)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-soft)] pointer-events-none" />

        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2 && !isCatalogPage && liveResults.length > 0) {
              setIsOpen(true)
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--line)] bg-white pl-10 pr-10 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] shadow-input outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-[var(--accent)] animate-spin" />
          )}

          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
              aria-label="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Floating Instant Search Dropdown (for non-catalog pages like Homepage) */}
      {isOpen && !isCatalogPage && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] shadow-2xl z-50 overflow-hidden animate-in fade-in duration-200">
          <div className="p-2 border-b border-[var(--line)] bg-[var(--paper)] flex items-center justify-between text-xs font-semibold text-[var(--ink-soft)]">
            <span>Hasil Pencarian Cepat ({totalMatches})</span>
            {totalMatches > 5 && (
              <Link
                href={`/kategori?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setIsOpen(false)}
                className="text-[var(--accent-2)] font-bold hover:underline flex items-center gap-1"
              >
                Lihat Semua ({totalMatches}) &rarr;
              </Link>
            )}
          </div>

          {liveResults.length > 0 ? (
            <div className="divide-y divide-[var(--line)] max-h-72 overflow-y-auto">
              {liveResults.map((item) => (
                <Link
                  key={item.id}
                  href={`/produk/${item.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-2.5 hover:bg-[var(--accent-bg)]/40 transition-colors press"
                >
                  <div className="w-11 h-11 relative rounded-lg bg-[var(--paper)] border border-[var(--line)] overflow-hidden shrink-0">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.nama}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--ink-soft)]">
                        <Package size={18} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--ink)] line-clamp-1">{item.nama}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-sora font-bold text-[var(--accent-2)]">
                        {formatRupiah(item.harga)}
                      </span>
                      <span className="text-[10px] text-[var(--ink-soft)]">
                        Stok: {item.stok}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              <div className="p-2 bg-[var(--paper)] text-center">
                <Link
                  href={`/kategori?q=${encodeURIComponent(query.trim())}`}
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-sora font-bold text-[var(--accent-2)] hover:underline"
                >
                  <span>Lihat semua {totalMatches} produk di katalog</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ) : !isLoading ? (
            <div className="p-4 text-center text-xs text-[var(--ink-soft)]">
              Tidak ada produk yang cocok dengan &quot;{query}&quot;
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

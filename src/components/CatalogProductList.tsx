// @ts-nocheck
'use client'

import { useState, useTransition, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import ProductCardSkeleton from '@/components/ProductCardSkeleton'
import { fetchMoreCatalogProducts } from '@/lib/actions/products'
import { ChevronDown, Loader2, Check } from 'lucide-react'

interface CatalogProductListProps {
  initialProducts: any[]
  totalCount: number
  kategori?: string
  q?: string
  pageSize?: number
}

export default function CatalogProductList({
  initialProducts,
  totalCount,
  kategori,
  q,
  pageSize = 12,
}: CatalogProductListProps) {
  const [products, setProducts] = useState<any[]>(initialProducts)
  const [hasMore, setHasMore] = useState(initialProducts.length < totalCount)
  const [isPending, startTransition] = useTransition()

  // Sync state when filter/search parameters change
  useEffect(() => {
    setProducts(initialProducts)
    setHasMore(initialProducts.length < totalCount)
  }, [initialProducts, totalCount, kategori, q])

  const handleLoadMore = () => {
    if (isPending || !hasMore) return

    startTransition(async () => {
      const res = await fetchMoreCatalogProducts({
        offset: products.length,
        limit: pageSize,
        kategori,
        q,
      })

      if (res.products && res.products.length > 0) {
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id))
          const newUnique = res.products.filter((p: any) => !existingIds.has(p.id))
          const updated = [...prev, ...newUnique]
          if (updated.length >= totalCount || !res.hasMore) {
            setHasMore(false)
          }
          return updated
        })
      } else {
        setHasMore(false)
      }
    })
  }

  const remaining = Math.max(0, totalCount - products.length)

  return (
    <div className="space-y-4">
      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}

        {/* Skeleton cards shown during loading */}
        {isPending && (
          <>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </>
        )}
      </div>

      {/* Pagination / Load More Bar */}
      <div className="pt-2 pb-4 text-center">
        {hasMore ? (
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isPending}
            className="press inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[16px] bg-white hover:bg-[var(--accent-bg)] text-[var(--ink)] border border-[rgba(232,214,205,0.9)] shadow-3d text-xs font-sora font-bold active:scale-95 transition-all w-full disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin text-[var(--accent)]" />
                <span>Memuat produk...</span>
              </>
            ) : (
              <>
                <ChevronDown size={16} className="text-[var(--accent)]" />
                <span>Muat Lebih Banyak {remaining > 0 ? `(${remaining} lagi)` : ''}</span>
              </>
            )}
          </button>
        ) : products.length > 6 ? (
          <div className="inline-flex items-center gap-1.5 text-[11px] text-[var(--ink-soft)] font-medium">
            <Check size={14} className="text-emerald-600" />
            <span>Semua {products.length} produk telah ditampilkan</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

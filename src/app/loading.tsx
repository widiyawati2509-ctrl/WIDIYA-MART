// @ts-nocheck
import ProductCardSkeleton from '@/components/ProductCardSkeleton'

export default function Loading() {
  return (
    <div className="max-w-lg mx-auto pb-24 animate-page-in">
      {/* Header Skeleton */}
      <div className="glass sticky top-0 z-40 px-4 py-3 flex items-center justify-between border-b border-border mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-zinc-200 rounded-xl animate-shimmer" />
          <div className="space-y-1.5">
            <div className="h-4 bg-zinc-200 rounded-md w-28 animate-pulse" />
            <div className="h-3 bg-zinc-200 rounded-md w-44 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="px-4 mb-4">
        <div className="h-11 glass rounded-xl border border-border animate-shimmer" />
      </div>

      {/* Promo Banner Skeleton */}
      <div className="px-4 mb-5">
        <div className="h-36 glass rounded-2xl animate-shimmer" />
      </div>

      {/* Categories Skeleton */}
      <div className="px-4 mb-6">
        <div className="h-4 bg-zinc-200 rounded-md w-24 mb-3 animate-pulse" />
        <div className="grid grid-cols-3 gap-2.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass rounded-2xl p-3 flex flex-col items-center gap-2 animate-pulse">
              <div className="w-12 h-12 bg-zinc-100 rounded-2xl animate-shimmer" />
              <div className="h-3 bg-zinc-200 rounded-md w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="px-4 mb-6">
        <div className="h-4 bg-zinc-200 rounded-md w-32 mb-3 animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

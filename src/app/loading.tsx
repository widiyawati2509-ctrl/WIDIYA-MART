// @ts-nocheck
import ProductCardSkeleton from '@/components/ProductCardSkeleton'

export default function Loading() {
  return (
    <div className="max-w-[480px] mx-auto pb-24 animate-page-in">
      {/* Header Skeleton */}
      <div className="top-header sticky top-0 z-40 px-4 py-3.5 flex items-center justify-between border-b border-[rgba(232,214,205,0.8)] bg-[rgba(250,240,235,0.92)] backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(43,24,16,0.06)] mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[var(--accent-bg)] rounded-[var(--radius-sm)] animate-shimmer" />
          <div className="space-y-1.5">
            <div className="h-4 bg-[var(--line)] rounded-[var(--radius-sm)] w-28 animate-pulse" />
            <div className="h-3 bg-[var(--line)]/60 rounded-[var(--radius-sm)] w-40 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="px-4 mb-4">
        <div className="h-11 bg-white rounded-[var(--radius-md)] border border-[var(--line)] animate-shimmer shadow-xs" />
      </div>

      {/* Promo Banner Skeleton */}
      <div className="px-4 mb-5">
        <div className="h-36 bg-[var(--accent-bg)] rounded-[var(--radius-lg)] animate-shimmer border border-[rgba(232,214,205,0.8)]" />
      </div>

      {/* Categories Skeleton */}
      <div className="px-4 mb-5">
        <div className="h-4 bg-[var(--line)] rounded-[var(--radius-sm)] w-24 mb-3 animate-pulse" />
        <div className="grid grid-cols-3 gap-2.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] p-3 flex flex-col items-center gap-2 animate-pulse shadow-3d">
              <div className="w-12 h-12 bg-[var(--accent-bg)] rounded-[var(--radius-md)] animate-shimmer" />
              <div className="h-3 bg-[var(--line)] rounded-[var(--radius-sm)] w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="px-4 mb-6">
        <div className="h-4 bg-[var(--line)] rounded-[var(--radius-sm)] w-32 mb-3 animate-pulse" />
        <div className="grid grid-cols-2 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

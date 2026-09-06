// @ts-nocheck
import ProductCardSkeleton from '@/components/ProductCardSkeleton'

export default function Loading() {
  return (
    <div className="max-w-[480px] mx-auto pb-24 animate-page-in">
      {/* Header Skeleton */}
      <div className="top-header sticky top-[var(--admin-bar-offset,0px)] z-40 px-4 py-3.5 flex items-center justify-between border-b border-[rgba(232,214,205,0.8)] bg-[rgba(250,240,235,0.92)] backdrop-blur-md shadow-header mb-3.5">
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
        <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1.5 -mx-4 px-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center shrink-0">
              <div className="w-13 h-13 rounded-[var(--radius-lg)] bg-[var(--accent-bg)] border border-[rgba(232,214,205,0.9)] animate-pulse mb-1.5" />
              <div className="h-2.5 bg-[var(--line)] rounded-[var(--radius-sm)] w-12 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Products Horizontal Row Skeletons */}
      {[1, 2].map((sectionIdx) => (
        <div key={sectionIdx} className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="space-y-1">
              <div className="h-4 bg-[var(--line)] rounded-[var(--radius-sm)] w-32 animate-pulse" />
              <div className="h-3 bg-[var(--line)]/60 rounded-[var(--radius-sm)] w-48 animate-pulse" />
            </div>
            <div className="h-3 bg-[var(--line)]/60 rounded-[var(--radius-sm)] w-16 animate-pulse" />
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2 -mx-4 px-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-40 shrink-0">
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

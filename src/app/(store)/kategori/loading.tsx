// @ts-nocheck
import ProductCardSkeleton from '@/components/ProductCardSkeleton'

export default function KategoriLoading() {
  return (
    <div className="w-full pb-28 animate-page-in">
      {/* Top Header Skeleton */}
      <div className="top-header sticky top-0 z-40 px-4 pt-3.5 pb-3 border-b border-[rgba(232,214,205,0.8)] shadow-[0_4px_20px_-2px_rgba(43,24,16,0.06)] bg-[rgba(250,240,235,0.92)] backdrop-blur-md mb-3.5">
        <div className="h-5 bg-[var(--line)] rounded-[8px] w-36 mb-2.5 animate-pulse" />
        <div className="h-11 bg-white rounded-[16px] border border-[var(--line)] animate-shimmer shadow-xs" />
      </div>

      {/* Category Filter Chips Skeleton */}
      <div className="px-4 mb-3.5 flex gap-2 overflow-x-auto py-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-8 w-20 rounded-full bg-white border border-[var(--line)] animate-pulse shrink-0"
          />
        ))}
      </div>

      {/* Grid of Product Skeletons */}
      <div className="px-4">
        <div className="h-4 bg-[var(--line)] rounded-[6px] w-28 mb-3 animate-pulse" />
        <div className="grid grid-cols-2 gap-3.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

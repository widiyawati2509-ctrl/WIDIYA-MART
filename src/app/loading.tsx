// @ts-nocheck
import ProductCardSkeleton from '@/components/ProductCardSkeleton'

export default function Loading() {
  return (
    <div className="w-full pb-32 animate-page-in">
      {/* 1. Header Skeleton: Logo, Nama Toko, Tagline & Baris Alamat Ringkas */}
      <div className="px-4 pt-3 pb-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-[34px] h-[34px] bg-[var(--accent-bg)] rounded-[var(--radius-sm)] animate-shimmer shrink-0" />
            <div className="space-y-1">
              <div className="h-4 bg-[var(--line)] rounded-[var(--radius-sm)] w-32 animate-pulse" />
              <div className="h-3 bg-[var(--line)]/60 rounded-[var(--radius-sm)] w-44 animate-pulse" />
            </div>
          </div>
          <div className="w-20 h-8 rounded-full bg-white border border-[rgba(232,214,205,0.9)] animate-pulse" />
        </div>

        {/* Baris Ringkas Alamat & Jam Buka */}
        <div className="flex items-center justify-between pt-2 border-t border-[rgba(232,214,205,0.7)]">
          <div className="flex items-center gap-1.5">
            <span className="text-xs select-none">📍</span>
            <div className="h-3 w-40 bg-[var(--line)]/70 rounded animate-pulse" />
          </div>
          <div className="h-3 w-24 bg-[var(--line)]/60 rounded animate-pulse" />
        </div>
      </div>

      {/* 2. Sticky Search Bar Skeleton */}
      <div className="sticky top-[var(--admin-bar-offset,0px)] z-40 px-4 py-2 bg-[rgba(250,240,235,0.96)] backdrop-blur-md border-b border-[rgba(232,214,205,0.8)] shadow-header mb-3">
        <div className="h-10 bg-white rounded-full border border-[var(--line)] animate-shimmer shadow-xs flex items-center px-3.5 gap-2">
          <div className="w-4 h-4 rounded-full bg-[var(--line)]/50" />
          <div className="h-3 bg-[var(--line)]/40 rounded w-40" />
        </div>
      </div>

      {/* 3. Promo Banner Skeleton */}
      <div className="px-4 mb-5">
        <div className="h-[154px] bg-[var(--accent-bg)] rounded-[var(--radius-lg)] animate-shimmer border border-[rgba(232,214,205,0.8)]" />
      </div>

      {/* 4. Categories Skeleton */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 bg-[var(--line)] rounded-[var(--radius-sm)] w-20 animate-pulse" />
          <div className="h-3 bg-[var(--line)]/60 rounded-[var(--radius-sm)] w-16 animate-pulse" />
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1.5 -mx-4 px-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center shrink-0">
              <div className="w-13 h-13 rounded-[var(--radius-lg)] bg-[var(--accent-bg)] border border-[rgba(232,214,205,0.9)] animate-pulse mb-1.5" />
              <div className="h-2.5 bg-[var(--line)] rounded-[var(--radius-sm)] w-12 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* 5. Products Horizontal Carousels Skeletons */}
      {[1, 2].map((sectionIdx) => (
        <div key={sectionIdx} className="px-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="space-y-1">
              <div className="h-4 bg-[var(--line)] rounded-[var(--radius-sm)] w-32 animate-pulse" />
              <div className="h-3 bg-[var(--line)]/60 rounded-[var(--radius-sm)] w-48 animate-pulse" />
            </div>
            <div className="h-3 bg-[var(--line)]/60 rounded-[var(--radius-sm)] w-16 animate-pulse" />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 -mx-4 px-4">
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

// @ts-nocheck
export default function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-[var(--line)] rounded-2xl p-2.5 shadow-xs animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="aspect-square bg-[var(--accent-bg)] rounded-xl relative overflow-hidden animate-shimmer mb-1.5" />
      {/* Info Skeleton */}
      <div className="space-y-1.5">
        <div className="h-3.5 bg-[var(--line)] rounded-lg w-4/5" />
        <div className="h-3 bg-[var(--line)]/60 rounded-lg w-3/5" />
        <div className="h-4 bg-[var(--accent)]/20 rounded-lg w-1/2 pt-1" />
      </div>
    </div>
  )
}

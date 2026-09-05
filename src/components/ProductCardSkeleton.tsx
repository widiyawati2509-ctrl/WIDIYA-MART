// @ts-nocheck
export default function ProductCardSkeleton() {
  return (
    <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] p-3 shadow-3d animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="aspect-square bg-[var(--accent-bg)] rounded-[var(--radius-md)] relative overflow-hidden animate-shimmer mb-2.5" />
      {/* Info Skeleton */}
      <div className="space-y-1.5">
        <div className="h-3.5 bg-[var(--line)] rounded-[var(--radius-sm)] w-4/5" />
        <div className="h-3 bg-[var(--line)]/60 rounded-[var(--radius-sm)] w-3/5" />
        <div className="h-4 bg-[var(--accent)]/20 rounded-[var(--radius-sm)] w-1/2 pt-1" />
      </div>
    </div>
  )
}

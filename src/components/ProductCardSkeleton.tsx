// @ts-nocheck
export default function ProductCardSkeleton() {
  return (
    <div className="glass rounded-xl overflow-hidden shadow-card animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-zinc-100 relative overflow-hidden animate-shimmer" />
      {/* Info Skeleton */}
      <div className="p-3 space-y-2">
        <div className="h-3 bg-zinc-200 rounded-md w-4/5" />
        <div className="h-3 bg-zinc-200 rounded-md w-3/5" />
        <div className="h-4 bg-accent/15 rounded-md w-1/2 pt-1" />
      </div>
    </div>
  )
}

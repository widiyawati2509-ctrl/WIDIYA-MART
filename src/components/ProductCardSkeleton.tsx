// @ts-nocheck
export default function ProductCardSkeleton() {
  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-xs animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200 relative overflow-hidden animate-shimmer" />
      {/* Info Skeleton */}
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-gray-200 rounded-md w-4/5" />
        <div className="h-3.5 bg-gray-200 rounded-md w-3/5" />
        <div className="h-4 bg-green-100 rounded-md w-1/2 pt-1" />
      </div>
    </div>
  )
}

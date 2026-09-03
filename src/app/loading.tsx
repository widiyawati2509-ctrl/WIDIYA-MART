// @ts-nocheck
import ProductCardSkeleton from '@/components/ProductCardSkeleton'

export default function Loading() {
  return (
    <div className="max-w-lg mx-auto pb-10">
      {/* Header Skeleton */}
      <div className="bg-green-600 px-4 pt-10 pb-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-green-500 rounded-lg animate-pulse" />
          <div className="h-5 bg-green-500 rounded-md w-32 animate-pulse" />
        </div>
        <div className="h-3.5 bg-green-500/80 rounded-md w-52 animate-pulse" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="px-4 -mt-4 mb-4">
        <div className="h-11 bg-white rounded-2xl shadow-xs border border-gray-200 animate-pulse" />
      </div>

      {/* Promo Banner Skeleton */}
      <div className="px-4 mb-5">
        <div className="h-36 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl animate-pulse" />
      </div>

      {/* Categories Skeleton */}
      <div className="px-4 mb-6">
        <div className="h-4 bg-gray-200 rounded-md w-24 mb-3 animate-pulse" />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border rounded-2xl p-3 flex flex-col items-center gap-2 animate-pulse">
              <div className="w-7 h-7 bg-gray-200 rounded-full" />
              <div className="h-3 bg-gray-200 rounded-md w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="px-4 mb-6">
        <div className="h-4 bg-gray-200 rounded-md w-32 mb-3 animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

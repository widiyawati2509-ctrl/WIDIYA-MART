// @ts-nocheck
import Link from 'next/link'
import Image from 'next/image'
import { formatRupiah } from '@/lib/utils'
import { Package } from 'lucide-react'
import type { Product } from '@/types/database'

interface ProductCardProps {
  product: Product & { categories?: { nama: string; slug: string } | null }
}

export default function ProductCard({ product }: ProductCardProps) {
  const outOfStock = product.stok === 0

  return (
    <Link href={`/produk/${product.slug}`} className="block group">
      <div className={`bg-white border rounded-2xl overflow-hidden btn-3d-card transition-all duration-300 ${outOfStock ? 'opacity-60' : ''}`}>
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.nama}
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 512px) 50vw, 256px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-200">
              <Package className="w-12 h-12 stroke-[1.2]" />
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
              <span className="bg-gray-800 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                Habis
              </span>
            </div>
          )}
          {product.stok > 0 && product.stok <= 5 && (
            <div className="absolute top-2 right-2">
              <span className="bg-orange-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                Sisa {product.stok}
              </span>
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight mb-1.5 group-hover:text-green-700 transition-colors">
            {product.nama}
          </p>
          <p className="text-green-600 font-bold text-base">{formatRupiah(product.harga)}</p>
        </div>
      </div>
    </Link>
  )
}

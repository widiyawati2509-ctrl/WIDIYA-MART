// @ts-nocheck
import Link from 'next/link'
import Image from 'next/image'
import { formatRupiah } from '@/lib/utils'
import { Package } from 'lucide-react'
import { Badge } from '@/components/ui'
import type { Product } from '@/types/database'

interface ProductCardProps {
  product: Product & { categories?: { nama: string; slug: string } | null }
}

export default function ProductCard({ product }: ProductCardProps) {
  const outOfStock = product.stok === 0

  return (
    <Link href={`/produk/${product.slug}`} prefetch={true} className="block group press">
      <div
        className={`glass rounded-xl overflow-hidden transition-all duration-200 ${
          outOfStock ? 'opacity-60' : ''
        }`}
      >
        <div className="relative aspect-square bg-zinc-50 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.nama}
              fill
              className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 512px) 50vw, 256px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-300">
              <Package className="w-12 h-12 stroke-[1.2]" />
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
              <Badge variant="neutral">Habis</Badge>
            </div>
          )}
          {product.stok > 0 && product.stok <= 5 && (
            <div className="absolute top-2 right-2">
              <Badge variant="warning">Sisa {product.stok}</Badge>
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-sm font-medium text-ink line-clamp-2 leading-tight mb-1.5 group-hover:text-accent transition-colors">
            {product.nama}
          </p>
          <p className="text-positive font-bold text-base tabular-nums">
            {formatRupiah(product.harga)}
          </p>
        </div>
      </div>
    </Link>
  )
}

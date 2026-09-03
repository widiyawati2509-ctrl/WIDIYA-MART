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
    <Link href={`/produk/${product.slug}`} prefetch={true} className="block group">
      <div
        className={`product card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-3 shadow-3d transition-all duration-200 ${
          outOfStock ? 'opacity-60' : ''
        }`}
      >
        {/* Thumbnail (14px radius, accent-bg) */}
        <div className="relative aspect-square w-full rounded-[14px] bg-[var(--accent-bg)] shadow-[inset_0_2px_4px_rgba(232,85,33,0.05)] overflow-hidden mb-2.5">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.nama}
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 480px) 50vw, 240px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--accent)]/40">
              <Package className="w-10 h-10 stroke-[1.5]" />
            </div>
          )}

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
              <span className="text-[10px] font-bold bg-[var(--paper)] text-[var(--ink-soft)] px-2 py-0.5 rounded-full border border-[var(--line)]">
                Habis
              </span>
            </div>
          )}

          {product.stok > 0 && product.stok <= 5 && (
            <div className="absolute top-1.5 right-1.5">
              <span className="var-badge text-[9.5px] font-bold bg-[var(--accent-bg)] text-[var(--accent-2)] px-1.5 py-0.5 rounded-[6px] shadow-xs">
                Sisa {product.stok}
              </span>
            </div>
          )}
        </div>

        {/* Info Produk */}
        <h3 className="text-[13.5px] font-bold text-[var(--ink)] line-clamp-2 leading-tight mb-1 group-hover:text-[var(--accent)] transition-colors">
          {product.nama}
        </h3>

        {/* Harga (Sora bold, accent-2) */}
        <p className="font-sora font-bold text-[var(--accent-2)] text-[14px] leading-tight mb-1 tabular-nums">
          {formatRupiah(product.harga)}
        </p>

        {/* Stok */}
        <p className="text-[11px] text-[var(--ink-soft)] font-medium">
          {outOfStock ? 'Stok kosong' : `Stok: ${product.stok}`}
        </p>
      </div>
    </Link>
  )
}

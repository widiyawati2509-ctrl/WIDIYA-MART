// @ts-nocheck
import Link from 'next/link'
import Image from 'next/image'
import { formatRupiah } from '@/lib/utils'
import { Package } from 'lucide-react'
import WishlistHeartButton from '@/components/WishlistHeartButton'
import type { Product } from '@/types/database'

interface ProductCardProps {
  product: Product & { categories?: { nama: string; slug: string } | null }
}

export default function ProductCard({ product }: ProductCardProps) {
  const outOfStock = product.stok === 0

  return (
    <Link href={`/produk/${product.slug}`} prefetch={true} className="block group">
      <div
        className={`product card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] p-3 shadow-3d transition-all duration-200 ${
          outOfStock ? 'opacity-60' : ''
        }`}
      >
        {/* Thumbnail (14px radius, accent-bg) */}
        <div className="relative aspect-square w-full rounded-[var(--radius-md)] bg-[var(--accent-bg)] shadow-[inset_0_2px_4px_rgba(232,85,33,0.05)] overflow-hidden mb-2.5">
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

          {/* Promo / Discount Badge */}
          {product.diskon_persen ? (
            <div className="absolute top-1.5 left-1.5 z-10">
              <span className="text-[var(--text-caption)] font-sora font-extrabold bg-gradient-to-r from-red-600 to-orange-500 text-white px-2 py-0.5 rounded-[var(--radius-sm)] shadow-sm tracking-wide">
                -{product.diskon_persen}%
              </span>
            </div>
          ) : product.badge_text ? (
            <div className="absolute top-1.5 left-1.5 z-10">
              <span className="text-[var(--text-caption)] font-sora font-extrabold bg-gradient-to-r from-red-600 to-orange-500 text-white px-1.5 py-0.5 rounded-[var(--radius-sm)] shadow-sm tracking-wide">
                {product.badge_text}
              </span>
            </div>
          ) : null}

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
              <span className="text-[var(--text-caption)] font-bold bg-[var(--paper)] text-[var(--ink-soft)] px-2 py-0.5 rounded-full border border-[var(--line)]">
                Habis
              </span>
            </div>
          )}

          {product.stok > 0 && product.stok <= 5 && (
            <div className="absolute top-1.5 right-1.5">
              <span className="var-badge text-[var(--text-caption)] font-bold bg-[var(--accent-bg)] text-[var(--accent-2)] px-1.5 py-0.5 rounded-[var(--radius-sm)] shadow-xs">
                Sisa {product.stok}
              </span>
            </div>
          )}
        </div>

        {/* Info Produk */}
        <h3 className="text-[var(--text-body)] font-bold text-[var(--ink)] line-clamp-2 leading-tight mb-1 group-hover:text-[var(--accent)] transition-colors">
          {product.nama}
        </h3>

        {/* Harga (Sora bold, accent-2) */}
        <p className="font-sora font-bold text-[var(--accent-2)] text-[var(--text-body)] leading-tight mb-1 tabular-nums">
          {formatRupiah(product.harga)}
        </p>

        {/* Stok & Tombol Love (Favorit) */}
        <div className="mt-2 pt-2 border-t border-[rgba(232,214,205,0.7)] flex items-center justify-between">
          <p className="text-[var(--text-caption)] text-[var(--ink-soft)] font-medium">
            {outOfStock ? 'Stok kosong' : `Stok: ${product.stok}`}
          </p>
          <WishlistHeartButton product={product} />
        </div>
      </div>
    </Link>
  )
}

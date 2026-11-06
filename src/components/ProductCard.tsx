// @ts-nocheck
import Link from 'next/link'
import Image from 'next/image'
import { formatRupiah } from '@/lib/utils'
import { Package } from 'lucide-react'
import WishlistHeartButton from '@/components/WishlistHeartButton'
import QuickAddCartButton from '@/components/QuickAddCartButton'
import type { Product } from '@/types/database'

interface ProductCardProps {
  product: Product & { categories?: { nama: string; slug: string } | null }
  priority?: boolean
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const outOfStock = product.stok === 0

  return (
    <Link href={`/produk/${product.slug}`} prefetch={true} className="block group h-full">
      <div
        className={`product bg-white border border-[var(--line)] rounded-2xl p-2 shadow-card-sm transition-[transform,border-color,box-shadow] duration-200 h-full flex flex-col justify-between hover:border-[var(--accent)]/50 ${
          outOfStock ? 'opacity-60' : ''
        }`}
      >
        <div>
          {/* Thumbnail (Concentric 12px radius, accent-bg + inner optical ring) */}
          <div className="relative aspect-square w-full rounded-xl bg-[var(--accent-bg)] img-ring-inset overflow-hidden mb-1.5">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.nama}
                fill
                priority={priority}
                className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 480px) 50vw, 240px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--accent)]/40">
                <Package className="size-10 stroke-[1.5]" aria-hidden="true" />
              </div>
            )}

            {/* Promo / Discount Badge */}
            {product.diskon_persen ? (
              <div className="absolute top-1.5 left-1.5 z-10">
                <span className="text-[10px] font-sora font-extrabold bg-[var(--accent)] text-white px-2 py-0.5 rounded-lg shadow-xs tabular-nums">
                  -{product.diskon_persen}%
                </span>
              </div>
            ) : product.badge_text ? (
              <div className="absolute top-1.5 left-1.5 z-10">
                <span className="text-[10px] font-sora font-extrabold bg-[var(--accent)] text-white px-1.5 py-0.5 rounded-lg shadow-xs">
                  {product.badge_text}
                </span>
              </div>
            ) : null}

            {outOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[2px]">
                <span className="text-[var(--text-caption)] font-bold bg-[var(--paper)] text-[var(--ink-soft)] px-2.5 py-0.5 rounded-full border border-[var(--line)]">
                  Stok Habis
                </span>
              </div>
            )}

            {product.stok > 0 && product.stok <= 5 && (
              <div className="absolute top-1.5 right-1.5">
                <span className="var-badge text-[10px] font-bold bg-white/95 text-[var(--accent-2)] px-1.5 py-0.5 rounded-md shadow-2xs tabular-nums">
                  Sisa {product.stok}
                </span>
              </div>
            )}
          </div>

          {/* Info Produk */}
          <h3 className="text-xs font-bold text-[var(--ink)] line-clamp-2 leading-snug mb-1 min-h-[2.1rem] group-hover:text-[var(--accent)] transition-colors">
            {product.nama}
          </h3>
        </div>

        <div>
          {/* Harga & Stok (Sora bold, accent-2, tabular-nums) */}
          <div className="flex items-baseline justify-between gap-1 mb-1.5 tabular-nums">
            <p className="font-sora font-extrabold text-[var(--accent-2)] text-xs leading-tight truncate">
              {formatRupiah(product.harga)}
            </p>
            <p className="text-[10px] text-[var(--ink-soft)] font-medium shrink-0">
              {outOfStock ? 'Kosong' : `Stok ${product.stok}`}
            </p>
          </div>

          {/* Footer Aksi Cepat: Tombol Love (Favorit) + Quick Add (+ Beli) */}
          <div className="pt-1.5 border-t border-[rgba(232,214,205,0.65)] flex items-center justify-between gap-1.5">
            <WishlistHeartButton product={product} iconSize={14} className="size-8 rounded-[10px]" />
            <QuickAddCartButton
              productId={product.id}
              productName={product.nama}
              disabled={outOfStock}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

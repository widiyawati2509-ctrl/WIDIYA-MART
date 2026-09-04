// @ts-nocheck
'use client'

import { useState } from 'react'
import { formatRupiah, parseProductVariants, type ProductVariant } from '@/lib/utils'
import AddToCartButton from '@/components/AddToCartButton'
import { Layers, Check } from 'lucide-react'
import Link from 'next/link'

interface ProductDetailInteractiveProps {
  product: {
    id: string
    nama: string
    harga: number
    stok: number
    deskripsi: string | null
    categories?: { nama: string; slug: string } | null
  }
}

export default function ProductDetailInteractive({ product }: ProductDetailInteractiveProps) {
  const { cleanDeskripsi, variants } = parseProductVariants(product.deskripsi)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.length > 0 ? variants[0] : null
  )

  const activePrice = selectedVariant?.harga ?? product.harga
  const activeStock = selectedVariant?.stok ?? product.stok
  const isOutOfStock = activeStock === 0

  return (
    <>
      {/* Info Card */}
      <div className="mx-4 mt-3 card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-4 shadow-3d">
        {product.categories && (
          <Link
            href={`/kategori?kategori=${product.categories.slug}`}
            className="inline-block bg-[var(--accent-bg)] text-[var(--accent-2)] text-[10.5px] font-bold px-2.5 py-0.5 rounded-full mb-2"
          >
            {product.categories.nama}
          </Link>
        )}
        <h1 className="text-base font-sora font-bold text-[var(--ink)] leading-snug mb-1">
          {product.nama}
        </h1>
        <div className="flex items-baseline gap-2 mb-2">
          <p className="font-sora font-bold text-2xl text-[var(--accent-2)] tabular-nums">
            {formatRupiah(activePrice)}
          </p>
          {selectedVariant && selectedVariant.harga && selectedVariant.harga !== product.harga && (
            <span className="text-xs text-[var(--ink-soft)] line-through">
              {formatRupiah(product.harga)}
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--ink-soft)] font-medium">
          Stok:{' '}
          <span className={activeStock <= 5 ? 'text-[var(--danger)] font-bold' : 'text-[var(--ink)] font-semibold'}>
            {activeStock} tersisa
          </span>
          {selectedVariant && (
            <span className="ml-2 text-[11px] text-[var(--accent-2)] font-semibold">
              ({selectedVariant.nama})
            </span>
          )}
        </p>

        {/* Variant Selection Chips */}
        {variants.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-[var(--line)]">
            <label className="text-[11px] font-bold text-[var(--ink)] block mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[var(--accent)]" /> Pilih Varian:
            </label>
            <div className="flex flex-wrap gap-2">
              {variants.map((v, i) => {
                const isSelected = selectedVariant?.nama === v.nama
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`press text-xs font-sora font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'btn-3d btn-3d-coral text-white border-transparent shadow-sm scale-[1.02]'
                        : 'btn-3d btn-3d-white text-[var(--ink)] border-[var(--line)] hover:border-[var(--accent)]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{v.nama}</span>
                    {v.harga && v.harga !== product.harga && (
                      <span className={`text-[10px] font-normal opacity-90 ${isSelected ? 'text-white' : 'text-[var(--accent-2)]'}`}>
                        ({formatRupiah(v.harga)})
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {cleanDeskripsi && (
        <div className="mx-4 mt-3 card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-4 shadow-3d">
          <h2 className="font-sora font-bold text-sm text-[var(--ink)] mb-2">Deskripsi Produk</h2>
          <p className="text-[var(--ink-soft)] text-xs leading-relaxed whitespace-pre-line font-inter">
            {cleanDeskripsi}
          </p>
        </div>
      )}

      {/* Floating Add to Cart */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 max-w-[480px] w-full px-4 z-40">
        <div className="bg-[var(--paper)]/95 backdrop-blur-md p-2.5 rounded-[20px] border border-[rgba(232,214,205,0.9)] shadow-[0_10px_25px_-5px_rgba(232,85,33,0.15)]">
          <AddToCartButton
            productId={product.id}
            disabled={isOutOfStock}
          />
        </div>
      </div>
    </>
  )
}

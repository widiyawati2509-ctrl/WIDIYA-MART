// @ts-nocheck
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatRupiah, parseProductVariants, formatWhatsAppUrl, type ProductVariant } from '@/lib/utils'
import AddToCartButton from '@/components/AddToCartButton'
import { Layers, Check, MessageCircle, Package, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface ProductDetailInteractiveProps {
  product: {
    id: string
    nama: string
    harga: number
    stok: number
    deskripsi: string | null
    image_url?: string | null
    slug: string
    categories?: { nama: string; slug: string } | null
  }
  storePhone?: string
}

export default function ProductDetailInteractive({ product, storePhone = '087816182036' }: ProductDetailInteractiveProps) {
  const { cleanDeskripsi, variants } = parseProductVariants(product.deskripsi)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.length > 0 ? variants[0] : null
  )
  const [showStockModal, setShowStockModal] = useState(false)

  const activePrice = selectedVariant?.harga ?? product.harga
  const activeStock = selectedVariant?.stok ?? product.stok
  const isOutOfStock = activeStock === 0

  const getWhatsAppMessage = () => {
    let msg = `Halo Admin Widiya Mart, saya ingin menanyakan apakah stok produk ini masih ada?\n\n*${product.nama}*\nHarga: ${formatRupiah(activePrice)}`
    if (selectedVariant?.nama) {
      msg += `\nVarian: ${selectedVariant.nama}`
    }
    msg += `\nStatus: ${isOutOfStock ? 'Tertulis Habis di web' : `Tersedia (${activeStock} pcs)`}`
    msg += `\nLink: https://widiya-mart.vercel.app/produk/${product.slug}`
    return msg
  }

  const whatsappUrl = formatWhatsAppUrl(storePhone, getWhatsAppMessage())

  return (
    <>
      {/* Interactive Image Gallery with Tap to Ask Stock */}
      <div className="mx-4 mt-3 relative aspect-square rounded-[20px] bg-[var(--accent-bg)] border border-[rgba(232,214,205,0.9)] overflow-hidden shadow-[inset_0_2px_4px_rgba(232,85,33,0.05)] group">
        <button
          type="button"
          onClick={() => setShowStockModal(true)}
          className="w-full h-full text-left relative block focus:outline-none"
          title="Ketuk gambar untuk menanyakan stok produk via WhatsApp"
        >
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.nama}
              fill
              className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 480px) 100vw, 480px"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--accent)]/40">
              <Package className="w-20 h-20 stroke-[1.2]" />
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-[var(--danger)] font-bold px-4 py-1.5 rounded-full text-xs shadow-md">
                Stok Habis
              </span>
            </div>
          )}

          {/* Floating Pill on image */}
          <div className="absolute bottom-3 right-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600/90 text-white text-[11px] font-sora font-bold shadow-md backdrop-blur-xs hover:bg-emerald-700 active:scale-95 transition-all">
              <MessageCircle size={14} />
              <span>Tanya Stok via WA</span>
            </span>
          </div>
        </button>
      </div>

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
        <div className="flex items-center justify-between text-xs">
          <p className="text-[var(--ink-soft)] font-medium">
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

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-sora font-bold text-emerald-600 hover:text-emerald-700 underline"
          >
            <MessageCircle size={12} />
            <span>Tanya Stok</span>
          </a>
        </div>

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

      {/* Floating Action Bar: Tanya Stok WA + Add To Cart */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 max-w-[480px] w-full px-4 z-40">
        <div className="bg-[var(--paper)]/95 backdrop-blur-md p-2.5 rounded-[20px] border border-[rgba(232,214,205,0.9)] shadow-[0_10px_25px_-5px_rgba(232,85,33,0.15)] flex items-center gap-2">
          {/* Tanya Stok WhatsApp Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="press flex flex-col items-center justify-center px-3.5 py-2.5 rounded-[16px] bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shrink-0 active:scale-95 transition-all"
            title="Tanya stok via WhatsApp"
          >
            <MessageCircle size={18} />
            <span className="text-[10px] font-sora font-bold mt-0.5 leading-tight">Tanya Stok</span>
          </a>

          {/* Add To Cart */}
          <div className="flex-1">
            <AddToCartButton
              productId={product.id}
              disabled={isOutOfStock}
            />
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Tanya Stok via WA */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-page-in">
          <div className="card-3d bg-white rounded-[24px] p-5 w-full max-w-[400px] shadow-2xl border border-[var(--line)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MessageCircle size={18} />
                </span>
                <h3 className="font-sora font-bold text-sm text-[var(--ink)]">Tanya Stok Produk</h3>
              </div>
              <button
                onClick={() => setShowStockModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center"
              >
                <X size={15} />
              </button>
            </div>

            <div className="py-4 space-y-2">
              <p className="text-xs text-[var(--ink-soft)]">
                Kirim pesan langsung ke WhatsApp Admin Toko untuk menanyakan ketersediaan stok:
              </p>
              <div className="p-3 rounded-[16px] bg-[var(--paper)] border border-[rgba(232,214,205,0.9)] text-xs">
                <p className="font-bold text-[var(--ink)] line-clamp-1">{product.nama}</p>
                <p className="font-sora font-bold text-[var(--accent-2)] mt-0.5">{formatRupiah(activePrice)}</p>
                {selectedVariant && (
                  <p className="text-[11px] text-[var(--ink-soft)] mt-0.5">Varian: <strong>{selectedVariant.nama}</strong></p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowStockModal(false)}
                className="flex-1 py-3 text-xs font-sora font-bold rounded-[14px] bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
              >
                Batal
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowStockModal(false)}
                className="flex-[2] inline-flex items-center justify-center gap-1.5 py-3 text-xs font-sora font-bold rounded-[14px] bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm active:scale-95 transition-all"
              >
                <MessageCircle size={15} />
                <span>Kirim via WhatsApp</span>
                <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// @ts-nocheck
'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatRupiah } from '@/lib/utils'
import { moveShoppingListItemToCart, removeFromShoppingList, moveAllShoppingListToCart } from '@/lib/actions/shopping-list'
import { Bookmark, ShoppingBag, Trash2, ShoppingCart, Loader2, Package, ArrowRight } from 'lucide-react'
import { EmptyState } from '@/components/ui'

interface ShoppingListClientProps {
  initialItems: any[]
}

export default function ShoppingListClient({ initialItems }: ShoppingListClientProps) {
  const [items, setItems] = useState<any[]>(initialItems)
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleMoveToCart = (productId: string, itemId: string) => {
    startTransition(async () => {
      const res = await moveShoppingListItemToCart(productId, itemId)
      if (res.success) {
        setItems((prev) => prev.filter((i) => i.id !== itemId))
        setFeedback({ type: 'success', text: 'Produk berhasil dipindahkan ke keranjang!' })
      } else {
        setFeedback({ type: 'error', text: res.error || 'Gagal memindahkan ke keranjang' })
      }
    })
  }

  const handleRemove = (itemId: string) => {
    startTransition(async () => {
      const res = await removeFromShoppingList(itemId)
      if (res.success) {
        setItems((prev) => prev.filter((i) => i.id !== itemId))
        setFeedback({ type: 'success', text: 'Produk dihapus dari daftar belanja' })
      } else {
        setFeedback({ type: 'error', text: res.error || 'Gagal menghapus' })
      }
    })
  }

  const handleMoveAll = () => {
    startTransition(async () => {
      const res = await moveAllShoppingListToCart()
      if (res.success) {
        setItems([])
        setFeedback({ type: 'success', text: `${res.count} produk berhasil dimasukkan ke keranjang!` })
      } else {
        setFeedback({ type: 'error', text: res.error || 'Gagal memindahkan produk' })
      }
    })
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        message="Daftar belanja Anda masih kosong. Simpan produk favorit Anda untuk belanja lebih cepat."
        actionHref="/"
        actionLabel="Cari Produk"
      />
    )
  }

  return (
    <div className="space-y-3.5">
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs px-2 py-0.5 rounded-lg opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top action: Move All to Cart */}
      <div className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-[20px] p-3 shadow-3d flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--ink)]">
          {items.length} produk tersimpan
        </span>
        <button
          type="button"
          onClick={handleMoveAll}
          disabled={isPending}
          className="press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-2)] text-white text-xs font-sora font-bold shadow-sm active:scale-95 transition-all"
        >
          {isPending ? <Loader2 size={13} className="animate-spin" /> : <ShoppingCart size={13} />}
          <span>Pindahkan Semua</span>
        </button>
      </div>

      {/* Item Cards */}
      <div className="space-y-3">
        {items.map((item) => {
          const product = item.products
          if (!product) return null
          const isOutOfStock = product.stok === 0

          return (
            <div
              key={item.id}
              className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-3.5 shadow-3d flex items-center gap-3"
            >
              {/* Image */}
              <Link
                href={`/produk/${product.slug}`}
                className="relative w-16 h-16 rounded-[14px] bg-[var(--accent-bg)] border border-[var(--line)] overflow-hidden shrink-0 flex items-center justify-center"
              >
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.nama}
                    fill
                    className="object-contain p-1"
                    sizes="64px"
                  />
                ) : (
                  <Package className="w-6 h-6 text-gray-400" />
                )}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-[8px] bg-white text-red-600 font-bold px-1 rounded">Habis</span>
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={`/produk/${product.slug}`} className="block">
                  <h3 className="text-xs font-bold text-[var(--ink)] line-clamp-1 leading-snug hover:text-[var(--accent)] transition-colors">
                    {product.nama}
                  </h3>
                </Link>
                <p className="font-sora font-bold text-sm text-[var(--accent-2)] mt-0.5 tabular-nums">
                  {formatRupiah(product.harga)}
                </p>
                <p className="text-[10px] text-[var(--ink-soft)] font-medium">
                  {isOutOfStock ? 'Stok habis' : `Tersedia (${product.stok} pcs)`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleMoveToCart(product.id, item.id)}
                  disabled={isPending || isOutOfStock}
                  className="press inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-2)] disabled:bg-gray-200 text-white text-[11px] font-sora font-bold shadow-xs active:scale-95 transition-all"
                  title="Pindahkan ke Keranjang"
                >
                  <ShoppingCart size={12} />
                  <span>+ Keranjang</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  disabled={isPending}
                  className="press inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 text-[10px] font-medium transition-colors"
                  title="Hapus dari Daftar Belanja"
                >
                  <Trash2 size={11} />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// @ts-nocheck
'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatRupiah } from '@/lib/utils'
import { moveShoppingListItemToCart, removeFromShoppingList, moveAllShoppingListToCart } from '@/lib/actions/shopping-list'
import { Bookmark, ShoppingBag, Trash2, ShoppingCart, Loader2, Package, ArrowRight, CheckCircle2, Heart, Check } from 'lucide-react'
import { EmptyState } from '@/components/ui'

interface ShoppingListClientProps {
  initialItems: any[]
}

export default function ShoppingListClient({ initialItems }: ShoppingListClientProps) {
  const [items, setItems] = useState<any[]>(initialItems)
  const [isPending, startTransition] = useTransition()
  const [movingId, setMovingId] = useState<string | null>(null)
  const [lastMoved, setLastMoved] = useState<{ nama: string; count: number } | null>(null)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string; actionHref?: string; actionLabel?: string } | null>(null)

  // Merge items from localStorage on client mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('pengenjek_shopping_list')
      if (raw) {
        const localList = JSON.parse(raw)
        if (Array.isArray(localList) && localList.length > 0) {
          setItems((prev) => {
            const existingIds = new Set(prev.map((i) => i.product_id || i.id))
            const newFromLocal = localList.filter((item: any) => !existingIds.has(item.product_id || item.id))
            return [...prev, ...newFromLocal]
          })
        }
      }
    } catch {
      // ignore
    }
  }, [])

  // Auto hide toast after 6 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 6000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  const removeFromLocal = (productId: string, itemId: string) => {
    try {
      const raw = localStorage.getItem('pengenjek_shopping_list')
      if (raw) {
        let list = JSON.parse(raw)
        if (Array.isArray(list)) {
          list = list.filter((i: any) => i.id !== itemId && i.product_id !== productId && i.id !== `local_${productId}`)
          localStorage.setItem('pengenjek_shopping_list', JSON.stringify(list))
        }
      }
    } catch {
      // ignore
    }
  }

  const handleMoveToCart = (productId: string, itemId: string, productName: string) => {
    setMovingId(itemId)
    startTransition(async () => {
      removeFromLocal(productId, itemId)
      const res = await moveShoppingListItemToCart(productId, itemId)
      setMovingId(null)
      if (res.success) {
        setItems((prev) => prev.filter((i) => i.id !== itemId && i.product_id !== productId))
        setLastMoved({ nama: productName, count: 1 })
        setToastMessage({
          type: 'success',
          text: `"${productName}" berhasil masuk ke keranjang!`,
          actionHref: '/keranjang',
          actionLabel: 'Buka Keranjang',
        })
      } else {
        setToastMessage({
          type: 'error',
          text: res.error || 'Gagal memindahkan produk ke keranjang',
        })
      }
    })
  }

  const handleRemove = (itemId: string, productId?: string, productName?: string) => {
    startTransition(async () => {
      if (productId) removeFromLocal(productId, itemId)
      const res = await removeFromShoppingList(itemId)
      if (res.success) {
        setItems((prev) => prev.filter((i) => i.id !== itemId))
        setToastMessage({
          type: 'success',
          text: `"${productName || 'Produk'}" telah dihapus dari daftar belanja.`,
        })
      } else {
        setToastMessage({ type: 'error', text: res.error || 'Gagal menghapus produk' })
      }
    })
  }

  const handleMoveAll = () => {
    setMovingId('all')
    startTransition(async () => {
      // Clear localStorage
      try {
        localStorage.removeItem('pengenjek_shopping_list')
      } catch {
        // ignore
      }

      // Try server move first
      const currentCount = items.length
      const res = await moveAllShoppingListToCart()
      setMovingId(null)

      if (res.success && res.count > 0) {
        setItems([])
        setLastMoved({ nama: 'Semua produk favorit', count: res.count })
        setToastMessage({
          type: 'success',
          text: `${res.count} produk berhasil dipindahkan ke keranjang!`,
          actionHref: '/keranjang',
          actionLabel: 'Buka Keranjang',
        })
        return
      }

      // If server moved 0 (e.g. table not ready or items were local), move each item individually
      let count = 0
      for (const item of items) {
        const pId = item.product_id || item.products?.id
        if (pId) {
          const moveRes = await moveShoppingListItemToCart(pId, item.id)
          if (moveRes.success) count++
        }
      }

      setItems([])
      const totalMoved = count || currentCount
      setLastMoved({ nama: 'Semua produk favorit', count: totalMoved })
      setToastMessage({
        type: 'success',
        text: `${totalMoved} produk berhasil dimasukkan ke keranjang!`,
        actionHref: '/keranjang',
        actionLabel: 'Buka Keranjang',
      })
    })
  }

  // When all items in list are empty
  if (items.length === 0) {
    // If user just moved items to cart, show the reassuring success screen
    if (lastMoved) {
      return (
        <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[24px] p-6 text-center shadow-3d space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm animate-bounce-short">
            <CheckCircle2 size={36} className="stroke-[2.2]" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-[11px] font-sora font-bold mb-2">
              <Check size={12} /> Sudah di Keranjang
            </span>
            <h2 className="font-sora font-bold text-lg text-[var(--ink)]">
              Produk Berhasil Dipindahkan!
            </h2>
            <p className="text-xs text-[var(--ink-soft)] mt-1.5 leading-relaxed max-w-xs mx-auto">
              <strong className="text-[var(--ink)] font-semibold">{lastMoved.nama}</strong> sudah aman tersimpan di keranjang belanja Anda. Siap untuk checkout sekarang?
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <Link
              href="/keranjang"
              prefetch={true}
              className="press w-full py-3 px-5 rounded-[16px] bg-[var(--accent)] hover:bg-[var(--accent-2)] text-white text-sm font-sora font-bold shadow-3d flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <ShoppingCart size={16} />
              <span>Buka Keranjang Belanja Sekarang</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/kategori"
              prefetch={true}
              className="press w-full py-2.5 px-4 rounded-[16px] bg-white hover:bg-[var(--accent-bg)] text-[var(--ink)] border border-[rgba(232,214,205,0.9)] text-xs font-sora font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <ShoppingBag size={14} className="text-[var(--accent)]" />
              <span>Cari Produk Lainnya</span>
            </Link>
          </div>
        </div>
      )
    }

    return (
      <EmptyState
        icon={Bookmark}
        message="Daftar belanja Anda masih kosong. Ketuk ikon hati pada produk untuk menyimpannya ke daftar ini."
        actionHref="/"
        actionLabel="Cari Produk"
      />
    )
  }

  return (
    <div className="space-y-3.5">
      {/* Floating Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 max-w-[calc(480px-32px)] w-[calc(100%-32px)] z-50 animate-bounce-short">
          <div
            className={`p-3 rounded-[20px] text-xs font-semibold flex items-center justify-between shadow-2xl border ${
              toastMessage.type === 'success'
                ? 'bg-[#2B1810] text-white border-emerald-500/50'
                : 'bg-red-950 text-white border-red-500/50'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShoppingCart size={15} />
              </div>
              <div className="truncate">
                <p className="font-sora font-bold text-[12px] text-white truncate">{toastMessage.text}</p>
                <p className="text-[10px] text-emerald-300 font-medium">Tersimpan di keranjang belanja</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {toastMessage.actionHref && (
                <Link
                  href={toastMessage.actionHref}
                  prefetch={true}
                  className="px-3 py-1.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-2)] text-white text-[11px] font-sora font-bold shadow-md flex items-center gap-1 active:scale-95 transition-all"
                >
                  <span>{toastMessage.actionLabel || 'Keranjang'}</span>
                  <ArrowRight size={12} />
                </Link>
              )}
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="text-xs px-2 py-1 rounded-lg text-gray-400 hover:text-white"
                aria-label="Tutup notifikasi"
              >
                ✕
              </button>
            </div>
          </div>
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
          disabled={isPending || movingId !== null}
          className="press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-2)] disabled:opacity-60 text-white text-xs font-sora font-bold shadow-sm active:scale-95 transition-all"
        >
          {movingId === 'all' ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Memindahkan...</span>
            </>
          ) : (
            <>
              <ShoppingCart size={13} />
              <span>Pindahkan Semua</span>
            </>
          )}
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
                  onClick={() => handleMoveToCart(product.id, item.id, product.nama)}
                  disabled={isPending || isOutOfStock || movingId !== null}
                  className="press inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-2)] disabled:opacity-60 disabled:bg-gray-200 text-white text-[11px] font-sora font-bold shadow-xs active:scale-95 transition-all"
                  title="Pindahkan ke Keranjang"
                >
                  {movingId === item.id ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>Memindahkan...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={12} />
                      <span>+ Keranjang</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id, product.id, product.nama)}
                  disabled={isPending || movingId !== null}
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

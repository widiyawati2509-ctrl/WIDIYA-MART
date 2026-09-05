// @ts-nocheck
'use client'

import Image from 'next/image'
import { formatRupiah } from '@/lib/utils'
import { updateCartQty, removeFromCart } from '@/lib/actions/cart'
import { Minus, Plus, Trash2, Package } from 'lucide-react'
import { useTransition } from 'react'

interface CartItemRowProps {
  item: {
    id: string
    qty: number
    products: {
      id: string
      nama: string
      harga: number
      stok: number
      image_url: string | null
      slug: string
    } | null
  }
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const [isPending, startTransition] = useTransition()
  const product = item.products

  if (!product) return null

  const updateQty = (newQty: number) => {
    startTransition(async () => {
      await updateCartQty(item.id, newQty)
    })
  }

  const remove = () => {
    startTransition(async () => {
      await removeFromCart(item.id)
    })
  }

  return (
    <div
      className={`card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] p-3.5 shadow-3d flex gap-3 items-center ${
        isPending ? 'opacity-50' : ''
      } transition-opacity`}
    >
      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded-[var(--radius-md)] bg-[var(--accent-bg)] border border-[var(--line)] shrink-0 overflow-hidden shadow-[inset_0_2px_4px_rgba(232,85,33,0.05)]">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.nama} fill className="object-contain p-1" sizes="56px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--accent)]/40">
            <Package size={20} />
          </div>
        )}
      </div>

      {/* Detail */}
      <div className="flex-1 min-w-0">
        <p className="text-[var(--text-body)] font-bold text-[var(--ink)] line-clamp-1">{product.nama}</p>
        <p className="font-sora font-bold text-[var(--accent-2)] text-xs mt-0.5 tabular-nums">
          {formatRupiah(product.harga)}
        </p>

        <div className="flex items-center justify-between mt-2.5">
          {/* Stepper Qty */}
          <div className="flex items-center gap-1 border border-[var(--line)] bg-[var(--paper)] rounded-[var(--radius-sm)] px-1.5 py-0.5">
            <button
              type="button"
              onClick={() => updateQty(item.qty - 1)}
              disabled={isPending}
              className="press w-6 h-6 flex items-center justify-center rounded text-[var(--ink-soft)] hover:text-[var(--ink)] disabled:opacity-30"
              aria-label="Kurangi"
            >
              <Minus size={13} />
            </button>
            <span className="w-5 text-center text-xs font-sora font-bold text-[var(--ink)] tabular-nums">
              {item.qty}
            </span>
            <button
              type="button"
              onClick={() => updateQty(item.qty + 1)}
              disabled={isPending || item.qty >= product.stok}
              className="press w-6 h-6 flex items-center justify-center rounded text-[var(--ink-soft)] hover:text-[var(--ink)] disabled:opacity-30"
              aria-label="Tambah"
            >
              <Plus size={13} />
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-sora font-bold text-[var(--ink)] tabular-nums">
              {formatRupiah(product.harga * item.qty)}
            </span>
            <button
              type="button"
              onClick={remove}
              disabled={isPending}
              className="press p-1.5 text-[var(--ink-soft)] hover:text-[var(--danger)] hover:bg-red-50 rounded-full transition-colors"
              title="Hapus"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

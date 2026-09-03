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
    <div className={`flex gap-3.5 px-4 py-3.5 items-center ${isPending ? 'opacity-50' : ''} transition-opacity`}>
      <div className="relative w-14 h-14 rounded-lg bg-zinc-50 border border-border shrink-0 overflow-hidden">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.nama} fill className="object-contain p-1" sizes="56px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300">
            <Package size={20} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink line-clamp-1">{product.nama}</p>
        <p className="text-positive font-bold text-xs mt-0.5 tabular-nums">{formatRupiah(product.harga)}</p>

        <div className="flex items-center justify-between mt-2">
          {/* Counter */}
          <div className="flex items-center gap-1.5 glass rounded-lg px-1.5 py-0.5">
            <button
              type="button"
              onClick={() => updateQty(item.qty - 1)}
              disabled={isPending}
              className="press w-6 h-6 flex items-center justify-center rounded text-muted-strong hover:text-ink disabled:opacity-30"
              aria-label="Kurangi"
            >
              <Minus size={14} />
            </button>
            <span className="w-5 text-center text-xs font-bold text-ink tabular-nums">{item.qty}</span>
            <button
              type="button"
              onClick={() => updateQty(item.qty + 1)}
              disabled={isPending || item.qty >= product.stok}
              className="press w-6 h-6 flex items-center justify-center rounded text-muted-strong hover:text-ink disabled:opacity-30"
              aria-label="Tambah"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold text-ink tabular-nums">{formatRupiah(product.harga * item.qty)}</span>
            <button
              type="button"
              onClick={remove}
              disabled={isPending}
              className="press p-1 text-muted hover:text-red-600 rounded-md transition-colors"
              title="Hapus"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

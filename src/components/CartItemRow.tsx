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
    <div className={`flex gap-3 px-4 py-4 ${isPending ? 'opacity-50' : ''} transition-opacity`}>
      <div className="relative w-16 h-16 rounded-xl bg-gray-50 border shrink-0 overflow-hidden">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.nama} fill className="object-contain p-1" sizes="64px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <Package className="w-6 h-6" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 line-clamp-2">{product.nama}</p>
        <p className="text-green-600 font-bold text-sm mt-0.5">{formatRupiah(product.harga)}</p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl px-1">
            <button
              onClick={() => updateQty(item.qty - 1)}
              disabled={isPending}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
            <button
              onClick={() => updateQty(item.qty + 1)}
              disabled={isPending || item.qty >= product.stok}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-40"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{formatRupiah(product.harga * item.qty)}</span>
            <button
              onClick={remove}
              disabled={isPending}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// @ts-nocheck
'use client'

import { useState } from 'react'
import { addToCart } from '@/lib/actions/cart'
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react'

interface AddToCartButtonProps {
  productId: string
  disabled?: boolean
}

export default function AddToCartButton({ productId, disabled }: AddToCartButtonProps) {
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAdd = async () => {
    setLoading(true)
    const result = await addToCart(productId, qty)
    setLoading(false)

    if (!result?.error) {
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  if (disabled) {
    return (
      <button disabled className="w-full bg-gray-200 text-gray-400 py-4 rounded-2xl font-semibold cursor-not-allowed">
        Stok Habis
      </button>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-2">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-200 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-6 text-center font-semibold text-sm">{qty}</span>
        <button
          onClick={() => setQty((q) => q + 1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={handleAdd}
        disabled={loading || added}
        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold transition-all ${
          added
            ? 'bg-green-100 text-green-700'
            : 'bg-green-600 text-white hover:bg-green-700'
        } disabled:opacity-70`}
      >
        {added ? (
          <>
            <Check className="w-5 h-5" />
            Ditambahkan!
          </>
        ) : loading ? (
          'Menambahkan...'
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            Tambah ke Keranjang
          </>
        )}
      </button>
    </div>
  )
}

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
      <div className="flex items-center gap-1.5 bg-gray-100 rounded-2xl p-1 border border-gray-200">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="btn-3d btn-3d-white w-9 h-9 rounded-xl flex items-center justify-center text-gray-700"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-7 text-center font-bold text-sm text-gray-800">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          className="btn-3d btn-3d-white w-9 h-9 rounded-xl flex items-center justify-center text-gray-700"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={loading || added}
        className={`btn-3d flex-1 py-4 rounded-2xl font-semibold gap-2 ${
          added
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'btn-3d-green'
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

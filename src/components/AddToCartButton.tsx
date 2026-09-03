// @ts-nocheck
'use client'

import { useState } from 'react'
import { addToCart } from '@/lib/actions/cart'
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react'
import { Button } from '@/components/ui'

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
      <button
        disabled
        className="w-full rounded-lg bg-zinc-200 py-3.5 text-sm font-semibold text-muted cursor-not-allowed"
      >
        Stok Habis
      </button>
    )
  }

  return (
    <div className="flex gap-2.5 items-center">
      {/* Counter */}
      <div className="flex items-center gap-1 glass rounded-lg p-1">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="press w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-100 text-muted-strong"
          aria-label="Kurangi jumlah"
        >
          <Minus size={16} />
        </button>
        <span className="w-6 text-center font-bold text-sm text-ink tabular-nums">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          className="press w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-100 text-muted-strong"
          aria-label="Tambah jumlah"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Primary Action Button */}
      <Button
        variant={added ? 'secondary' : 'primary'}
        onClick={handleAdd}
        disabled={loading || added}
        className="flex-1 py-3"
      >
        {added ? (
          <>
            <Check size={18} className="text-positive" />
            <span className="text-positive">Ditambahkan!</span>
          </>
        ) : loading ? (
          'Menambahkan...'
        ) : (
          <>
            <ShoppingCart size={18} />
            Tambah ke Keranjang
          </>
        )}
      </Button>
    </div>
  )
}

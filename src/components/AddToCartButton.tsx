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
        className="w-full rounded-[16px] bg-[var(--line)]/60 py-3.5 text-sm font-semibold text-[var(--ink-soft)] cursor-not-allowed"
      >
        Stok Habis
      </button>
    )
  }

  return (
    <div className="flex gap-2.5 items-center">
      {/* Stepper Qty (10-12px radius, warm paper border) */}
      <div className="flex items-center gap-1 border border-[var(--line)] bg-white rounded-[12px] p-1 shadow-[0_2px_6px_rgba(43,24,16,0.04)]">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="press w-8 h-8 flex items-center justify-center rounded-[10px] hover:bg-[var(--paper)] text-[var(--ink)]"
          aria-label="Kurangi jumlah"
        >
          <Minus size={16} />
        </button>
        <span className="w-6 text-center font-sora font-bold text-sm text-[var(--ink)] tabular-nums">
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          className="press w-8 h-8 flex items-center justify-center rounded-[10px] hover:bg-[var(--paper)] text-[var(--ink)]"
          aria-label="Tambah jumlah"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Primary Action Button (Toko Kita add-btn) */}
      <Button
        variant={added ? 'secondary' : 'primary'}
        onClick={handleAdd}
        disabled={loading || added}
        className="flex-1 py-3 text-sm font-sora font-bold"
      >
        {added ? (
          <>
            <Check size={18} className="text-emerald-600" />
            <span className="text-emerald-600">Ditambahkan!</span>
          </>
        ) : loading ? (
          'Menambahkan...'
        ) : (
          <>
            <ShoppingCart size={18} />
            + Keranjang
          </>
        )}
      </Button>
    </div>
  )
}

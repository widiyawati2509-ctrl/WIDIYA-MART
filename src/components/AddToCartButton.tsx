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
        className="w-full rounded-[var(--radius-md)] bg-[var(--line)]/60 h-10 xs:h-11 px-3 text-xs xs:text-sm font-semibold text-[var(--ink-soft)] cursor-not-allowed whitespace-nowrap"
      >
        Stok Habis
      </button>
    )
  }

  return (
    <div className="flex gap-1.5 xs:gap-2 items-center w-full min-w-0">
      {/* Stepper Qty (10-12px radius, warm paper border) */}
      <div className="flex items-center gap-0.5 xs:gap-1 border border-[var(--line)] bg-white rounded-[var(--radius-sm)] p-0.5 xs:p-1 shadow-[0_2px_6px_rgba(43,24,16,0.04)] shrink-0">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="press w-7 h-7 xs:w-8 xs:h-8 flex items-center justify-center rounded-[var(--radius-sm)] hover:bg-[var(--paper)] text-[var(--ink)] shrink-0"
          aria-label="Kurangi jumlah"
        >
          <Minus size={15} />
        </button>
        <span className="w-5 xs:w-6 text-center font-sora font-bold text-xs xs:text-sm text-[var(--ink)] tabular-nums shrink-0">
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          className="press w-7 h-7 xs:w-8 xs:h-8 flex items-center justify-center rounded-[var(--radius-sm)] hover:bg-[var(--paper)] text-[var(--ink)] shrink-0"
          aria-label="Tambah jumlah"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Primary Action Button (Toko Kita add-btn) */}
      <Button
        variant={added ? 'secondary' : 'primary'}
        onClick={handleAdd}
        disabled={loading || added}
        className="flex-1 min-w-0 h-10 px-2 sm:px-3 py-2 text-xs sm:text-sm font-sora font-bold leading-tight"
      >
        {added ? (
          <>
            <Check size={16} className="text-emerald-600 shrink-0" />
            <span className="text-emerald-600">Ditambahkan!</span>
          </>
        ) : loading ? (
          <span>Menambahkan...</span>
        ) : (
          <>
            <ShoppingCart size={16} className="shrink-0" />
            <span>+ Keranjang</span>
          </>
        )}
      </Button>
    </div>
  )
}

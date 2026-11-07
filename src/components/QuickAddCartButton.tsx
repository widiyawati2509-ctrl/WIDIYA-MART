// @ts-nocheck
'use client'

import { useState } from 'react'
import { Plus, Check, Loader2 } from 'lucide-react'
import { addToCart } from '@/lib/actions/cart'

interface QuickAddCartButtonProps {
  productId: string
  productName: string
  disabled?: boolean
}

export default function QuickAddCartButton({
  productId,
  productName,
  disabled = false,
}: QuickAddCartButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'added'>('idle')

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled || status === 'loading') return

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10)
      } catch {}
    }

    setStatus('loading')
    try {
      const res = await addToCart(productId, 1)
      if (!res?.error) {
        setStatus('added')
        setTimeout(() => setStatus('idle'), 1600)
      } else {
        setStatus('idle')
      }
    } catch {
      setStatus('idle')
    }
  }

  return (
    <button
      type="button"
      onClick={handleQuickAdd}
      disabled={disabled || status === 'loading'}
      aria-label={
        status === 'added'
          ? `${productName} ditambahkan ke keranjang`
          : `Tambah ${productName} ke keranjang`
      }
      className={`press hit-area-expand inline-flex items-center justify-center gap-1 px-2.5 h-8 rounded-[10px] font-sora font-bold text-[11px] transition-[transform,background-color,color,box-shadow] duration-150 disabled:opacity-50 ${
        status === 'added'
          ? 'bg-emerald-600 text-white shadow-xs animate-pop'
          : 'bg-[var(--accent)] hover:bg-[var(--accent-2)] text-white shadow-xs'
      }`}
    >
      {status === 'loading' ? (
        <Loader2 size={12} aria-hidden="true" className="animate-spin" />
      ) : status === 'added' ? (
        <>
          <Check size={12} aria-hidden="true" />
          <span>Masuk</span>
        </>
      ) : (
        <>
          <Plus size={12} aria-hidden="true" />
          <span>Beli</span>
        </>
      )}
    </button>
  )
}

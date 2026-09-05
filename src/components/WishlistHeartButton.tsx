// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { toggleShoppingListItem } from '@/lib/actions/shopping-list'

interface WishlistHeartButtonProps {
  product: {
    id: string
    nama: string
    harga: number
    stok: number
    image_url?: string | null
    slug: string
  }
  showLabel?: boolean
  className?: string
  iconSize?: number
}

export default function WishlistHeartButton({
  product,
  showLabel = false,
  className = '',
  iconSize = 16,
}: WishlistHeartButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const checkStatus = () => {
    try {
      const raw = localStorage.getItem('pengenjek_shopping_list')
      if (raw) {
        const list = JSON.parse(raw)
        if (Array.isArray(list)) {
          const exists = list.some((i: any) => i.product_id === product.id || i.id === product.id || i.id === `local_${product.id}`)
          setIsWishlisted(exists)
        }
      } else {
        setIsWishlisted(false)
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    checkStatus()

    const handleSync = () => checkStatus()
    window.addEventListener('pengenjek_wishlist_updated', handleSync)
    return () => window.removeEventListener('pengenjek_wishlist_updated', handleSync)
  }, [product.id])

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)

    const next = !isWishlisted
    setIsWishlisted(next)

    try {
      const raw = localStorage.getItem('pengenjek_shopping_list')
      let list = raw ? JSON.parse(raw) : []
      if (!Array.isArray(list)) list = []

      if (next) {
        if (!list.some((i: any) => i.product_id === product.id || i.id === product.id)) {
          list.push({
            id: `local_${product.id}`,
            product_id: product.id,
            products: {
              id: product.id,
              nama: product.nama,
              harga: product.harga,
              stok: product.stok,
              image_url: product.image_url || null,
              slug: product.slug,
            },
            created_at: new Date().toISOString(),
          })
        }
      } else {
        list = list.filter((i: any) => i.product_id !== product.id && i.id !== product.id && i.id !== `local_${product.id}`)
      }

      localStorage.setItem('pengenjek_shopping_list', JSON.stringify(list))
      window.dispatchEvent(new Event('pengenjek_wishlist_updated'))
    } catch (err) {
      console.warn('LocalStorage wishlist error:', err)
    }

    // Sync to Supabase in background
    try {
      await toggleShoppingListItem(product.id)
    } catch {
      // ignore silently
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isWishlisted ? `Hapus ${product.nama} dari favorit` : `Simpan ${product.nama} ke favorit`}
      title={isWishlisted ? 'Tersimpan di Favorit' : 'Suka / Simpan Produk'}
      className={`press inline-flex items-center justify-center gap-1.5 rounded-full transition-all active:scale-90 ${
        isWishlisted
          ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
          : 'bg-white hover:bg-rose-50 text-[var(--ink-soft)] hover:text-rose-500 border border-[rgba(232,214,205,0.9)]'
      } ${showLabel ? 'px-3 py-1.5' : 'w-8 h-8'} ${className}`}
    >
      <Heart
        size={iconSize}
        className={`transition-all duration-200 ${
          isWishlisted
            ? 'fill-rose-500 text-rose-500 stroke-[2]'
            : 'stroke-[1.8]'
        } ${isAnimating ? 'scale-125' : 'scale-100'}`}
      />
      {showLabel && (
        <span className={`text-[var(--text-caption)] font-sora font-bold leading-none ${isWishlisted ? 'text-rose-600' : 'text-[var(--ink)]'}`}>
          {isWishlisted ? 'Disukai' : 'Suka'}
        </span>
      )}
    </button>
  )
}

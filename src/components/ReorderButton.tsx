// @ts-nocheck
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { reorderItems } from '@/lib/actions/orders'
import { RotateCcw, Loader2 } from 'lucide-react'

export default function ReorderButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleReorder = async () => {
    setLoading(true)
    try {
      const res = await reorderItems(orderId)
      if (res.success) {
        router.push('/keranjang')
      } else {
        alert(res.error || 'Gagal menambahkan produk ke keranjang')
      }
    } catch {
      alert('Terjadi kesalahan saat memproses Beli Lagi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleReorder}
      disabled={loading}
      className="press w-full py-3 rounded-[16px] bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white font-sora font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
      <span>Beli Lagi Semua Produk Ini</span>
    </button>
  )
}

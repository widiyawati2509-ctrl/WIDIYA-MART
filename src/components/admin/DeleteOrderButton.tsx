// @ts-nocheck
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteSingleOrder } from '@/lib/actions/orders'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'

interface DeleteOrderButtonProps {
  orderId: string
  orderNumber?: string
  redirectTo?: string
}

export default function DeleteOrderButton({ 
  orderId, 
  orderNumber, 
  redirectTo = '/admin/pesanan' 
}: DeleteOrderButtonProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteSingleOrder(orderId)
      if (res.error) {
        setErrorMsg(res.error)
      } else {
        router.push(redirectTo)
        router.refresh()
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="w-full mt-3 py-2.5 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-sora font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Hapus Riwayat Transaksi Ini</span>
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="card-3d bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[rgba(232,214,205,0.9)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-sora font-bold text-base text-[var(--ink)]">
                Hapus Riwayat Transaksi?
              </h3>
              <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                Pesanan {orderNumber ? `#${orderNumber}` : ''} akan dihapus secara permanen dari sistem toko.
              </p>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg text-center font-medium">
                {errorMsg}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="w-full py-2.5 rounded-xl border border-[var(--line)] text-xs font-sora font-semibold text-[var(--ink-soft)] hover:bg-[var(--paper)] transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-sora font-bold shadow-md inline-flex items-center justify-center gap-1.5 transition-all"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

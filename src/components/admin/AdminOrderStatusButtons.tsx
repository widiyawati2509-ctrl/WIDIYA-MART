'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrderStatus } from '@/lib/actions/orders'
import { Loader2, Check, AlertCircle } from 'lucide-react'

interface StatusOption {
  value: string
  label: string
}

interface AdminOrderStatusButtonsProps {
  orderId: string
  currentStatus: string
  statuses: StatusOption[]
}

export default function AdminOrderStatusButtons({
  orderId,
  currentStatus,
  statuses,
}: AdminOrderStatusButtonsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleStatusChange = (value: string) => {
    if (value === currentStatus || isPending) return

    setErrorMsg(null)
    setSuccessMsg(null)
    setPendingStatus(value)

    startTransition(async () => {
      try {
        const res = await updateOrderStatus(orderId, value)
        if (res?.error) {
          setErrorMsg(res.error)
        } else {
          setSuccessMsg('Status pesanan berhasil diperbarui!')
          router.refresh()
        }
      } catch (err: any) {
        setErrorMsg(err?.message || 'Terjadi gangguan saat memperbarui status')
      } finally {
        setPendingStatus(null)
      }
    })
  }

  return (
    <div className="space-y-2.5">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Gagal Mengubah Status</p>
            <p className="text-[11px] text-rose-800 leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold text-[11px]">{successMsg}</span>
        </div>
      )}

      <div className="space-y-2">
        {statuses.map(({ value, label }) => {
          const isCurrent = currentStatus === value
          const isLoading = isPending && pendingStatus === value

          return (
            <button
              key={value}
              type="button"
              onClick={() => handleStatusChange(value)}
              disabled={isCurrent || isPending}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all flex items-center justify-between ${
                isCurrent
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 cursor-default font-bold shadow-xs'
                  : isLoading
                  ? 'bg-blue-50 border-blue-300 text-blue-800 cursor-wait'
                  : value === 'dibatalkan' || value === 'tidak_diambil'
                  ? 'bg-white hover:bg-rose-50 border-rose-200 text-rose-700 shadow-xs active:scale-[0.98] cursor-pointer'
                  : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-800 shadow-xs active:scale-[0.98] cursor-pointer'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {isCurrent && <Check className="w-4 h-4 text-emerald-600" />}
                <span>{label}</span>
              </span>

              {isLoading && (
                <span className="flex items-center gap-1 text-xs text-blue-700 font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memproses...</span>
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

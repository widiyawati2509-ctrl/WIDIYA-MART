// @ts-nocheck
'use client'

import { useState } from 'react'
import { formatRupiah } from '@/lib/utils'
import { createOrder } from '@/lib/actions/orders'
import { Coins, Check, Sparkles } from 'lucide-react'
import { Card, Button } from '@/components/ui'

interface CheckoutFormClientProps {
  items: any[]
  subtotal: number
  loyaltySummary: {
    totalPoints: number
    redeemValue: number
    config: {
      is_active: boolean
      redeem_rate: number
      max_redeem_percentage: number
    }
  } | null
  children: React.ReactNode // Customer details fields
}

export default function CheckoutFormClient({
  items,
  subtotal,
  loyaltySummary,
  children,
}: CheckoutFormClientProps) {
  const config = loyaltySummary?.config
  const availablePoints = loyaltySummary?.totalPoints ?? 0
  const canUseLoyalty = config?.is_active && availablePoints > 0

  // Calculate max points allowed for this subtotal
  const maxDiscountAllowed = Math.floor(subtotal * ((config?.max_redeem_percentage ?? 50) / 100))
  const redeemRate = config?.redeem_rate ?? 100
  const maxPointsNeeded = Math.ceil(maxDiscountAllowed / redeemRate)
  const maxRedeemablePoints = Math.min(availablePoints, maxPointsNeeded)

  const [usePoints, setUsePoints] = useState(false)

  const pointsToUse = usePoints ? maxRedeemablePoints : 0
  const discountAmount = pointsToUse * redeemRate
  const finalTotal = Math.max(0, subtotal - discountAmount)

  return (
    <form action={createOrder} className="space-y-3.5 px-4">
      {children}

      {/* Loyalty Points Redemption Toggle */}
      {canUseLoyalty && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Coins size={16} />
              </span>
              <div>
                <h3 className="font-sora font-bold text-xs text-[var(--ink)] flex items-center gap-1">
                  <span>Tukar Poin Toko</span>
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {availablePoints} Poin
                  </span>
                </h3>
                <p className="text-[10.5px] text-[var(--ink-soft)] font-medium">
                  {usePoints
                    ? `Hemat ${formatRupiah(discountAmount)} (${pointsToUse} poin)`
                    : `Tukarkan poin jadi diskon hingga ${formatRupiah(maxRedeemablePoints * redeemRate)}`}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={usePoints}
                onChange={(e) => setUsePoints(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <input
            type="hidden"
            name="poin_digunakan"
            value={pointsToUse}
          />
        </Card>
      )}

      {/* Ringkasan Belanja (Struk Nota Dashed) */}
      <Card>
        <h2 className="font-sora font-bold text-sm text-[var(--ink)] mb-3">Ringkasan Belanja</h2>
        <div className="space-y-2 text-xs mb-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between py-1">
              <span className="text-[var(--ink-soft)] line-clamp-1 pr-2 font-medium">
                {item.products?.nama} × {item.qty}
              </span>
              <span className="font-bold text-[var(--ink)] tabular-nums shrink-0 font-sora">
                {formatRupiah((item.products?.harga ?? 0) * item.qty)}
              </span>
            </div>
          ))}
        </div>

        {discountAmount > 0 && (
          <div className="pt-2 border-t border-[var(--line)] flex justify-between items-center text-xs text-emerald-700 font-semibold">
            <span className="flex items-center gap-1">
              <Sparkles size={12} /> Diskon Poin ({pointsToUse} poin)
            </span>
            <span className="tabular-nums font-sora">-{formatRupiah(discountAmount)}</span>
          </div>
        )}

        <div className="receipt-dashed pt-3 flex justify-between items-center text-sm font-bold text-[var(--ink)]">
          <span className="font-sora">Total Tagihan (COD)</span>
          <span className="font-sora font-bold text-[var(--accent-2)] text-xl tabular-nums">
            {formatRupiah(finalTotal)}
          </span>
        </div>
      </Card>

      <Button
        type="submit"
        variant="primary"
        className="w-full py-3.5 rounded-[16px] text-base checkout-btn"
      >
        Buat Pesanan — {formatRupiah(finalTotal)}
      </Button>
    </form>
  )
}

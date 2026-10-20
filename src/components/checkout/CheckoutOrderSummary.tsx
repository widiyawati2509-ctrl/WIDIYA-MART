// @ts-nocheck
'use client'

import React from 'react'
import { Card } from '@/components/ui'
import { formatRupiah } from '@/lib/utils'
import { Truck, TicketPercent, Sparkles } from 'lucide-react'

interface CheckoutOrderSummaryProps {
  items: any[]
  subtotal: number
  metodePengiriman: string
  selectedDusun: any
  ongkir: number
  couponDiscount: number
  appliedCoupon: any
  discountAmount: number
  pointsToUse: number
  finalTotal: number
}

export function CheckoutOrderSummary({
  items,
  subtotal,
  metodePengiriman,
  selectedDusun,
  ongkir,
  couponDiscount,
  appliedCoupon,
  discountAmount,
  pointsToUse,
  finalTotal,
}: CheckoutOrderSummaryProps) {
  return (
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

      {/* Subtotal */}
      <div className="pt-2 border-t border-[var(--line)] flex justify-between items-center text-xs text-[var(--ink-soft)]">
        <span>Subtotal Produk</span>
        <span className="tabular-nums font-semibold font-sora text-[var(--ink)]">
          {formatRupiah(subtotal)}
        </span>
      </div>

      {/* Ongkir Breakdown */}
      <div className="pt-1.5 flex justify-between items-center text-xs">
        <span className="text-[var(--ink-soft)] flex items-center gap-1">
          <Truck size={12} className="text-[var(--accent)]" />
          Biaya Pengiriman
          {metodePengiriman === 'antar_alamat' && selectedDusun && (
            <span className="text-[var(--text-caption)] text-[var(--ink-soft)]">
              ({selectedDusun.nama.split('(')[0].trim()})
            </span>
          )}
        </span>
        <span
          className={`tabular-nums font-bold font-sora ${
            ongkir === 0 ? 'text-emerald-700' : 'text-[var(--ink)]'
          }`}
        >
          {metodePengiriman === 'ambil_di_toko' ? (
            <span className="text-emerald-700 font-bold">Gratis (Ambil Toko)</span>
          ) : ongkir === 0 ? (
            <span className="text-emerald-700 font-bold">Gratis Ongkir</span>
          ) : (
            formatRupiah(ongkir)
          )}
        </span>
      </div>

      {/* Voucher Discount */}
      {couponDiscount > 0 && (
        <div className="pt-1.5 flex justify-between items-center text-xs text-emerald-700 font-semibold">
          <span className="flex items-center gap-1">
            <TicketPercent size={12} /> Voucher ({appliedCoupon?.kode})
          </span>
          <span className="tabular-nums font-sora">-{formatRupiah(couponDiscount)}</span>
        </div>
      )}

      {/* Loyalty Points Discount */}
      {discountAmount > 0 && (
        <div className="pt-1.5 flex justify-between items-center text-xs text-emerald-700 font-semibold">
          <span className="flex items-center gap-1">
            <Sparkles size={12} /> Diskon Poin ({pointsToUse} poin)
          </span>
          <span className="tabular-nums font-sora">-{formatRupiah(discountAmount)}</span>
        </div>
      )}

      {/* Total COD */}
      <div className="receipt-dashed pt-3 mt-2 flex justify-between items-center text-sm font-bold text-[var(--ink)]">
        <span className="font-sora">Total Tagihan (COD)</span>
        <span className="font-sora font-bold text-[var(--accent-2)] text-xl tabular-nums">
          {formatRupiah(finalTotal)}
        </span>
      </div>
    </Card>
  )
}

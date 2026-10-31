// @ts-nocheck
'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui'
import { formatRupiah } from '@/lib/utils'
import { Truck, TicketPercent, Sparkles, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react'

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
  // If items > 2, collapse by default to save vertical space; otherwise show
  const [showItems, setShowItems] = useState(items.length <= 2)

  return (
    <Card className="space-y-3">
      {/* Header with toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-orange-50 text-[var(--accent-2)] flex items-center justify-center font-bold">
            <ShoppingBag size={15} />
          </div>
          <div>
            <h2 className="font-sora font-bold text-xs text-[var(--ink)]">Rincian Belanja</h2>
            <p className="text-[10.5px] text-[var(--ink-soft)] font-medium">
              {items.length} macam produk
            </p>
          </div>
        </div>

        {items.length > 2 && (
          <button
            type="button"
            onClick={() => setShowItems(!showItems)}
            className="text-[11px] font-sora font-semibold text-[var(--accent-2)] hover:underline flex items-center gap-1"
          >
            <span>{showItems ? 'Sembunyikan' : 'Lihat Produk'}</span>
            {showItems ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {/* Item List (Accordion / Collapsible) */}
      {showItems && (
        <div className="space-y-1.5 text-xs max-h-56 overflow-y-auto pr-1 animate-in fade-in duration-200">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-1">
              <span className="text-[var(--ink-soft)] line-clamp-1 pr-2 font-medium">
                {item.products?.nama} <strong className="text-[var(--ink)]">× {item.qty}</strong>
              </span>
              <span className="font-bold text-[var(--ink)] tabular-nums shrink-0 font-sora">
                {formatRupiah((item.products?.harga ?? 0) * item.qty)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Summary Breakdown */}
      <div className="space-y-1.5 pt-1 text-xs">
        {/* Subtotal */}
        <div className="flex justify-between items-center text-[var(--ink-soft)]">
          <span>Subtotal Produk ({items.length} item)</span>
          <span className="tabular-nums font-semibold font-sora text-[var(--ink)]">
            {formatRupiah(subtotal)}
          </span>
        </div>

        {/* Ongkir Breakdown */}
        <div className="flex justify-between items-center">
          <span className="text-[var(--ink-soft)] flex items-center gap-1">
            <Truck size={13} className="text-[var(--accent)]" />
            Biaya Pengiriman
            {metodePengiriman === 'antar_alamat' && selectedDusun && (
              <span className="text-[10px] text-[var(--ink-soft)]">
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
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                Gratis (Ambil Toko)
              </span>
            ) : ongkir === 0 ? (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                Gratis Ongkir
              </span>
            ) : (
              formatRupiah(ongkir)
            )}
          </span>
        </div>

        {/* Voucher Discount */}
        {couponDiscount > 0 && (
          <div className="flex justify-between items-center text-emerald-700 font-semibold">
            <span className="flex items-center gap-1">
              <TicketPercent size={13} /> Diskon Kupon ({appliedCoupon?.kode})
            </span>
            <span className="tabular-nums font-sora">-{formatRupiah(couponDiscount)}</span>
          </div>
        )}

        {/* Loyalty Points Discount */}
        {discountAmount > 0 && (
          <div className="flex justify-between items-center text-emerald-700 font-semibold">
            <span className="flex items-center gap-1">
              <Sparkles size={13} /> Diskon Poin ({pointsToUse} poin)
            </span>
            <span className="tabular-nums font-sora">-{formatRupiah(discountAmount)}</span>
          </div>
        )}
      </div>

      {/* Total COD */}
      <div className="receipt-dashed pt-2.5 mt-2 flex justify-between items-center">
        <div>
          <span className="font-sora font-bold text-xs text-[var(--ink)] block">
            Total Tagihan (COD)
          </span>
          <span className="text-[10px] text-[var(--ink-soft)]">Bayar tunai / QRIS saat terima</span>
        </div>
        <span className="font-sora font-extrabold text-[var(--accent-2)] text-lg tabular-nums">
          {formatRupiah(finalTotal)}
        </span>
      </div>
    </Card>
  )
}

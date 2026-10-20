// @ts-nocheck
'use client'

import React from 'react'
import { TicketPercent, X } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

interface CheckoutVoucherModalProps {
  isOpen: boolean
  onClose: () => void
  availableCoupons: any[]
  appliedCoupon: any
  subtotal: number
  onApplyCoupon: (code: string) => void
}

export function CheckoutVoucherModal({
  isOpen,
  onClose,
  availableCoupons,
  appliedCoupon,
  subtotal,
  onApplyCoupon,
}: CheckoutVoucherModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[var(--line)] rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[var(--accent-2)] flex items-center justify-center">
              <TicketPercent size={18} />
            </div>
            <div>
              <h3 className="font-sora font-bold text-sm text-[var(--ink)]">Kupon Diskon Toko</h3>
              <p className="text-[10px] text-[var(--ink-soft)] font-medium">Pilih kupon untuk hemat belanja</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full text-[var(--ink-soft)] hover:bg-[var(--paper)] flex items-center justify-center"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-0.5">
          {availableCoupons.map((coupon) => {
            const isSelected = appliedCoupon?.id === coupon.id
            const isEligible = subtotal >= coupon.min_belanja

            return (
              <div
                key={coupon.id}
                className={`p-3 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/60'
                    : isEligible
                    ? 'border-[rgba(232,214,205,0.9)] bg-white hover:border-[var(--accent)]'
                    : 'border-gray-200 bg-gray-50/70 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-[var(--accent-bg)] text-[var(--accent-2)] font-sora font-extrabold text-xs">
                        {coupon.kode}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                        {coupon.tipe === 'flat'
                          ? `Diskon ${formatRupiah(coupon.nilai)}`
                          : `Diskon ${coupon.nilai}%`}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[var(--ink)] mt-1">{coupon.judul}</p>
                    <p className="text-[10px] text-[var(--ink-soft)] mt-0.5">{coupon.deskripsi}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onApplyCoupon(coupon.kode)}
                    disabled={!isEligible}
                    className={`press px-3 py-1.5 rounded-xl text-xs font-sora font-bold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : isEligible
                        ? 'bg-[var(--accent)] text-white shadow-xs'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isSelected ? 'Terpasang' : 'Gunakan'}
                  </button>
                </div>

                {!isEligible && (
                  <p className="text-[10px] text-rose-600 mt-1.5 font-medium">
                    *Minimal belanja {formatRupiah(coupon.min_belanja)} (kurang {formatRupiah(coupon.min_belanja - subtotal)})
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-[rgba(232,214,205,0.9)] text-xs font-sora font-bold text-[var(--ink)] hover:bg-[var(--paper)]"
        >
          Tutup
        </button>
      </div>
    </div>
  )
}

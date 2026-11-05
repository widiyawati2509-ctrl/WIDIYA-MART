// @ts-nocheck
'use client'

import React, { useState } from 'react'
import { TicketPercent, X, Check, Loader2 } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

interface CheckoutVoucherModalProps {
  isOpen: boolean
  onClose: () => void
  availableCoupons: any[]
  appliedCoupon: any
  subtotal: number
  onApplyCoupon: (code: string) => Promise<void> | void
}

export function CheckoutVoucherModal({
  isOpen,
  onClose,
  availableCoupons,
  appliedCoupon,
  subtotal,
  onApplyCoupon,
}: CheckoutVoucherModalProps) {
  const [manualCode, setManualCode] = useState('')
  const [isApplying, setIsApplying] = useState(false)

  if (!isOpen) return null

  const handleManualApply = async () => {
    if (!manualCode.trim()) return
    setIsApplying(true)
    try {
      await onApplyCoupon(manualCode.trim().toUpperCase())
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="voucher-modal-title"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white border border-[var(--line)] rounded-2xl w-full max-w-sm p-4 shadow-2xl space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]/60">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-orange-100 text-[var(--accent-2)] flex items-center justify-center font-bold" aria-hidden="true">
              <TicketPercent size={18} />
            </div>
            <div>
              <h3 id="voucher-modal-title" className="font-sora font-bold text-sm text-[var(--ink)]">Voucher & Kupon Promo</h3>
              <p className="text-[10px] text-[var(--ink-soft)] font-medium">Gunakan kupon untuk potongan harga</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup modal voucher"
            onClick={onClose}
            className="size-7 rounded-full text-[var(--ink-soft)] hover:bg-[var(--paper)] flex items-center justify-center"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>

        {/* Manual Coupon Input Box */}
        <div className="flex gap-2">
          <input
            type="text"
            aria-label="Masukkan kode kupon promo"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            placeholder="Ketik kode kupon (mis: HEMAT)"
            className="flex-1 text-xs px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--paper)]/50 uppercase font-sora font-bold text-[var(--ink)] placeholder:normal-case placeholder:font-normal outline-none focus:border-[var(--accent)]"
          />
          <button
            type="button"
            onClick={handleManualApply}
            disabled={isApplying || !manualCode.trim()}
            className="press px-3.5 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-sora font-bold hover:bg-[var(--accent-2)] disabled:opacity-50 transition-colors shrink-0 flex items-center gap-1"
          >
            {isApplying ? <Loader2 size={13} className="animate-spin" /> : 'Pakai'}
          </button>
        </div>

        {/* Available Coupons List */}
        <div className="space-y-2">
          <p className="text-[10.5px] font-sora font-bold text-[var(--ink-soft)] px-0.5">
            Pilihan Kupon Toko:
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
            {availableCoupons.length === 0 ? (
              <div className="text-center py-6 text-xs text-[var(--ink-soft)]">
                Belum ada kupon promo yang tersedia saat ini.
              </div>
            ) : (
              availableCoupons.map((coupon) => {
                const isSelected = appliedCoupon?.id === coupon.id
                const isEligible = subtotal >= coupon.min_belanja

                return (
                  <div
                    key={coupon.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                        : isEligible
                        ? 'border-[var(--line)] bg-white hover:border-[var(--accent)]/60'
                        : 'border-gray-200 bg-gray-50/70 opacity-65'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-[var(--accent-bg)] text-[var(--accent-2)] font-sora font-extrabold text-xs">
                            {coupon.kode}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            {coupon.tipe === 'flat'
                              ? `Potongan ${formatRupiah(coupon.nilai)}`
                              : `Diskon ${coupon.nilai}%`}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[var(--ink)] mt-1 truncate">{coupon.judul}</p>
                        <p className="text-[10px] text-[var(--ink-soft)] mt-0.5">
                          Min. belanja {formatRupiah(coupon.min_belanja)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onApplyCoupon(coupon.kode)}
                        disabled={!isEligible}
                        className={`press px-3 py-1.5 rounded-xl text-xs font-sora font-bold transition-all shrink-0 ${
                          isSelected
                            ? 'bg-emerald-600 text-white flex items-center gap-1'
                            : isEligible
                            ? 'bg-[var(--accent)] text-white shadow-xs'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check size={12} />
                            <span>Dipakai</span>
                          </>
                        ) : (
                          'Gunakan'
                        )}
                      </button>
                    </div>

                    {!isEligible && (
                      <p className="text-[10px] text-rose-600 mt-1 font-medium">
                        *Kurang {formatRupiah(coupon.min_belanja - subtotal)} untuk memakai kupon ini
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-[var(--line)] text-xs font-sora font-bold text-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
        >
          Selesai
        </button>
      </div>
    </div>
  )
}

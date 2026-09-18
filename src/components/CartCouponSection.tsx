// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Ticket, CheckCircle2, AlertCircle, ArrowRight, Loader2, X, Tag } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { validateCoupon, getAvailableCoupons } from '@/lib/actions/coupons'
import type { Coupon } from '@/types/database'
import { Card } from '@/components/ui'

interface CartCouponSectionProps {
  subtotal: number
  itemCount: number
}

export default function CartCouponSection({ subtotal, itemCount }: CartCouponSectionProps) {
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([])
  const [showVoucherList, setShowVoucherList] = useState(false)

  useEffect(() => {
    getAvailableCoupons().then((list) => {
      setAvailableCoupons(list || [])
    })
  }, [])

  const handleApply = async (codeToUse?: string) => {
    const code = (codeToUse || couponCode).trim()
    if (!code) {
      setFeedback({ type: 'error', text: 'Masukkan kode voucher terlebih dahulu' })
      return
    }

    setIsLoading(true)
    setFeedback(null)

    try {
      const res = await validateCoupon(code, subtotal)
      if (res.valid && res.coupon) {
        setAppliedCoupon(res.coupon)
        setDiscountAmount(res.discountAmount || 0)
        setFeedback({
          type: 'success',
          text: `Voucher "${res.coupon.kode}" diterapkan! Hemat ${formatRupiah(res.discountAmount || 0)}`,
        })
        setShowVoucherList(false)
      } else {
        setFeedback({
          type: 'error',
          text: res.error || 'Kode voucher tidak valid atau syarat belum terpenuhi',
        })
      }
    } catch {
      setFeedback({ type: 'error', text: 'Gagal memvalidasi kupon' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = () => {
    setAppliedCoupon(null)
    setDiscountAmount(0)
    setFeedback(null)
    setCouponCode('')
  }

  const finalTotal = Math.max(0, subtotal - discountAmount)
  const checkoutHref = appliedCoupon
    ? `/checkout?coupon=${encodeURIComponent(appliedCoupon.kode)}`
    : '/checkout'

  return (
    <div className="space-y-3 mb-6">
      {/* Voucher Input Box */}
      <div className="p-3.5 rounded-2xl bg-orange-50/90 border border-orange-200/90 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center text-sm font-bold">
              <Ticket size={16} />
            </span>
            <div>
              <p className="font-sora font-bold text-xs text-orange-950">Voucher Diskon Belanja</p>
              <p className="text-[10.5px] text-orange-800 font-medium">Gunakan kupon untuk potongan harga</p>
            </div>
          </div>

          {availableCoupons.length > 0 && !appliedCoupon && (
            <button
              type="button"
              onClick={() => setShowVoucherList(!showVoucherList)}
              className="text-[11px] font-sora font-bold text-[var(--accent-2)] hover:underline flex items-center gap-1"
            >
              <span>{showVoucherList ? 'Tutup Kupon' : 'Pilih Kupon'}</span>
              <Tag size={12} />
            </button>
          )}
        </div>

        {/* Applied Coupon Banner */}
        {appliedCoupon ? (
          <div className="p-2.5 rounded-xl bg-white border border-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-sora font-bold text-emerald-800 truncate">
                  {appliedCoupon.kode} (-{formatRupiah(discountAmount)})
                </p>
                <p className="text-[10px] text-emerald-700 truncate">{appliedCoupon.judul}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
              aria-label="Hapus kupon"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Masukkan kode kupon (mis: PENGENJEK5K)"
                className="w-full px-3 py-2 text-xs font-sora font-semibold bg-white border border-orange-200 rounded-xl uppercase tracking-wider placeholder:normal-case placeholder:font-normal placeholder:text-zinc-400 outline-none focus:border-[var(--accent)]"
              />
            </div>
            <button
              type="button"
              onClick={() => handleApply()}
              disabled={isLoading || !couponCode.trim()}
              className="press px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-2)] disabled:opacity-50 text-white text-xs font-sora font-bold rounded-xl flex items-center gap-1 shrink-0 transition-all shadow-xs"
            >
              {isLoading ? <Loader2 size={13} className="animate-spin" /> : null}
              <span>Pakai</span>
            </button>
          </div>
        )}

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`text-[11px] font-medium flex items-center gap-1.5 pt-0.5 ${
              feedback.type === 'success' ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Available Vouchers Dropdown */}
        {showVoucherList && !appliedCoupon && availableCoupons.length > 0 && (
          <div className="pt-2 border-t border-orange-200/70 space-y-1.5 animate-in fade-in duration-200">
            <p className="text-[10.5px] font-sora font-bold text-orange-900">Kupon Tersedia:</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {availableCoupons.map((c) => {
                const isEligible = subtotal >= c.min_belanja
                return (
                  <div
                    key={c.id}
                    className={`p-2 rounded-xl bg-white border flex items-center justify-between text-xs transition-all ${
                      isEligible
                        ? 'border-orange-200 hover:border-orange-400'
                        : 'border-zinc-200 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-sora font-extrabold text-[var(--accent)]">{c.kode}</span>
                        <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-1.5 py-0.2 rounded">
                          {c.tipe === 'persen' ? `${c.nilai}% OFF` : `Potongan ${formatRupiah(c.nilai)}`}
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--ink-soft)] mt-0.5">
                        Min. belanja {formatRupiah(c.min_belanja)}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={!isEligible}
                      onClick={() => handleApply(c.kode)}
                      className="press px-2.5 py-1 text-[11px] font-sora font-bold rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-2)] disabled:bg-zinc-200 disabled:text-zinc-400"
                    >
                      Gunakan
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Receipt Summary Card */}
      <Card className="border border-[rgba(232,214,205,0.9)]">
        <div className="flex justify-between items-center text-sm font-semibold text-[var(--ink)] mb-1.5">
          <span>Subtotal ({itemCount} item)</span>
          <span className="font-sora font-bold text-[var(--ink)] tabular-nums">
            {formatRupiah(subtotal)}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between items-center text-xs font-semibold text-emerald-700 mb-1.5">
            <span>Diskon Kupon ({appliedCoupon?.kode})</span>
            <span className="font-sora font-bold tabular-nums">
              -{formatRupiah(discountAmount)}
            </span>
          </div>
        )}

        <div className="receipt-dashed pt-2.5 mt-2 flex justify-between items-center">
          <span className="font-sora font-bold text-[var(--ink)] text-base">Total Tagihan</span>
          <span className="font-sora font-bold text-[var(--accent-2)] text-xl tabular-nums">
            {formatRupiah(finalTotal)}
          </span>
        </div>
        <p className="text-[var(--text-caption)] text-[var(--ink-soft)] mt-2 font-medium">
          *Pembayaran tunai / QRIS (COD) saat barang tiba atau diambil
        </p>
      </Card>

      {/* Checkout floating button */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 max-w-[480px] w-full px-4 z-40">
        <Link
          href={checkoutHref}
          prefetch={true}
          className="w-full flex items-center justify-between checkout-btn py-3.5 px-5 text-base shadow-lg"
        >
          <span className="font-sora font-bold">Checkout ({itemCount} item)</span>
          <div className="flex items-center gap-1.5 tabular-nums font-sora font-bold">
            <span>{formatRupiah(finalTotal)}</span>
            <ArrowRight size={18} />
          </div>
        </Link>
      </div>
    </div>
  )
}

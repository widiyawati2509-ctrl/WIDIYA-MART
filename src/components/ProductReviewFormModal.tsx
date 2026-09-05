'use client'

import { useState, useTransition } from 'react'
import { Star, MessageSquare, Loader2, X, Check } from 'lucide-react'
import { submitProductReview } from '@/lib/actions/reviews'

interface ProductReviewFormModalProps {
  productId: string
  productName: string
  orderId: string
}

export default function ProductReviewFormModal({
  productId,
  productName,
  orderId,
}: ProductReviewFormModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [ulasan, setUlasan] = useState('')
  const [isPending, startTransition] = useTransition()
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMsg(null)

    startTransition(async () => {
      const res = await submitProductReview({
        productId,
        orderId,
        rating,
        ulasan,
      })

      if (res?.error) {
        setStatusMsg({ type: 'error', text: res.error })
      } else {
        setStatusMsg({ type: 'success', text: 'Ulasan Anda berhasil disimpan. Terima kasih!' })
        setHasSubmitted(true)
        setTimeout(() => {
          setIsOpen(false)
        }, 1500)
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-[var(--text-caption)] font-sora font-bold text-[var(--warning)] bg-[var(--warning)]/10 hover:bg-[var(--warning)]/20 border border-[var(--warning)]/30 px-2.5 py-1 rounded-full active:scale-95 transition-all"
      >
        <Star className="w-3 h-3 fill-[var(--warning)] text-[var(--warning)]" />
        <span>{hasSubmitted ? 'Ulas Lagi' : 'Beri Ulasan'}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[var(--line)] rounded-[var(--radius-xl)] max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-sora font-bold text-base text-[var(--ink)]">Beri Ulasan Produk</h3>
                <p className="text-xs text-[var(--ink-soft)] font-medium line-clamp-1 mt-0.5">
                  {productName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-[var(--paper)] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating Selector */}
              <div className="text-center py-2 bg-[var(--warning)]/5 rounded-2xl border border-[var(--warning)]/20">
                <p className="text-xs font-sora font-semibold text-[var(--ink-soft)] mb-1.5">
                  Berapa bintang untuk produk ini?
                </p>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none transition-transform active:scale-125 hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={`transition-colors ${
                          star <= (hoverRating ?? rating)
                            ? 'fill-[var(--warning)] text-[var(--warning)]'
                            : 'text-[var(--line)]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs font-sora font-bold text-[var(--warning)] mt-1">
                  {rating === 5 && 'Sangat Puas ⭐⭐⭐⭐⭐'}
                  {rating === 4 && 'Puas ⭐⭐⭐⭐'}
                  {rating === 3 && 'Cukup Puas ⭐⭐⭐'}
                  {rating === 2 && 'Kurang Puas ⭐⭐'}
                  {rating === 1 && 'Kecewa ⭐'}
                </p>
              </div>

              {/* Text review */}
              <div className="space-y-1">
                <label htmlFor="ulasan" className="text-xs font-sora font-bold text-[var(--ink)]">
                  Tulis Ulasan (opsional)
                </label>
                <textarea
                  id="ulasan"
                  rows={3}
                  value={ulasan}
                  onChange={(e) => setUlasan(e.target.value)}
                  placeholder="Ceritakan pengalaman Anda memakai produk ini..."
                  className="w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-3.5 py-2.5 text-xs text-[var(--ink)] placeholder:text-[var(--ink-soft)] shadow-xs outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 resize-none"
                />
              </div>

              {statusMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                    statusMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20'
                  }`}
                >
                  {statusMsg.type === 'success' ? (
                    <Check size={14} className="shrink-0 text-emerald-600" />
                  ) : null}
                  <span>{statusMsg.text}</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--line)] text-xs font-sora font-bold text-[var(--ink-soft)] hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-sora font-bold shadow-xs hover:brightness-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Kirim Ulasan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { Star, MessageSquare, CheckCircle } from 'lucide-react'

interface ReviewItem {
  id: string
  rating: number
  ulasan: string | null
  nama_reviewer: string
  created_at: string
  order_id?: string | null
}

interface ProductReviewsSectionProps {
  reviews: ReviewItem[]
}

function formatReviewDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export default function ProductReviewsSection({ reviews }: ProductReviewsSectionProps) {
  const total = reviews.length
  const avg =
    total > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)
      : '0.0'

  return (
    <div className="mx-4 mt-4 card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] p-4 shadow-3d">
      <div className="flex items-center justify-between mb-3 border-b border-[var(--line)] pb-3">
        <div>
          <h2 className="font-sora font-bold text-sm text-[var(--ink)] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[var(--accent)]" />
            Ulasan Pembeli
          </h2>
          <p className="text-[var(--text-caption)] text-[var(--ink-soft)] font-medium mt-0.5">
            Penilaian dari pelanggan yang telah berbelanja
          </p>
        </div>

        {total > 0 && (
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Star className="w-4 h-4 fill-[var(--warning)] text-[var(--warning)]" />
              <span className="font-sora font-extrabold text-sm text-[var(--ink)]">{avg}</span>
              <span className="text-[var(--text-caption)] text-[var(--ink-soft)] font-medium">/ 5</span>
            </div>
            <span className="text-[var(--text-caption)] text-[var(--ink-soft)] font-medium">
              ({total} ulasan)
            </span>
          </div>
        )}
      </div>

      {total === 0 ? (
        <div className="py-6 text-center">
          <div className="w-10 h-10 rounded-full bg-[var(--warning)]/10 text-[var(--warning)] flex items-center justify-center mx-auto mb-2">
            <Star className="w-5 h-5 fill-[var(--warning)]/30 text-[var(--warning)]" />
          </div>
          <p className="text-xs font-sora font-bold text-[var(--ink)]">Belum Ada Ulasan</p>
          <p className="text-[var(--text-caption)] text-[var(--ink-soft)] max-w-[240px] mx-auto mt-0.5">
            Beli produk ini dan jadilah yang pertama memberikan ulasan serta rating!
          </p>
        </div>
      ) : (
        <div className="space-y-3 divide-y divide-[var(--line)]/60">
          {reviews.map((rev) => (
            <div key={rev.id} className="pt-3 first:pt-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-sora font-bold text-xs text-[var(--ink)]">
                    {rev.nama_reviewer}
                  </span>
                  {rev.order_id && (
                    <span className="inline-flex items-center gap-0.5 text-[var(--text-caption)] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle className="w-2.5 h-2.5" /> Pembeli Terverifikasi
                    </span>
                  )}
                </div>
                <span className="text-[var(--text-caption)] text-[var(--ink-soft)] font-medium">
                  {formatReviewDate(rev.created_at)}
                </span>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    className={
                      star <= rev.rating
                        ? 'fill-[var(--warning)] text-[var(--warning)]'
                        : 'text-[var(--line)]'
                    }
                  />
                ))}
              </div>

              {rev.ulasan && (
                <p className="text-xs text-[var(--ink-soft)] leading-relaxed font-normal">
                  {rev.ulasan}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

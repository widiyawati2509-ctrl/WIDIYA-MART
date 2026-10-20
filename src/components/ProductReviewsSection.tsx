// @ts-nocheck
'use client'

import React from 'react'
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

export default function ProductReviewsSection({ reviews = [] }: ProductReviewsSectionProps) {
  const total = reviews.length
  const avg =
    total > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)
      : '0.0'

  return (
    <div className="mx-4 mt-2.5 bg-white border border-[var(--line)] rounded-2xl p-3.5 shadow-xs">
      {/* Header Ringkas */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--line)]/60">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-[var(--accent)]" />
          <h2 className="font-sora font-bold text-xs text-[var(--ink)]">Ulasan Pembeli</h2>
          {total > 0 && (
            <span className="text-[11px] text-[var(--ink-soft)] font-medium">({total})</span>
          )}
        </div>

        {total > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-[var(--warning)] text-[var(--warning)]" />
            <span className="font-sora font-extrabold text-xs text-[var(--ink)]">{avg}</span>
            <span className="text-[10px] text-[var(--ink-soft)] font-medium">/ 5</span>
          </div>
        )}
      </div>

      {/* Konten Ulasan: Ringkas & Konsisten */}
      {total === 0 ? (
        <div className="py-2.5 px-3 bg-[var(--paper)] rounded-xl border border-[var(--line)]/50 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[var(--ink)] leading-tight">Belum Ada Ulasan</p>
            <p className="text-[11px] text-[var(--ink-soft)] truncate">Jadilah yang pertama memberikan ulasan & rating</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 divide-y divide-[var(--line)]/50">
          {reviews.map((rev) => (
            <div key={rev.id} className="pt-2.5 first:pt-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-sora font-bold text-xs text-[var(--ink)]">
                    {rev.nama_reviewer}
                  </span>
                  {rev.order_id && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle className="w-2.5 h-2.5" /> Terverifikasi
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[var(--ink-soft)] font-medium">
                  {formatReviewDate(rev.created_at)}
                </span>
              </div>

              {/* Bintang Rating */}
              <div className="flex items-center gap-0.5 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={11}
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

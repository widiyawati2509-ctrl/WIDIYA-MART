// @ts-nocheck
'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App Error Boundary caught:', error)
  }, [error])

  const handleHardRefresh = () => {
    try {
      reset()
    } catch {}
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-3 shadow-xs">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h2 className="text-lg font-sora font-extrabold text-[var(--ink)] mb-1">Terjadi Kesalahan</h2>
      <p className="text-xs text-[var(--ink-soft)] max-w-xs mb-6">
        Gagal memuat halaman. Silakan coba muat ulang atau kembali ke beranda toko.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-xs">
        <button
          type="button"
          onClick={handleHardRefresh}
          className="press w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-sora font-bold px-5 py-2.5 rounded-xl transition-colors shadow-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Coba Lagi</span>
        </button>

        <button
          type="button"
          onClick={handleGoHome}
          className="press w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] text-xs font-sora font-bold px-5 py-2.5 rounded-xl transition-colors shadow-2xs"
        >
          <Home className="w-4 h-4 text-[var(--accent)]" />
          <span>Ke Beranda</span>
        </button>
      </div>
    </div>
  )
}

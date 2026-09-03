// @ts-nocheck
'use client'

import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-3">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h2 className="text-lg font-bold text-gray-800 mb-1">Terjadi Kesalahan</h2>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        Gagal memuat halaman. Silakan coba beberapa saat lagi.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors shadow-sm"
      >
        <RotateCcw className="w-4 h-4" />
        Coba Lagi
      </button>
    </div>
  )
}

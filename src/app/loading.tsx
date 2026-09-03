// @ts-nocheck
'use client'

import { ShoppingBag } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center animate-bounce">
        <ShoppingBag className="w-6 h-6" />
      </div>
      <p className="text-sm font-medium text-gray-500">Memuat...</p>
    </div>
  )
}

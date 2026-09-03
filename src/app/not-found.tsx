// @ts-nocheck
import Link from 'next/link'
import { ShoppingBag, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
        <ShoppingBag className="w-8 h-8" />
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        Maaf, produk atau halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>
    </div>
  )
}

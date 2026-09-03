// @ts-nocheck
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <Image
        src="/logo.png"
        alt="Widiya Mart Logo"
        width={72}
        height={72}
        className="rounded-2xl mx-auto mb-4 shadow-sm border border-gray-100"
      />
      <h1 className="text-xl font-bold text-gray-900 mb-1">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        Maaf, produk atau halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
      </p>
      <Link
        href="/"
        className="btn-3d btn-3d-green text-sm px-5 py-2.5 rounded-xl gap-2 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>
    </div>
  )
}

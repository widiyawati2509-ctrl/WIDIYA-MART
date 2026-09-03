// @ts-nocheck
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { buttonClass } from '@/components/ui'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <Image
        src="/logo.png"
        alt="Widiya Mart Logo"
        width={72}
        height={72}
        className="rounded-2xl mx-auto mb-4 shadow-card border border-white/50"
      />
      <h1 className="text-xl font-bold text-ink mb-1.5">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-sm text-muted max-w-xs mb-6">
        Maaf, produk atau halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
      </p>
      <Link
        href="/"
        className={buttonClass({ variant: 'primary', size: 'md' })}
      >
        <ArrowLeft size={16} />
        Kembali ke Beranda
      </Link>
    </div>
  )
}

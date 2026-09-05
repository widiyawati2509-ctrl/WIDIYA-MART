// @ts-nocheck
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { buttonClass } from '@/components/ui'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center max-w-[480px] mx-auto">
      <div className="w-16 h-16 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center mx-auto mb-4 shadow-[0_8px_20px_-2px_rgba(255,107,53,.45),inset_0_1px_0_rgba(255,255,255,.4)]">
        <Image
          src="/logo.png"
          alt="PENGENJEK MART Logo"
          width={54}
          height={54}
          className="rounded-[var(--radius-md)] object-cover"
        />
      </div>
      <h1 className="text-xl font-sora font-bold text-[var(--ink)] mb-1.5">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-xs text-[var(--ink-soft)] max-w-xs mb-6 font-medium">
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

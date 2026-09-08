// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { getUserAddresses } from '@/lib/actions/addresses'
import UserAddressManager from '@/components/UserAddressManager'
import Link from 'next/link'
import { ArrowLeft, MapPin, LogIn } from 'lucide-react'

export const metadata = {
  title: 'Alamat Pengiriman | PENGENJEK MART',
  description: 'Kelola daftar alamat pengiriman belanja Anda di PENGENJEK MART',
}

export default async function AlamatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let addresses = []
  if (user) {
    const res = await getUserAddresses()
    addresses = res.data || []
  }

  return (
    <div className="w-full max-w-[480px] mx-auto min-h-screen pb-28 pt-2">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[rgba(250,240,235,0.92)] backdrop-blur-md px-4 py-3 border-b border-[var(--line)] mb-4 flex items-center gap-3">
        <Link
          href="/"
          className="w-9 h-9 rounded-full bg-white border border-[var(--line)] flex items-center justify-center text-[var(--ink)] shadow-xs hover:bg-[var(--paper)] press"
          title="Kembali ke Beranda"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-sora font-bold text-base text-[var(--ink)] leading-tight">
            Alamat Pengiriman
          </h1>
          <p className="text-[11px] text-[var(--ink-soft)] font-medium">
            Atur alamat pengantaran belanja Anda
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {!user ? (
          <div className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] p-6 text-center shadow-3d space-y-3">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-bg)] text-[var(--accent-2)] flex items-center justify-center mx-auto shadow-thumb-inset">
              <MapPin size={24} />
            </div>
            <h2 className="font-sora font-bold text-sm text-[var(--ink)]">
              Masuk untuk Mengelola Alamat
            </h2>
            <p className="text-xs text-[var(--ink-soft)] leading-relaxed max-w-xs mx-auto">
              Simpan alamat rumah, kantor, atau lokasi lainnya agar proses pemesanan dan perhitungan ongkir lebih cepat.
            </p>
            <Link
              href="/masuk?next=/alamat"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-sora font-bold text-white bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] rounded-full shadow-btn press mt-2"
            >
              <LogIn size={15} />
              <span>Masuk Sekarang</span>
            </Link>
          </div>
        ) : (
          <UserAddressManager initialAddresses={addresses} />
        )}
      </div>
    </div>
  )
}

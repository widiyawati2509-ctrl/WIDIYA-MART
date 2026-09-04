// @ts-nocheck
import Link from 'next/link'
import { ChevronLeft, ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Kebijakan Privasi - Widiya Mart',
  description: 'Kebijakan privasi dan perlindungan data pengguna aplikasi Widiya Mart.',
}

export default function KebijakanPrivasiPage() {
  return (
    <div className="w-full pb-28">
      {/* Top Header */}
      <div className="top-header sticky top-0 z-40 bg-[rgba(250,240,235,0.92)] backdrop-blur-md px-4 py-3.5 flex items-center gap-2 border-b border-[rgba(232,214,205,0.8)] shadow-[0_4px_20px_-2px_rgba(43,24,16,0.06)]">
        <Link href="/" className="press p-1.5 -ml-1 rounded-full hover:bg-[var(--line)]/50 text-[var(--ink)]">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-sora font-bold text-sm text-[var(--ink)]">Kebijakan Privasi</h1>
      </div>

      <div className="p-4 space-y-4 text-xs text-[var(--ink)] leading-relaxed">
        <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-4 shadow-3d space-y-3">
          <div className="flex items-center gap-2 text-[var(--accent-2)] font-sora font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Kebijakan Privasi Widiya Mart</span>
          </div>
          <p className="text-[var(--ink-soft)]">
            Terakhir diperbarui: September 2026
          </p>
          <p>
            Widiya Mart menghormati privasi pengguna dan berkomitmen untuk melindungi data pribadi yang Anda bagikan saat menggunakan aplikasi dan layanan kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.
          </p>
        </div>

        <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-4 shadow-3d space-y-2">
          <h2 className="font-sora font-bold text-xs text-[var(--ink)]">1. Informasi yang Kami Kumpulkan</h2>
          <p className="text-[var(--ink-soft)]">
            Untuk memproses pesanan dan mempermudah layanan belanja ambil di toko, kami mengumpulkan data berikut saat Anda mendaftar atau melakukan pemesanan:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[var(--ink-soft)]">
            <li><strong>Nama Lengkap:</strong> Untuk identifikasi pesanan saat Anda mengambil barang di kasir.</li>
            <li><strong>Nomor WhatsApp / Telepon:</strong> Untuk konfirmasi ketersediaan barang dan status pesanan.</li>
            <li><strong>Alamat Email & Kata Sandi:</strong> Untuk autentikasi login akun secara aman.</li>
            <li><strong>Riwayat Pesanan:</strong> Rincian produk yang Anda pesan dan tanggal transaksi.</li>
          </ul>
        </div>

        <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-4 shadow-3d space-y-2">
          <h2 className="font-sora font-bold text-xs text-[var(--ink)]">2. Penggunaan Informasi</h2>
          <p className="text-[var(--ink-soft)]">
            Informasi yang kami kumpulkan hanya digunakan semata-mata untuk:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[var(--ink-soft)]">
            <li>Memproses, menyiapkan, dan mengemas pesanan Anda di toko.</li>
            <li>Mengirimkan notifikasi status kesiapan pesanan Anda.</li>
            <li>Layanan bantuan pelanggan dan konfirmasi stok produk via WhatsApp.</li>
            <li>Meningkatkan kualitas aplikasi dan pengalaman belanja Anda.</li>
          </ul>
        </div>

        <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-4 shadow-3d space-y-2">
          <h2 className="font-sora font-bold text-xs text-[var(--ink)]">3. Perlindungan & Keamanan Data</h2>
          <p className="text-[var(--ink-soft)]">
            Kami menerapkan standar keamanan enkripsi berbasis cloud (Supabase) untuk menjaga kerahasiaan data Anda. Kami <strong>tidak pernah menjual, menyewakan, atau membagikan</strong> informasi pribadi Anda kepada pihak ketiga mana pun untuk tujuan pemasaran.
          </p>
        </div>

        <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-4 shadow-3d space-y-2">
          <h2 className="font-sora font-bold text-xs text-[var(--ink)]">4. Hak Pengguna & Penghapusan Data</h2>
          <p className="text-[var(--ink-soft)]">
            Anda memiliki hak penuh untuk mengakses, memperbarui profil, atau menghapus riwayat transaksi belanja Anda kapan saja langsung dari menu aplikasi. Jika Anda ingin menghapus seluruh akun dan data pribadi, Anda dapat menghubungi tim kami.
          </p>
        </div>

        <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-4 shadow-3d space-y-2">
          <h2 className="font-sora font-bold text-xs text-[var(--ink)]">5. Kontak Layanan Pelanggan</h2>
          <p className="text-[var(--ink-soft)]">
            Jika Anda memiliki pertanyaan seputar Kebijakan Privasi ini, Anda dapat menghubungi Widiya Mart melalui kontak kasir toko atau WhatsApp yang tertera di aplikasi.
          </p>
        </div>
      </div>
    </div>
  )
}

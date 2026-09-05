// @ts-nocheck
import Image from 'next/image'
import Link from 'next/link'
import { Download, ChevronLeft, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Download Aplikasi Android - TOKO MIRING',
  description: 'Download aplikasi resmi TOKO MIRING untuk HP Android.',
}

export default function UnduhApkPage() {
  return (
    <div className="w-full pb-28">
      {/* Top Header */}
      <div className="top-header sticky top-0 z-40 bg-[rgba(250,240,235,0.92)] backdrop-blur-md px-4 py-3.5 flex items-center gap-2 border-b border-[rgba(232,214,205,0.8)] shadow-[0_4px_20px_-2px_rgba(43,24,16,0.06)]">
        <Link href="/" className="press p-1.5 -ml-1 rounded-full hover:bg-[var(--line)]/50 text-[var(--ink)]">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-sora font-bold text-sm text-[var(--ink)]">Download Aplikasi Android</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* App Hero Card */}
        <div className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-3xl p-6 text-center shadow-3d space-y-4">
          <div className="w-20 h-20 rounded-[22px] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center mx-auto shadow-lg p-1.5">
            <Image
              src="/logo.png"
              alt="TOKO MIRING Icon"
              width={76}
              height={76}
              className="rounded-[18px] object-cover"
              priority
            />
          </div>

          <div>
            <h2 className="font-sora font-bold text-lg text-[var(--ink)]">
              TOKO MIRING
            </h2>
            <p className="text-xs text-[var(--ink-soft)] font-medium mt-0.5">
              Aplikasi Resmi Belanja Sembako &amp; Kebutuhan Harian
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Versi 1.0.3 (Terbaru)
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                Ukuran 4.7 MB
              </span>
            </div>
          </div>

          {/* Download Button */}
          <a
            href="https://github.com/widiyawati2509-ctrl/WIDIYA-MART/raw/main/android/release/TOKO-MIRING.apk"
            download="TOKO-MIRING.apk"
            className="press w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white font-sora font-bold text-sm shadow-btn flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download APK Sekarang (4.7 MB)</span>
          </a>

          <p className="text-[10.5px] text-gray-400 font-medium">
            Kompatibel untuk semua HP Android (Samsung, Xiaomi, Oppo, Vivo, Realme, dll.)
          </p>
        </div>

        {/* Panduan Instalasi Penting */}
        <div className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-2xl p-4 shadow-3d space-y-3">
          <h3 className="font-sora font-bold text-xs text-[var(--ink)] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
            <span>Panduan Jika Download Terhenti / Gagal Pasang:</span>
          </h3>

          <div className="space-y-2.5 text-xs text-[var(--ink)]">
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--paper)]/70">
              <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                1
              </span>
              <div>
                <p className="font-bold text-[11.5px]">Hapus Versi Lama Terlebih Dahulu</p>
                <p className="text-[11px] text-[var(--ink-soft)] mt-0.5">
                  Jika sebelumnya HP Anda sudah terpasang versi aplikasi Widiya Mart lama, silakan <strong>uninstall (hapus)</strong> terlebih dahulu dari layar utama HP agar tidak bentrok.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--paper)]/70">
              <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                2
              </span>
              <div>
                <p className="font-bold text-[11.5px]">Klik "Tetap Download" di Layar Bawah</p>
                <p className="text-[11px] text-[var(--ink-soft)] mt-0.5">
                  Di browser Chrome, saat download mencapai 100% akan muncul pesan <em>"File mungkin berbahaya"</em>. Klik tombol <strong>Tetap download (Download anyway)</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--paper)]/70">
              <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                3
              </span>
              <div>
                <p className="font-bold text-[11.5px]">Buka dari Aplikasi "File Saya / My Files"</p>
                <p className="text-[11px] text-[var(--ink-soft)] mt-0.5">
                  Jika di browser Chrome terlihat stuck, buka aplikasi <strong>File Saya</strong> bawaan HP Anda ➔ buka folder <strong>Download</strong> ➔ klik file <strong>TOKO-MIRING.apk</strong> untuk langsung menginstal.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--paper)]/70">
              <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                4
              </span>
              <div>
                <p className="font-bold text-[11.5px]">Izinkan Sumber Tidak Dikenal</p>
                <p className="text-[11px] text-[var(--ink-soft)] mt-0.5">
                  Jika muncul pop-up izin, pilih <strong>Setelan</strong> ➔ aktifkan centang <strong>"Izinkan dari sumber ini"</strong>, lalu klik <strong>Instal</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

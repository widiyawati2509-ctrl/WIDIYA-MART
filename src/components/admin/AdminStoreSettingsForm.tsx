// @ts-nocheck
'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateStoreInfo } from '@/lib/actions/admin'
import { isStoreOpen, getWitaTime } from '@/lib/utils'
import { StoreInfo } from '@/types/database'
import { 
  Clock, 
  Store, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Zap,
  Truck
} from 'lucide-react'

interface AdminStoreSettingsFormProps {
  store?: StoreInfo | null
}

export default function AdminStoreSettingsForm({ store }: AdminStoreSettingsFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Form states
  const [namaToko, setNamaToko] = useState(store?.nama_toko || 'PENGENJEK MART')
  const [alamatToko, setAlamatToko] = useState(store?.alamat_toko || '')
  const [kota, setKota] = useState(store?.kota || '')
  const [jamBuka, setJamBuka] = useState(store?.jam_buka || '07:00')
  const [jamTutup, setJamTutup] = useState(store?.jam_tutup || '21:00')
  const [jamOperasional, setJamOperasional] = useState(
    store?.jam_operasional || `Setiap Hari, ${store?.jam_buka || '07:00'} – ${store?.jam_tutup || '21:00'} WITA`
  )
  const [noHpToko, setNoHpToko] = useState(store?.no_hp_toko || '')
  const [whatsapp, setWhatsapp] = useState(store?.whatsapp || '')
  const [mapsUrl, setMapsUrl] = useState(store?.maps_url || '')
  const [estimasiMenitPerKm, setEstimasiMenitPerKm] = useState<number>(store?.estimasi_menit_per_km ?? 5)
  const [estimasiMenitTambahan, setEstimasiMenitTambahan] = useState<number>(store?.estimasi_menit_tambahan ?? 15)

  // Live real-time clock state (WITA)
  const [currentWita, setCurrentWita] = useState<{ hours: number; minutes: number; timeString: string }>({
    hours: 12,
    minutes: 0,
    timeString: '12:00',
  })

  // Feedback banner
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Update clock every 5 seconds to keep WITA time synchronized
  useEffect(() => {
    setCurrentWita(getWitaTime())
    const interval = setInterval(() => {
      setCurrentWita(getWitaTime())
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Calculate live preview status
  const previewStatus = isStoreOpen(jamBuka, jamTutup, jamOperasional)

  // Handle Preset Cepat
  const handleApplyPreset = (buka: string, tutup: string) => {
    setJamBuka(buka)
    setJamTutup(tutup)
    setJamOperasional(`Setiap Hari, ${buka} – ${tutup} WITA`)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFeedback(null)

    const formData = new FormData()
    formData.append('nama_toko', namaToko)
    formData.append('alamat_toko', alamatToko)
    formData.append('kota', kota)
    formData.append('jam_buka', jamBuka)
    formData.append('jam_tutup', jamTutup)
    formData.append('jam_operasional', jamOperasional)
    formData.append('no_hp_toko', noHpToko)
    formData.append('whatsapp', whatsapp)
    formData.append('maps_url', mapsUrl)
    formData.append('estimasi_menit_per_km', estimasiMenitPerKm.toString())
    formData.append('estimasi_menit_tambahan', estimasiMenitTambahan.toString())

    startTransition(async () => {
      try {
        const res = await updateStoreInfo(formData)
        if (res.success) {
          setFeedback({
            type: 'success',
            message: 'Pengaturan toko & jam operasional berhasil disimpan ke database!',
          })
          router.refresh()
        } else {
          setFeedback({
            type: 'error',
            message: res.error || 'Gagal menyimpan pengaturan toko',
          })
        }
      } catch (err: any) {
        setFeedback({
          type: 'error',
          message: err?.message || 'Terjadi kesalahan sistem saat menyimpan',
        })
      } finally {
        setTimeout(() => {
          setFeedback((prev) => (prev?.type === 'success' ? null : prev))
        }, 5000)
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs animate-bounce-short ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Live Timezone & Store Status Preview Card */}
      <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-300/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Clock size={16} />
            </span>
            <div>
              <p className="font-sora font-bold text-xs text-[var(--ink)]">
                Waktu Nyata Sekarang: <span className="text-amber-800 font-extrabold">{currentWita.timeString} WITA</span>
              </p>
              <p className="text-[11px] text-[var(--ink-soft)] font-medium">
                Zona Waktu Indonesia Tengah (Lombok / WITA / UTC+8)
              </p>
            </div>
          </div>

          {/* Live Calculated Badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sora font-extrabold border shadow-xs ${
            previewStatus.isOpen
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 ring-2 ring-emerald-400/20'
              : 'bg-rose-100 text-rose-900 border-rose-300 ring-2 ring-rose-400/20'
          }`}>
            <span className={`w-2 h-2 rounded-full ${previewStatus.isOpen ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'}`} />
            <span>{previewStatus.statusText}</span>
            <span className="text-[10px] font-normal opacity-85">({previewStatus.timeRange})</span>
          </div>
        </div>

        <p className="text-[11px] text-amber-950/80 leading-relaxed font-medium bg-white/60 p-2.5 rounded-xl border border-amber-200/60">
          💡 Status di atas adalah simulasi <strong>real-time</strong> yang langsung terlihat oleh pembeli di Beranda, Halaman Detail, dan Checkout berdasarkan jam yang Anda atur di bawah.
        </p>
      </div>

      {/* Main Settings Form */}
      <div className="bg-white border border-[rgba(232,214,205,0.9)] rounded-2xl p-4 shadow-3d">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Nama Toko *
            </label>
            <input
              type="text"
              value={namaToko}
              onChange={(e) => setNamaToko(e.target.value)}
              required
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Alamat Toko *
            </label>
            <textarea
              value={alamatToko}
              onChange={(e) => setAlamatToko(e.target.value)}
              required
              rows={2}
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Kota / Kabupaten *
            </label>
            <input
              type="text"
              value={kota}
              onChange={(e) => setKota(e.target.value)}
              required
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Pengaturan Jam Buka & Tutup */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-sora font-bold text-amber-950 flex items-center gap-1.5">
                <Clock size={14} className="text-amber-700" />
                <span>Jam Buka & Tutup Toko Harian</span>
              </label>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                WITA (UTC+8)
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-gray-600 mr-1">Pilihan Cepat:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset('07:00', '21:00')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-amber-300 hover:bg-amber-100/60 text-amber-900 transition-colors shadow-2xs active:scale-95"
              >
                07:00 – 21:00
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('08:00', '22:00')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-amber-300 hover:bg-amber-100/60 text-amber-900 transition-colors shadow-2xs active:scale-95"
              >
                08:00 – 22:00
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('06:00', '23:00')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-amber-300 hover:bg-amber-100/60 text-amber-900 transition-colors shadow-2xs active:scale-95"
              >
                06:00 – 23:00
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('00:00', '23:59')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-amber-300 hover:bg-amber-100/60 text-amber-900 transition-colors shadow-2xs active:scale-95"
              >
                Buka 24 Jam
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Jam Buka Toko *
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={jamBuka}
                    onChange={(e) => {
                      setJamBuka(e.target.value)
                      setJamOperasional(`Setiap Hari, ${e.target.value} – ${jamTutup} WITA`)
                    }}
                    required
                    className="w-full border bg-white rounded-xl px-3 py-2 text-sm font-sora font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Format 24 jam (mis: 07:00)</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Jam Tutup Toko *
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={jamTutup}
                    onChange={(e) => {
                      setJamTutup(e.target.value)
                      setJamOperasional(`Setiap Hari, ${jamBuka} – ${e.target.value} WITA`)
                    }}
                    required
                    className="w-full border bg-white rounded-xl px-3 py-2 text-sm font-sora font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Format 24 jam (mis: 21:00)</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Keterangan Jam Operasional (Teks yang tampil di banner)
              </label>
              <input
                type="text"
                value={jamOperasional}
                onChange={(e) => setJamOperasional(e.target.value)}
                placeholder="mis. Setiap Hari, 07:00 – 21:00 WITA"
                className="w-full border bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Estimasi Waktu Pengantaran (Antar Alamat) */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-3.5">
            <div className="flex items-center gap-2.5 text-blue-950">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-sora font-extrabold text-blue-950">
                  Estimasi Waktu Pengantaran (Metode Antar Alamat)
                </h3>
                <p className="text-[11px] text-blue-800/80 font-medium">
                  Atur waktu persiapan toko & durasi perjalanan kurir per kilometer.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Waktu tempuh per km (menit) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={estimasiMenitPerKm}
                    onChange={(e) => setEstimasiMenitPerKm(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    required
                    className="w-full border bg-white rounded-xl px-3 py-2 text-sm font-sora font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400 pointer-events-none">mnt/km</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Kecepatan motor kurir per kilometer (standar: 5 menit)</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Waktu persiapan pesanan (menit) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={estimasiMenitTambahan}
                    onChange={(e) => setEstimasiMenitTambahan(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    required
                    className="w-full border bg-white rounded-xl px-3 py-2 text-sm font-sora font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400 pointer-events-none">menit</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Waktu packing barang & koordinasi kurir (standar: 15 menit)</p>
              </div>
            </div>

            {/* Live Simulation Box */}
            <div className="p-3 rounded-xl bg-white border border-blue-200/90 text-xs text-blue-900 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="font-sora font-bold text-[11px] text-blue-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Simulasi Perhitungan Waktu Tiba:</span>
                </p>
                <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  Otomatis dihitung saat checkout
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100/90">
                  <span className="text-gray-500 block text-[10px]">Jarak 1 km</span>
                  <span className="font-sora font-extrabold text-blue-700">±{estimasiMenitTambahan + (1 * estimasiMenitPerKm)} mnt</span>
                </div>
                <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100/90">
                  <span className="text-gray-500 block text-[10px]">Jarak 3 km</span>
                  <span className="font-sora font-extrabold text-blue-700">±{estimasiMenitTambahan + (3 * estimasiMenitPerKm)} mnt</span>
                </div>
                <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100/90">
                  <span className="text-gray-500 block text-[10px]">Jarak 5 km</span>
                  <span className="font-sora font-extrabold text-blue-700">±{estimasiMenitTambahan + (5 * estimasiMenitPerKm)} mnt</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 text-center font-medium">
                Rumus: {estimasiMenitTambahan} menit (persiapan) + (jarak km × {estimasiMenitPerKm} menit)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                No. HP Toko <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input
                type="tel"
                value={noHpToko}
                onChange={(e) => setNoHpToko(e.target.value)}
                placeholder="081234567890"
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                WhatsApp <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="6281234567890"
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Link Google Maps <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <input
              type="url"
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              placeholder="https://maps.app.goo.gl/..."
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="save-btn w-full md:w-auto px-7 py-3 text-xs font-sora font-bold rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Pengaturan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Pengaturan Toko</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

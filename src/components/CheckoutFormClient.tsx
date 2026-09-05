// @ts-nocheck
'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { formatRupiah } from '@/lib/utils'
import AlertBanner from './AlertBanner'
import { createOrder } from '@/lib/actions/orders'
import { 
  Coins, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  MapPin, 
  Truck, 
  Store, 
  Clock, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  Navigation,
  Info,
  Bookmark
} from 'lucide-react'
import { UserAddress } from '@/types/database'
import { Card, Button, Badge } from '@/components/ui'

// Fixed store coordinates: PENGENJEK MART (Pengenjek, Jonggat, Lombok Tengah)
const STORE_COORDS = {
  lat: -8.636636,
  lng: 116.244461,
}

// Haversine formula to compute distance in km
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10 // e.g. 3.2 km
}

interface StoreInfoData {
  nama_toko?: string
  alamat_toko?: string
  kota?: string
  jam_operasional?: string
  no_hp_toko?: string
}

interface ProfileData {
  nama?: string
  no_hp?: string | null
}

interface CheckoutFormClientProps {
  items: any[]
  subtotal: number
  store?: StoreInfoData | null
  profile?: ProfileData | null
  savedAddresses?: UserAddress[]
  loyaltySummary: {
    totalPoints: number
    redeemValue: number
    config: {
      is_active: boolean
      redeem_rate: number
      max_redeem_percentage: number
    }
  } | null
}

export default function CheckoutFormClient({
  items,
  subtotal,
  store,
  profile,
  savedAddresses = [],
  loyaltySummary,
}: CheckoutFormClientProps) {
  const router = useRouter()
  const config = loyaltySummary?.config
  const availablePoints = loyaltySummary?.totalPoints ?? 0
  const canUseLoyalty = config?.is_active && availablePoints > 0

  // Default address if any
  const defaultAddr = savedAddresses?.find((a) => a.is_default) || savedAddresses?.[0] || null

  // Delivery & shipping states
  const [metodePengiriman, setMetodePengiriman] = useState<'ambil_di_toko' | 'antar_alamat'>('ambil_di_toko')
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddr ? defaultAddr.id : 'manual')
  const [alamatPengiriman, setAlamatPengiriman] = useState(defaultAddr?.alamat_lengkap || '')
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(
    defaultAddr && defaultAddr.lat !== null && defaultAddr.long !== null
      ? { lat: Number(defaultAddr.lat), lng: Number(defaultAddr.long) }
      : null
  )
  const [jarakKm, setJarakKm] = useState<number | null>(() => {
    if (defaultAddr && defaultAddr.lat !== null && defaultAddr.long !== null) {
      return calculateHaversineDistance(
        STORE_COORDS.lat,
        STORE_COORDS.lng,
        Number(defaultAddr.lat),
        Number(defaultAddr.long)
      )
    }
    return null
  })
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'success' | 'error'>(
    defaultAddr && defaultAddr.lat !== null ? 'success' : 'idle'
  )
  const [geoMessage, setGeoMessage] = useState<string>(() => {
    if (defaultAddr && defaultAddr.lat !== null && defaultAddr.long !== null) {
      const d = calculateHaversineDistance(
        STORE_COORDS.lat,
        STORE_COORDS.lng,
        Number(defaultAddr.lat),
        Number(defaultAddr.long)
      )
      return d <= 7.0
        ? `Alamat "${defaultAddr.label}" (~${d} km). Radius \u2264 7 km: GRATIS ONGKIR!`
        : `Alamat "${defaultAddr.label}" (~${d} km dari toko). Jarak di atas 7 km: Ongkir flat Rp 15.000.`
    }
    return ''
  })

  const handleSelectSavedAddress = (addrId: string) => {
    setSelectedAddressId(addrId)
    if (addrId === 'manual') {
      setAlamatPengiriman('')
      setUserCoords(null)
      setJarakKm(null)
      setGeoStatus('idle')
      setGeoMessage('')
      return
    }

    const addr = savedAddresses.find((a) => a.id === addrId)
    if (addr) {
      setAlamatPengiriman(addr.alamat_lengkap)
      if (addr.lat !== null && addr.long !== null) {
        const d = calculateHaversineDistance(
          STORE_COORDS.lat,
          STORE_COORDS.lng,
          Number(addr.lat),
          Number(addr.long)
        )
        setUserCoords({ lat: Number(addr.lat), lng: Number(addr.long) })
        setJarakKm(d)
        setGeoStatus('success')
        if (d <= 7.0) {
          setGeoMessage(`Alamat "${addr.label}" (~${d} km). Radius \u2264 7 km: GRATIS ONGKIR!`)
        } else {
          setGeoMessage(`Alamat "${addr.label}" (~${d} km dari toko). Jarak di atas 7 km: Ongkir flat Rp 15.000.`)
        }
      } else {
        setUserCoords(null)
        setJarakKm(null)
        setGeoStatus('idle')
        setGeoMessage(`Alamat "${addr.label}" belum memiliki titik GPS tersimpan. Anda dapat menekan Cek GPS untuk menghitung radius.`)
      }
    }
  }

  // Determine ongkir
  let ongkir = 0
  if (metodePengiriman === 'antar_alamat') {
    if (jarakKm !== null) {
      ongkir = jarakKm <= 7.0 ? 0 : 15000
    } else {
      // Default flat when GPS not yet determined or failed
      ongkir = 15000
    }
  }

  // Calculate max points allowed for this subtotal
  const maxDiscountAllowed = Math.floor(subtotal * ((config?.max_redeem_percentage ?? 50) / 100))
  const redeemRate = config?.redeem_rate ?? 100
  const maxPointsNeeded = Math.ceil(maxDiscountAllowed / redeemRate)
  const maxRedeemablePoints = Math.min(availablePoints, maxPointsNeeded)

  const [usePoints, setUsePoints] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const pointsToUse = usePoints ? maxRedeemablePoints : 0
  const discountAmount = pointsToUse * redeemRate
  const finalTotal = Math.max(0, subtotal - discountAmount + ongkir)

  // Detect GPS location
  const handleDetectLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoStatus('error')
      setGeoMessage('Browser Anda tidak mendukung deteksi lokasi otomatis. Ongkir flat Rp 15.000 berlaku.')
      return
    }

    setGeoStatus('locating')
    setGeoMessage('Mencari koordinat lokasi Anda...')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude
        const userLng = pos.coords.longitude
        setUserCoords({ lat: userLat, lng: userLng })
        const distance = calculateHaversineDistance(
          STORE_COORDS.lat,
          STORE_COORDS.lng,
          userLat,
          userLng
        )
        setJarakKm(distance)
        setGeoStatus('success')
        if (distance <= 7.0) {
          setGeoMessage(`Lokasi terdeteksi (~${distance} km). Anda berada dalam radius 7 km: GRATIS ONGKIR!`)
        } else {
          setGeoMessage(`Lokasi terdeteksi (~${distance} km dari toko). Jarak di atas 7 km: Ongkir flat Rp 15.000.`)
        }
      },
      (err) => {
        setGeoStatus('error')
        if (err.code === 1) {
          setGeoMessage('Izin akses lokasi ditolak di HP/browser. Ongkir flat pengantaran Rp 15.000 berlaku.')
        } else {
          setGeoMessage('Gagal mendeteksi koordinat GPS. Ongkir flat pengantaran Rp 15.000 berlaku.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)

    if (metodePengiriman === 'antar_alamat' && !alamatPengiriman.trim()) {
      setErrorMsg('Harap isi alamat lengkap pengiriman untuk pengantaran pesanan')
      window.scrollTo({ top: 300, behavior: 'smooth' })
      return
    }

    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      try {
        const res = await createOrder(formData)
        if (res?.error) {
          setErrorMsg(res.error)
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
        } else if (res?.orderId) {
          window.location.href = `/pesanan/${res.orderId}`
        }
      } catch (err: any) {
        if (err?.message?.includes('NEXT_REDIRECT')) return
        setErrorMsg(err?.message || 'Terjadi gangguan saat memproses pesanan')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 px-4">
      {/* 1. METODE PENGIRIMAN TOGGLE */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-sora font-bold text-sm text-[var(--ink)] flex items-center gap-2">
            <Truck size={17} className="text-[var(--accent)]" />
            Metode Pengiriman
          </h2>
          <span className="text-[var(--text-caption)] font-semibold text-[var(--accent-2)] bg-[var(--accent-bg)] px-2.5 py-0.5 rounded-full">
            {metodePengiriman === 'ambil_di_toko' ? 'Bebas Ongkir' : (ongkir === 0 ? 'Gratis Ongkir' : 'Ongkir Rp 15rb')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Option: Ambil di Toko */}
          <button
            type="button"
            onClick={() => setMetodePengiriman('ambil_di_toko')}
            className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
              metodePengiriman === 'ambil_di_toko'
                ? 'border-[var(--accent)] bg-[var(--accent-bg)] shadow-[0_4px_12px_rgba(255,107,53,0.12)] ring-1 ring-[var(--accent)]'
                : 'border-[var(--line)] bg-white hover:border-[var(--line)]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                metodePengiriman === 'ambil_di_toko' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--paper)] text-[var(--ink-soft)]'
              }`}>
                <Store size={16} />
              </span>
              {metodePengiriman === 'ambil_di_toko' && (
                <CheckCircle2 size={16} className="text-[var(--accent)]" />
              )}
            </div>
            <div>
              <p className="font-sora font-bold text-xs text-[var(--ink)]">Ambil di Toko</p>
              <p className="text-[var(--text-caption)] text-emerald-700 font-extrabold mt-0.5">Gratis (Rp 0)</p>
            </div>
          </button>

          {/* Option: Diantar ke Alamat */}
          <button
            type="button"
            onClick={() => {
              setMetodePengiriman('antar_alamat')
              if (geoStatus === 'idle') {
                handleDetectLocation()
              }
            }}
            className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
              metodePengiriman === 'antar_alamat'
                ? 'border-[var(--accent)] bg-[var(--accent-bg)] shadow-[0_4px_12px_rgba(255,107,53,0.12)] ring-1 ring-[var(--accent)]'
                : 'border-[var(--line)] bg-white hover:border-[var(--line)]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                metodePengiriman === 'antar_alamat' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--paper)] text-[var(--ink-soft)]'
              }`}>
                <Truck size={16} />
              </span>
              {metodePengiriman === 'antar_alamat' && (
                <CheckCircle2 size={16} className="text-[var(--accent)]" />
              )}
            </div>
            <div>
              <p className="font-sora font-bold text-xs text-[var(--ink)]">Diantar ke Alamat</p>
              <p className="text-[var(--text-caption)] text-[var(--ink-soft)] font-medium mt-0.5">Radius s.d. 7 km Gratis</p>
            </div>
          </button>
        </div>

        {/* Hidden inputs for form data */}
        <input type="hidden" name="metode_pengiriman" value={metodePengiriman} />
        <input type="hidden" name="user_lat" value={userCoords?.lat !== undefined ? userCoords.lat.toString() : ''} />
        <input type="hidden" name="user_lng" value={userCoords?.lng !== undefined ? userCoords.lng.toString() : ''} />
        <input type="hidden" name="jarak_km" value={jarakKm !== null ? jarakKm.toString() : ''} />
        <input type="hidden" name="ongkir" value={ongkir.toString()} />
      </Card>

      {/* 2. DETAIL METODE: AMBIL DI TOKO ATAU ANTAR ALAMAT */}
      {metodePengiriman === 'ambil_di_toko' ? (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <MapPin size={15} />
            </span>
            <h2 className="font-sora font-bold text-sm text-[var(--ink)]">Lokasi Pengambilan</h2>
            <Badge variant="positive" className="ml-auto">Bebas Ongkir</Badge>
          </div>
          <div className="space-y-2 text-xs">
            <p className="font-bold text-[var(--ink)]">{store?.nama_toko || 'PENGENJEK MART'}</p>
            {store?.alamat_toko && (
              <p className="text-[var(--ink-soft)] flex gap-2 font-medium">
                <MapPin size={15} className="shrink-0 mt-0.5 text-emerald-600" />
                {store.alamat_toko}{store.kota ? `, ${store.kota}` : ''}
              </p>
            )}
            {store?.jam_operasional && (
              <p className="text-[var(--ink-soft)] flex gap-2 font-medium">
                <Clock size={15} className="shrink-0 mt-0.5 text-emerald-600" />
                {store.jam_operasional}
              </p>
            )}
            {store?.no_hp_toko && (
              <p className="text-[var(--ink-soft)] flex gap-2 font-medium">
                <Phone size={15} className="shrink-0 mt-0.5 text-emerald-600" />
                {store.no_hp_toko}
              </p>
            )}
          </div>
        </Card>
      ) : (
        <Card className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="font-sora font-bold text-sm text-[var(--ink)] flex items-center gap-2">
              <Navigation size={16} className="text-[var(--accent)]" />
              Radius & Alamat Pengantaran
            </h2>
            {jarakKm !== null && (
              <span className={`text-[var(--text-caption)] font-bold px-2 py-0.5 rounded-full ${
                ongkir === 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/30'
              }`}>
                {jarakKm} km dari Toko
              </span>
            )}
          </div>

          {/* Saved Addresses Picker */}
          {savedAddresses && savedAddresses.length > 0 && (
            <div className="space-y-1.5 p-3 rounded-2xl bg-[var(--paper)] border border-[var(--line)]">
              <label className="text-xs font-sora font-bold text-[var(--ink)] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Bookmark size={13} className="text-[var(--accent-2)]" />
                  Gunakan Alamat Tersimpan
                </span>
                <span className="text-[10px] text-[var(--accent-2)] font-semibold">
                  {savedAddresses.length} Tersimpan
                </span>
              </label>

              <select
                value={selectedAddressId}
                onChange={(e) => handleSelectSavedAddress(e.target.value)}
                aria-label="Pilih Alamat Pengiriman Tersimpan"
                className="w-full text-xs font-medium p-2.5 rounded-[var(--radius-md)] border border-[rgba(232,214,205,0.9)] bg-white focus:outline-hidden focus:border-[var(--accent-2)] focus:ring-1 focus:ring-[var(--accent-2)]"
              >
                {savedAddresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.label} {addr.is_default ? '(Utama)' : ''} {addr.lat !== null ? '📍' : ''} — {addr.alamat_lengkap.slice(0, 45)}...
                  </option>
                ))}
                <option value="manual">+ Input Alamat Baru / Lainnya</option>
              </select>
            </div>
          )}

          {/* GPS Auto-Detect Button */}
          <div className="p-3 rounded-2xl bg-[var(--warning)]/10 border border-[var(--warning)]/30 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[var(--warning)]/20 text-[var(--warning)] flex items-center justify-center shrink-0">
                  <Navigation size={15} className={geoStatus === 'locating' ? 'animate-spin' : ''} />
                </div>
                <div>
                  <p className="font-sora font-bold text-xs text-[var(--ink)]">Cek Jarak Lokasi Saya</p>
                  <p className="text-[var(--text-caption)] text-[var(--ink-soft)] font-medium">
                    Hitung otomatis radius toko ke HP Anda
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={geoStatus === 'locating'}
                className="px-3 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-sora font-bold shadow-xs active:scale-95 transition-all disabled:opacity-50 shrink-0"
              >
                {geoStatus === 'locating' ? 'Mendeteksi...' : 'Cek GPS'}
              </button>
            </div>

            {/* Geolocation feedback banner */}
            {geoMessage && (
              <div className={`p-2.5 rounded-xl text-xs font-medium flex items-start gap-2 ${
                geoStatus === 'success' 
                  ? (ongkir === 0 ? 'bg-emerald-100/80 text-emerald-800' : 'bg-orange-100/80 text-orange-900')
                  : 'bg-[var(--danger)]/10 text-[var(--danger)]'
              }`}>
                <Info size={14} className="shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{geoMessage}</span>
                  {geoStatus === 'success' && ongkir === 0 && (
                     <p className="text-[var(--text-caption)] font-bold text-emerald-800 mt-0.5">
                      🎉 Biaya Ongkir: GRATIS (Rp 0)
                    </p>
                  )}
                  {geoStatus === 'success' && ongkir > 0 && (
                    <p className="text-[var(--text-caption)] font-bold text-orange-900 mt-0.5">
                      🛵 Biaya Ongkir: Rp 15.000
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Manual Address Input */}
          <div className="space-y-1.5">
            <label htmlFor="alamat_pengiriman" className="text-xs font-sora font-bold text-[var(--ink)] flex items-center justify-between">
              <span>Alamat Lengkap Pengiriman <span className="text-[var(--danger)]">*</span></span>
              <span className="text-[var(--text-caption)] text-[var(--ink-soft)] font-normal">Patokan rumah / RT / RW</span>
            </label>
            <textarea
              id="alamat_pengiriman"
              name="alamat_pengiriman"
              rows={3}
              value={alamatPengiriman}
              onChange={(e) => {
                setAlamatPengiriman(e.target.value)
                if (selectedAddressId !== 'manual') {
                  setSelectedAddressId('manual')
                }
              }}
              placeholder="Contoh: Jl. Raya Pengenjek RT 03, rumah pagar putih samping musholla Al-Ikhlas"
              required={metodePengiriman === 'antar_alamat'}
              className="w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-3.5 py-2.5 text-xs text-[var(--ink)] placeholder:text-[var(--ink-soft)] shadow-[0_4px_10px_-2px_rgba(43,24,16,.04),inset_0_1px_0_#ffffff] outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 resize-none"
            />
          </div>
        </Card>
      )}

      {/* 3. METODE PEMBAYARAN */}
      <Card>
        <div className="flex items-center gap-2 mb-2.5">
          <span className="w-7 h-7 rounded-xl bg-[var(--accent-bg)] text-[var(--accent-2)] flex items-center justify-center font-bold">
            <ShieldCheck size={15} />
          </span>
          <h2 className="font-sora font-bold text-sm text-[var(--ink)]">Metode Pembayaran</h2>
        </div>
        <div className="rounded-[var(--radius-md)] bg-[var(--accent-bg)] border border-[var(--accent)]/30 p-3 text-xs">
          <p className="font-bold text-[var(--accent-2)]">
            COD (Bayar Tunai / Scan QRIS saat {metodePengiriman === 'ambil_di_toko' ? 'Ambil di Toko' : 'Pesanan Tiba'})
          </p>
          <p className="text-[var(--text-caption)] text-[var(--ink-soft)] mt-0.5 font-medium">
            Pembayaran dilakukan di tempat saat barang diterima dengan aman
          </p>
        </div>
      </Card>

      {/* 4. DATA PEMESAN */}
      <Card className="space-y-3">
        <h2 className="font-sora font-bold text-sm text-[var(--ink)]">Data Pemesan</h2>
        <div className="space-y-1">
          <label htmlFor="nama_pemesan" className="text-xs font-sora font-bold text-[var(--ink)]">
            Nama Lengkap <span className="text-[var(--danger)]">*</span>
          </label>
          <input
            id="nama_pemesan"
            name="nama_pemesan"
            defaultValue={profile?.nama}
            required
            placeholder="Nama lengkap pemesan"
            className="w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-3.5 py-2 text-xs text-[var(--ink)] placeholder:text-[var(--ink-soft)] shadow-xs outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="no_hp_pemesan" className="text-xs font-sora font-bold text-[var(--ink)]">
            Nomor WhatsApp <span className="text-[var(--danger)]">*</span>
          </label>
          <input
            id="no_hp_pemesan"
            type="tel"
            name="no_hp_pemesan"
            defaultValue={profile?.no_hp ?? ''}
            required
            placeholder="08xxxxxxxxxx"
            className="w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-3.5 py-2 text-xs text-[var(--ink)] placeholder:text-[var(--ink-soft)] shadow-xs outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="catatan" className="text-xs font-sora font-bold text-[var(--ink)]">
            Catatan Tambahan (opsional)
          </label>
          <textarea
            id="catatan"
            name="catatan"
            rows={2}
            className="w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-3.5 py-2 text-xs text-[var(--ink)] placeholder:text-[var(--ink-soft)] shadow-xs outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 resize-none"
            placeholder="Contoh: tolong pisahkan kantong bumbu dapur"
          />
        </div>
      </Card>

      {/* 5. LOYALTY POINTS REDEMPTION TOGGLE */}
      {canUseLoyalty && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[var(--warning)]/20 text-[var(--warning)] flex items-center justify-center font-bold">
                <Coins size={16} />
              </span>
              <div>
                <h3 className="font-sora font-bold text-xs text-[var(--ink)] flex items-center gap-1">
                  <span>Tukar Poin Toko</span>
                  <span className="text-[var(--text-caption)] text-[var(--warning)] bg-[var(--warning)]/10 px-2 py-0.5 rounded-full border border-[var(--warning)]/30">
                    {availablePoints} Poin
                  </span>
                </h3>
                <p className="text-[var(--text-caption)] text-[var(--ink-soft)] font-medium">
                  {usePoints
                    ? `Hemat ${formatRupiah(discountAmount)} (${pointsToUse} poin)`
                    : `Tukarkan poin jadi diskon hingga ${formatRupiah(maxRedeemablePoints * redeemRate)}`}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={usePoints}
                onChange={(e) => setUsePoints(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--line)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--line)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
            </label>
          </div>

          <input
            type="hidden"
            name="poin_digunakan"
            value={pointsToUse}
          />
        </Card>
      )}

      {/* 6. RINGKASAN BELANJA (STRUK NOTA DASHED) */}
      <Card>
        <h2 className="font-sora font-bold text-sm text-[var(--ink)] mb-3">Ringkasan Belanja</h2>
        <div className="space-y-2 text-xs mb-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between py-1">
              <span className="text-[var(--ink-soft)] line-clamp-1 pr-2 font-medium">
                {item.products?.nama} × {item.qty}
              </span>
              <span className="font-bold text-[var(--ink)] tabular-nums shrink-0 font-sora">
                {formatRupiah((item.products?.harga ?? 0) * item.qty)}
              </span>
            </div>
          ))}
        </div>

        {/* Subtotal */}
        <div className="pt-2 border-t border-[var(--line)] flex justify-between items-center text-xs text-[var(--ink-soft)]">
          <span>Subtotal Produk</span>
          <span className="tabular-nums font-semibold font-sora text-[var(--ink)]">{formatRupiah(subtotal)}</span>
        </div>

        {/* Ongkir Breakdown */}
        <div className="pt-1.5 flex justify-between items-center text-xs">
          <span className="text-[var(--ink-soft)] flex items-center gap-1">
            <Truck size={12} className="text-[var(--accent)]" />
            Biaya Pengiriman
            {metodePengiriman === 'antar_alamat' && jarakKm !== null && (
              <span className="text-[var(--text-caption)] text-[var(--ink-soft)]">({jarakKm} km)</span>
            )}
          </span>
          <span className={`tabular-nums font-bold font-sora ${ongkir === 0 ? 'text-emerald-700' : 'text-[var(--ink)]'}`}>
            {metodePengiriman === 'ambil_di_toko' ? (
              <span className="text-emerald-700 font-bold">Gratis (Ambil Toko)</span>
            ) : ongkir === 0 ? (
              <span className="text-emerald-700 font-bold">Gratis (Radius &le; 7 km)</span>
            ) : (
              formatRupiah(ongkir)
            )}
          </span>
        </div>

        {/* Loyalty Points Discount */}
        {discountAmount > 0 && (
          <div className="pt-1.5 flex justify-between items-center text-xs text-emerald-700 font-semibold">
            <span className="flex items-center gap-1">
              <Sparkles size={12} /> Diskon Poin ({pointsToUse} poin)
            </span>
            <span className="tabular-nums font-sora">-{formatRupiah(discountAmount)}</span>
          </div>
        )}

        {/* Total COD */}
        <div className="receipt-dashed pt-3 mt-2 flex justify-between items-center text-sm font-bold text-[var(--ink)]">
          <span className="font-sora">Total Tagihan (COD)</span>
          <span className="font-sora font-bold text-[var(--accent-2)] text-xl tabular-nums">
            {formatRupiah(finalTotal)}
          </span>
        </div>
      </Card>

      {/* Error Message */}
      {errorMsg && (
        <AlertBanner type="error" message={errorMsg} className="animate-fade-in" />
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="checkout-btn w-full py-3.5 text-base gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Memproses Pesanan...</span>
          </>
        ) : (
          <span>Buat Pesanan — {formatRupiah(finalTotal)}</span>
        )}
      </button>
    </form>
  )
}

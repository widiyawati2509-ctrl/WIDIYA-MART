// @ts-nocheck
'use client'

import { useState, useTransition, useCallback, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  formatRupiah,
  formatWhatsAppUrl,
  DUSUN_PENGENJEK_LIST,
  calculateDusunShipping,
  type DusunShippingOption,
} from '@/lib/utils'
import StoreStatusBadge from './StoreStatusBadge'
import AlertBanner from './AlertBanner'
import { createOrder } from '@/lib/actions/orders'
import { validateCoupon, getAvailableCoupons } from '@/lib/actions/coupons'
import type { Coupon } from '@/types/database'
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
  Bookmark,
  MessageCircle,
  TicketPercent,
  Tag,
  Check,
  X,
  Gift,
  ArrowRight,
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
  return Math.round(R * c * 10) / 10
}

interface StoreInfoData {
  nama_toko?: string
  alamat_toko?: string
  kota?: string
  jam_operasional?: string
  jam_buka?: string
  jam_tutup?: string
  no_hp_toko?: string
  whatsapp?: string
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
  const searchParams = useSearchParams()
  const initialCouponCode = searchParams?.get('coupon') || ''
  const config = loyaltySummary?.config
  const availablePoints = loyaltySummary?.totalPoints ?? 0
  const canUseLoyalty = config?.is_active && availablePoints > 0

  // Default address if any
  const defaultAddr = savedAddresses?.find((a) => a.is_default) || savedAddresses?.[0] || null

  // Delivery & shipping states
  const [metodePengiriman, setMetodePengiriman] = useState<'ambil_di_toko' | 'antar_alamat'>('ambil_di_toko')
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddr ? defaultAddr.id : 'manual')
  const [alamatPengiriman, setAlamatPengiriman] = useState(defaultAddr?.alamat_lengkap || '')

  // Dusun area selection (Pengenjek & around)
  const [selectedDusunId, setSelectedDusunId] = useState<string>('baremayung')
  const [useGpsDistance, setUseGpsDistance] = useState(false)

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
  const [geoMessage, setGeoMessage] = useState<string>('')

  // Coupon / Promo Voucher states
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false)
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([])
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false)

  // Anti-spam rapid submission protection
  const isSubmittingRef = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Load available coupons on mount
  useEffect(() => {
    getAvailableCoupons().then((list) => {
      setAvailableCoupons(list || [])
    })
  }, [])

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
        setUseGpsDistance(true)
      } else {
        setUserCoords(null)
        setJarakKm(null)
        setGeoStatus('idle')
      }
    }
  }

  // Calculate Dusun / GPS shipping
  const selectedDusun = DUSUN_PENGENJEK_LIST.find((d) => d.id === selectedDusunId) || DUSUN_PENGENJEK_LIST[0]
  const dusunShipping = calculateDusunShipping(selectedDusunId, subtotal)

  // Determine actual ongkir and estimasi waktu
  let ongkir = 0
  let estimasiMenit: number | null = null

  if (metodePengiriman === 'antar_alamat') {
    if (useGpsDistance && jarakKm !== null) {
      ongkir = jarakKm <= 7.0 ? 0 : 15000
      const estimasiMenitPerKm = Number(store?.estimasi_menit_per_km ?? 5)
      const estimasiMenitTambahan = Number(store?.estimasi_menit_tambahan ?? 15)
      estimasiMenit = Math.round(estimasiMenitTambahan + jarakKm * estimasiMenitPerKm)
    } else {
      ongkir = dusunShipping.ongkir
      estimasiMenit = dusunShipping.estimasiMenit
    }
  }

  // Points calculation
  const maxDiscountAllowed = Math.floor(subtotal * ((config?.max_redeem_percentage ?? 50) / 100))
  const redeemRate = config?.redeem_rate ?? 100
  const maxPointsNeeded = Math.ceil(maxDiscountAllowed / redeemRate)
  const maxRedeemablePoints = Math.min(availablePoints, maxPointsNeeded)

  const [usePoints, setUsePoints] = useState(false)
  const pointsToUse = usePoints ? maxRedeemablePoints : 0
  const discountAmount = pointsToUse * redeemRate

  // Final Total Calculation
  const finalTotal = Math.max(0, subtotal - discountAmount - couponDiscount + ongkir)

  // GPS Location detection
  const handleDetectLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoStatus('error')
      setGeoMessage('Browser tidak mendukung deteksi lokasi otomatis.')
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
        setUseGpsDistance(true)
        if (distance <= 7.0) {
          setGeoMessage(`Lokasi terdeteksi (~${distance} km). Radius ≤ 7 km: GRATIS ONGKIR!`)
        } else {
          setGeoMessage(`Lokasi terdeteksi (~${distance} km dari toko). Jarak > 7 km: Ongkir flat Rp 15.000.`)
        }
      },
      (err) => {
        setGeoStatus('error')
        setGeoMessage('Gagal mendeteksi koordinat GPS. Tarif ongkir dusun berlaku.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  // Apply voucher
  const handleApplyCoupon = async (codeToApply?: string) => {
    const targetCode = (codeToApply || couponInput).trim()
    if (!targetCode) {
      setCouponFeedback({ type: 'error', text: 'Masukkan kode voucher terlebih dahulu' })
      return
    }

    setIsCheckingCoupon(true)
    setCouponFeedback(null)

    try {
      const res = await validateCoupon(targetCode, subtotal)
      if (res.valid && res.coupon) {
        setAppliedCoupon(res.coupon)
        setCouponDiscount(res.discountAmount || 0)
        setCouponFeedback({
          type: 'success',
          text: `Voucher "${res.coupon.kode}" berhasil diterapkan! Hemat ${formatRupiah(res.discountAmount || 0)}`,
        })
        setIsCouponModalOpen(false)
      } else {
        setCouponFeedback({
          type: 'error',
          text: res.error || 'Kode kupon tidak valid atau tidak memenuhi syarat',
        })
      }
    } catch {
      setCouponFeedback({ type: 'error', text: 'Terjadi kesalahan saat memeriksa kupon' })
    } finally {
      setIsCheckingCoupon(false)
    }
  }

  // Auto-apply coupon from URL param if present (e.g. from Cart or Promo link)
  useEffect(() => {
    if (initialCouponCode && !appliedCoupon) {
      setCouponInput(initialCouponCode)
      handleApplyCoupon(initialCouponCode)
    }
  }, [initialCouponCode])

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponDiscount(0)
    setCouponFeedback(null)
    setCouponInput('')
  }

  // Submit checkout
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)

    // Anti-spam rapid submission lock
    if (isSubmittingRef.current || isPending) {
      return
    }

    if (metodePengiriman === 'antar_alamat' && !alamatPengiriman.trim()) {
      setErrorMsg('Harap isi alamat lengkap pengiriman untuk pengantaran pesanan')
      window.scrollTo({ top: 300, behavior: 'smooth' })
      return
    }

    isSubmittingRef.current = true
    setIsSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      try {
        const res = await createOrder(formData)
        if (res?.error) {
          setErrorMsg(res.error)
          isSubmittingRef.current = false
          setIsSubmitting(false)
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
        } else if (res?.orderId) {
          router.push(`/pesanan/${res.orderId}?created=true`)
        }
      } catch (err: any) {
        if (err?.message?.includes('NEXT_REDIRECT')) return
        setErrorMsg(err?.message || 'Terjadi gangguan saat memproses pesanan')
        isSubmittingRef.current = false
        setIsSubmitting(false)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5 px-4 pb-12">
      {/* 1. METODE PENGIRIMAN TOGGLE */}
      <Card className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="font-sora font-bold text-sm text-[var(--ink)] flex items-center gap-2">
            <Truck size={17} className="text-[var(--accent)]" />
            Metode Pengiriman
          </h2>
          <span className="text-[var(--text-caption)] font-semibold text-[var(--accent-2)] bg-[var(--accent-bg)] px-2.5 py-0.5 rounded-full">
            {metodePengiriman === 'ambil_di_toko'
              ? 'Bebas Ongkir'
              : ongkir === 0
              ? 'Gratis Ongkir'
              : `Ongkir ${formatRupiah(ongkir)}`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Option: Ambil di Toko */}
          <button
            type="button"
            onClick={() => setMetodePengiriman('ambil_di_toko')}
            className={`p-2.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
              metodePengiriman === 'ambil_di_toko'
                ? 'border-[var(--accent)] bg-[var(--accent-bg)] shadow-card-accent ring-1 ring-[var(--accent)]'
                : 'border-[var(--line)] bg-white hover:border-[var(--line)]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  metodePengiriman === 'ambil_di_toko'
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--paper)] text-[var(--ink-soft)]'
                }`}
              >
                <Store size={16} />
              </span>
              {metodePengiriman === 'ambil_di_toko' && (
                <CheckCircle2 size={16} className="text-[var(--accent)]" />
              )}
            </div>
            <div>
              <p className="font-sora font-bold text-xs text-[var(--ink)]">Ambil di Toko</p>
              <p className="text-[var(--text-caption)] text-emerald-700 font-extrabold mt-0.5">
                Gratis (Rp 0)
              </p>
            </div>
          </button>

          {/* Option: Diantar ke Alamat */}
          <button
            type="button"
            onClick={() => setMetodePengiriman('antar_alamat')}
            className={`p-2.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
              metodePengiriman === 'antar_alamat'
                ? 'border-[var(--accent)] bg-[var(--accent-bg)] shadow-card-accent ring-1 ring-[var(--accent)]'
                : 'border-[var(--line)] bg-white hover:border-[var(--line)]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  metodePengiriman === 'antar_alamat'
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--paper)] text-[var(--ink-soft)]'
                }`}
              >
                <Truck size={16} />
              </span>
              {metodePengiriman === 'antar_alamat' && (
                <CheckCircle2 size={16} className="text-[var(--accent)]" />
              )}
            </div>
            <div>
              <p className="font-sora font-bold text-xs text-[var(--ink)]">Diantar ke Alamat</p>
              <p className="text-[var(--text-caption)] text-[var(--accent-2)] font-semibold mt-0.5">
                Pengenjek & Sekitar
              </p>
            </div>
          </button>
        </div>

        <input type="hidden" name="metode_pengiriman" value={metodePengiriman} />
      </Card>

      {/* 2. DETAIL LOKASI / ALAMAT */}
      {metodePengiriman === 'ambil_di_toko' ? (
        <Card className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-sora font-bold text-sm text-[var(--ink)] flex items-center gap-2">
              <Store size={16} className="text-[var(--accent)]" />
              Titik Pengambilan Pesanan
            </h2>
            <StoreStatusBadge />
          </div>

          <div className="space-y-2 text-xs">
            <p className="font-bold text-[var(--ink)] text-sm">
              {store?.nama_toko || 'PENGENJEK MART'}
            </p>
            {store?.alamat_toko && (
              <p className="text-[var(--ink-soft)] flex gap-2 font-medium">
                <MapPin size={15} className="shrink-0 mt-0.5 text-emerald-600" />
                <span>
                  {store.alamat_toko}
                  {store.kota ? `, ${store.kota}` : ''}
                </span>
              </p>
            )}
            {store?.jam_operasional && (
              <p className="text-[var(--ink-soft)] flex gap-2 font-medium">
                <Clock size={15} className="shrink-0 mt-0.5 text-emerald-600" />
                <span>{store.jam_operasional}</span>
              </p>
            )}
          </div>
        </Card>
      ) : (
        <Card className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="font-sora font-bold text-sm text-[var(--ink)] flex items-center gap-2">
              <Navigation size={16} className="text-[var(--accent)]" />
              Area & Alamat Pengantaran
            </h2>
            <span
              className={`text-[var(--text-caption)] font-bold px-2 py-0.5 rounded-full ${
                ongkir === 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-[var(--accent-bg)] text-[var(--accent-2)]'
              }`}
            >
              {ongkir === 0 ? '🎉 Gratis Ongkir' : `Ongkir: ${formatRupiah(ongkir)}`}
            </span>
          </div>

          {/* DUSUN / AREA SELECTOR (Task 8: Kalkulator Ongkir Lokal) */}
          <div className="p-3 rounded-2xl bg-[var(--paper)] border border-[var(--line)] space-y-2">
            <label className="text-xs font-sora font-bold text-[var(--ink)] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-[var(--accent)]" />
                Pilih Dusun / Wilayah Pengantaran
              </span>
              <span className="text-[10px] text-emerald-700 font-extrabold">
                {dusunShipping.isFree ? 'Gratis Ongkir' : `Tarif: ${formatRupiah(selectedDusun.ongkir)}`}
              </span>
            </label>

            <select
              value={useGpsDistance ? 'gps' : selectedDusunId}
              onChange={(e) => {
                const val = e.target.value
                if (val === 'gps') {
                  setUseGpsDistance(true)
                  if (geoStatus === 'idle') {
                    handleDetectLocation()
                  }
                } else {
                  setUseGpsDistance(false)
                  setSelectedDusunId(val)
                }
              }}
              className="w-full text-xs font-medium p-2.5 rounded-[var(--radius-md)] border border-[rgba(232,214,205,0.9)] bg-white focus:outline-hidden focus:border-[var(--accent)]"
            >
              <optgroup label="Desa Pengenjek (Tarif Rp 3.000 / Gratis min. Rp 25rb)">
                {DUSUN_PENGENJEK_LIST.filter((d) => d.kategori === 'desa_pengenjek').map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama} — {d.keterangan}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Sekitar Pengenjek ≤ 7 km (Tarif Rp 7.000 / Gratis min. Rp 50rb)">
                {DUSUN_PENGENJEK_LIST.filter((d) => d.kategori === 'sekitar_pengenjek').map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama} — {d.keterangan}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Luar Wilayah > 7 km (Tarif Rp 15.000 / Gratis min. Rp 100rb)">
                {DUSUN_PENGENJEK_LIST.filter((d) => d.kategori === 'luar_area').map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama} — {d.keterangan}
                  </option>
                ))}
              </optgroup>
              <option value="gps">📍 Gunakan Deteksi GPS Otomatis (Radius KM)</option>
            </select>

            {/* Free Shipping Dynamic Progress */}
            {!useGpsDistance && (
              <div className="pt-1">
                {dusunShipping.isFree ? (
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-1.5 font-semibold">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>Belanja Anda mencapai syarat: <strong>GRATIS ONGKIR</strong> ke {selectedDusun.nama}!</span>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between font-medium">
                    <span>
                      Belanja <strong>{formatRupiah(dusunShipping.sisaUntukGratis)}</strong> lagi untuk{' '}
                      <strong>Gratis Ongkir</strong>
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      Min. {formatRupiah(dusunShipping.minBelanja)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <input type="hidden" name="dusun_id" value={selectedDusunId} />
          <input type="hidden" name="dusun_pengiriman" value={selectedDusun.nama} />

          {/* Saved Addresses Picker if available */}
          {savedAddresses && savedAddresses.length > 0 && (
            <div className="space-y-1.5 p-3 rounded-2xl bg-[var(--paper)] border border-[var(--line)]">
              <label className="text-xs font-sora font-bold text-[var(--ink)] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Bookmark size={13} className="text-[var(--accent-2)]" />
                  Alamat Tersimpan
                </span>
                <span className="text-[10px] text-[var(--accent-2)] font-semibold">
                  {savedAddresses.length} Tersimpan
                </span>
              </label>

              <select
                value={selectedAddressId}
                onChange={(e) => handleSelectSavedAddress(e.target.value)}
                className="w-full text-xs font-medium p-2.5 rounded-[var(--radius-md)] border border-[rgba(232,214,205,0.9)] bg-white focus:outline-hidden focus:border-[var(--accent)]"
              >
                {savedAddresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.label} {addr.is_default ? '(Utama)' : ''} — {addr.alamat_lengkap.slice(0, 45)}...
                  </option>
                ))}
                <option value="manual">+ Tulis Alamat Baru</option>
              </select>
            </div>
          )}

          {/* Manual Address Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="alamat_pengiriman"
              className="text-xs font-sora font-bold text-[var(--ink)] flex items-center justify-between"
            >
              <span>
                Alamat Detail / Patokan Rumah <span className="text-[var(--danger)]">*</span>
              </span>
              <span className="text-[var(--text-caption)] text-[var(--ink-soft)] font-normal">
                RT / RW / depan masjid / gang
              </span>
            </label>
            <textarea
              id="alamat_pengiriman"
              name="alamat_pengiriman"
              rows={2}
              value={alamatPengiriman}
              onChange={(e) => {
                setAlamatPengiriman(e.target.value)
                if (selectedAddressId !== 'manual') {
                  setSelectedAddressId('manual')
                }
              }}
              placeholder={`Contoh: Dusun ${selectedDusun.nama.split('(')[0].trim()}, RT 02 samping Musholla, rumah cat hijau`}
              required={metodePengiriman === 'antar_alamat'}
              className="w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-3.5 py-2.5 text-xs text-[var(--ink)] placeholder:text-[var(--ink-soft)] shadow-input outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 resize-none"
            />
          </div>

          {/* Estimasi Pengantaran Badge */}
          {estimasiMenit !== null && (
            <div className="p-3 rounded-2xl bg-blue-50/90 border border-blue-200/90 flex items-center justify-between text-xs text-blue-950 shadow-2xs">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-700 shrink-0" />
                <span className="font-sora font-bold text-blue-950">
                  Estimasi Pengantaran: ±{estimasiMenit} Menit
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-sora font-extrabold text-[10px]">
                Cepat & Siap
              </span>
            </div>
          )}
        </Card>
      )}

      {/* 3. METODE PEMBAYARAN */}
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={16} className="text-[var(--accent)]" />
          <h2 className="font-sora font-bold text-sm text-[var(--ink)]">Metode Pembayaran</h2>
        </div>
        <div className="rounded-[var(--radius-md)] bg-[var(--accent-bg)] border border-[var(--accent)]/30 p-3 text-xs">
          <p className="font-bold text-[var(--accent-2)]">
            COD (Bayar Tunai / Scan QRIS saat {metodePengiriman === 'ambil_di_toko' ? 'Ambil di Toko' : 'Pesanan Tiba'})
          </p>
          <p className="text-[var(--text-caption)] text-[var(--ink-soft)] mt-0.5 font-medium">
            Bayar langsung ke kurir / toko saat barang Anda terima
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
            placeholder="Nama penerima pesanan"
            className="w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-3.5 py-2 text-xs text-[var(--ink)] placeholder:text-[var(--ink-soft)] shadow-xs outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="no_hp_pemesan" className="text-xs font-sora font-bold text-[var(--ink)]">
            Nomor WhatsApp / HP <span className="text-[var(--danger)]">*</span>
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
            placeholder="Contoh: Tolong bungkus terpisah, kirim sebelum siang"
          />
        </div>
      </Card>

      {/* 5. VOUCHER & KODE PROMO (Task 3: Sistem Kupon) */}
      <Card className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="font-sora font-bold text-sm text-[var(--ink)] flex items-center gap-2">
            <TicketPercent size={17} className="text-[var(--accent)]" />
            Voucher & Kode Promo
          </h2>
          <button
            type="button"
            onClick={() => setIsCouponModalOpen(true)}
            className="text-xs font-sora font-bold text-[var(--accent-2)] hover:underline flex items-center gap-1"
          >
            <Gift size={13} />
            <span>Lihat Kupon ({availableCoupons.length})</span>
          </button>
        </div>

        {appliedCoupon ? (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Check size={16} />
              </div>
              <div>
                <p className="font-sora font-extrabold text-xs text-emerald-950">
                  {appliedCoupon.kode} &bull; Hemat {formatRupiah(couponDiscount)}
                </p>
                <p className="text-[10px] text-emerald-800 font-medium">
                  {appliedCoupon.judul}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="press px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              Hapus
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Masukkan kode promo (mis: PENGENJEK5K)"
                className="flex-1 text-xs px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-white uppercase font-sora font-bold text-[var(--ink)] placeholder:normal-case placeholder:font-normal outline-hidden focus:border-[var(--accent)]"
              />
              <button
                type="button"
                onClick={() => handleApplyCoupon()}
                disabled={isCheckingCoupon || !couponInput.trim()}
                className="press px-4 py-2 rounded-[var(--radius-md)] bg-[var(--accent)] text-white text-xs font-sora font-bold hover:brightness-95 disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0"
              >
                {isCheckingCoupon ? <Loader2 size={13} className="animate-spin" /> : 'Terapkan'}
              </button>
            </div>

            {couponFeedback && (
              <p
                className={`text-[11px] font-medium ${
                  couponFeedback.type === 'success' ? 'text-emerald-700 font-bold' : 'text-[var(--danger)]'
                }`}
              >
                {couponFeedback.text}
              </p>
            )}
          </div>
        )}

        <input type="hidden" name="kode_kupon" value={appliedCoupon?.kode || ''} />
      </Card>

      {/* 6. LOYALTY POINTS REDEMPTION TOGGLE */}
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

          <input type="hidden" name="poin_digunakan" value={pointsToUse} />
        </Card>
      )}

      {/* 7. RINGKASAN BELANJA (STRUK NOTA DASHED) */}
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
          <span className="tabular-nums font-semibold font-sora text-[var(--ink)]">
            {formatRupiah(subtotal)}
          </span>
        </div>

        {/* Ongkir Breakdown */}
        <div className="pt-1.5 flex justify-between items-center text-xs">
          <span className="text-[var(--ink-soft)] flex items-center gap-1">
            <Truck size={12} className="text-[var(--accent)]" />
            Biaya Pengiriman
            {metodePengiriman === 'antar_alamat' && (
              <span className="text-[var(--text-caption)] text-[var(--ink-soft)]">
                ({selectedDusun.nama.split('(')[0].trim()})
              </span>
            )}
          </span>
          <span
            className={`tabular-nums font-bold font-sora ${
              ongkir === 0 ? 'text-emerald-700' : 'text-[var(--ink)]'
            }`}
          >
            {metodePengiriman === 'ambil_di_toko' ? (
              <span className="text-emerald-700 font-bold">Gratis (Ambil Toko)</span>
            ) : ongkir === 0 ? (
              <span className="text-emerald-700 font-bold">Gratis Ongkir</span>
            ) : (
              formatRupiah(ongkir)
            )}
          </span>
        </div>

        {/* Voucher Discount */}
        {couponDiscount > 0 && (
          <div className="pt-1.5 flex justify-between items-center text-xs text-emerald-700 font-semibold">
            <span className="flex items-center gap-1">
              <TicketPercent size={12} /> Voucher ({appliedCoupon?.kode})
            </span>
            <span className="tabular-nums font-sora">-{formatRupiah(couponDiscount)}</span>
          </div>
        )}

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

      {/* Submit Button (Task 7: Anti-Spam & Double Submission Lock) */}
      <button
        type="submit"
        disabled={isPending || isSubmitting}
        className="checkout-btn w-full py-3.5 text-base gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending || isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Memproses Pesanan Anda...</span>
          </>
        ) : (
          <span>Buat Pesanan (COD) — {formatRupiah(finalTotal)}</span>
        )}
      </button>

      {/* Interactive Voucher Picker Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[var(--accent-2)] flex items-center justify-center">
                  <TicketPercent size={18} />
                </div>
                <div>
                  <h3 className="font-sora font-bold text-sm text-[var(--ink)]">Kupon Diskon Toko</h3>
                  <p className="text-[10px] text-[var(--ink-soft)] font-medium">Pilih kupon untuk hemat belanja</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(false)}
                className="w-7 h-7 rounded-full text-[var(--ink-soft)] hover:bg-[var(--paper)] flex items-center justify-center"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-0.5">
              {availableCoupons.map((coupon) => {
                const isSelected = appliedCoupon?.id === coupon.id
                const isEligible = subtotal >= coupon.min_belanja

                return (
                  <div
                    key={coupon.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60'
                        : isEligible
                        ? 'border-[rgba(232,214,205,0.9)] bg-white hover:border-[var(--accent)]'
                        : 'border-gray-200 bg-gray-50/70 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-[var(--accent-bg)] text-[var(--accent-2)] font-sora font-extrabold text-xs">
                            {coupon.kode}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            {coupon.tipe === 'flat'
                              ? `Diskon ${formatRupiah(coupon.nilai)}`
                              : `Diskon ${coupon.nilai}%`}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[var(--ink)] mt-1">{coupon.judul}</p>
                        <p className="text-[10px] text-[var(--ink-soft)] mt-0.5">{coupon.deskripsi}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplyCoupon(coupon.kode)}
                        disabled={!isEligible}
                        className={`press px-3 py-1.5 rounded-xl text-xs font-sora font-bold transition-all shrink-0 ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : isEligible
                            ? 'bg-[var(--accent)] text-white shadow-xs'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isSelected ? 'Terpasang' : 'Gunakan'}
                      </button>
                    </div>

                    {!isEligible && (
                      <p className="text-[10px] text-rose-600 mt-1.5 font-medium">
                        *Minimal belanja {formatRupiah(coupon.min_belanja)} (kurang {formatRupiah(coupon.min_belanja - subtotal)})
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsCouponModalOpen(false)}
              className="w-full py-2.5 rounded-xl border border-[rgba(232,214,205,0.9)] text-xs font-sora font-bold text-[var(--ink)] hover:bg-[var(--paper)]"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </form>
  )
}

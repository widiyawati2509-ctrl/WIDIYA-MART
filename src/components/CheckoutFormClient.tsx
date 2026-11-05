// @ts-nocheck
'use client'

import { useState, useTransition, useCallback, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  formatRupiah,
  DUSUN_PENGENJEK_LIST,
  calculateDusunShipping,
} from '@/lib/utils'
import { CheckoutOrderSummary } from './checkout/CheckoutOrderSummary'
import { CheckoutVoucherModal } from './checkout/CheckoutVoucherModal'
import StoreStatusBadge from './StoreStatusBadge'
import AlertBanner from './AlertBanner'
import { createOrder } from '@/lib/actions/orders'
import { validateCoupon, getAvailableCoupons } from '@/lib/actions/coupons'
import type { Coupon } from '@/types/database'
import {
  Coins,
  Loader2,
  MapPin,
  Truck,
  Store,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Bookmark,
  TicketPercent,
  Check,
  X,
  Gift,
  ArrowRight,
  Phone,
  User,
  FileText,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { UserAddress } from '@/types/database'
import { Card } from '@/components/ui'

// Fixed store coordinates: WIDIYA MART (Pengenjek, Jonggat, Lombok Tengah)
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
  const [isChangingAddress, setIsChangingAddress] = useState(false)

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
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
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
    setIsChangingAddress(false)

    if (addrId === 'manual') {
      setAlamatPengiriman('')
      setUserCoords(null)
      setJarakKm(null)
      setGeoStatus('idle')
      setGeoMessage('')
      setUseGpsDistance(false)
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
        setUseGpsDistance(false)
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
      setGeoMessage('Browser tidak mendukung deteksi GPS.')
      return
    }

    setGeoStatus('locating')
    setGeoMessage('Mencari posisi koordinat Anda...')

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
          setGeoMessage(`Lokasi terdeteksi (~${distance} km dari toko). Radius ≤ 7 km: GRATIS ONGKIR!`)
        } else {
          setGeoMessage(`Lokasi terdeteksi (~${distance} km dari toko). Jarak > 7 km: Ongkir Rp 15.000.`)
        }
      },
      () => {
        setGeoStatus('error')
        setGeoMessage('Izin GPS ditolak atau tidak terdeteksi. Menggunakan tarif dusun.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  // Apply voucher
  const handleApplyCoupon = async (codeToApply: string) => {
    const targetCode = (codeToApply || '').trim().toUpperCase()
    if (!targetCode) {
      setCouponFeedback({ type: 'error', text: 'Masukkan kode voucher terlebih dahulu' })
      return
    }

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
          text: res.error || 'Kode kupon tidak valid atau belum memenuhi syarat',
        })
      }
    } catch {
      setCouponFeedback({ type: 'error', text: 'Terjadi kesalahan saat memeriksa kupon' })
    }
  }

  // Auto-apply coupon from URL param if present (e.g. from Cart or Promo link)
  useEffect(() => {
    if (initialCouponCode && !appliedCoupon) {
      handleApplyCoupon(initialCouponCode)
    }
  }, [initialCouponCode])

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponDiscount(0)
    setCouponFeedback(null)
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
      setErrorMsg('Harap isi alamat lengkap pengiriman untuk kurir toko')
      window.scrollTo({ top: 150, behavior: 'smooth' })
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
          window.scrollTo({ top: 0, behavior: 'smooth' })
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

  const activeSavedAddress = savedAddresses.find((a) => a.id === selectedAddressId)

  return (
    <form onSubmit={handleSubmit} className="space-y-3 px-4 pb-36">
      {/* Visual Step Progress Header */}
      <div className="flex items-center justify-between px-1 py-1 text-xs">
        <div className="flex items-center gap-1.5 font-sora font-bold text-[var(--accent-2)]">
          <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-white text-[11px] flex items-center justify-center">1</span>
          <span>Pengiriman</span>
        </div>
        <div className="h-0.5 w-6 bg-[var(--line)]" />
        <div className="flex items-center gap-1.5 font-sora font-semibold text-[var(--ink-soft)]">
          <span className="w-5 h-5 rounded-full bg-[var(--paper)] border border-[var(--line)] text-[11px] flex items-center justify-center text-[var(--ink-soft)]">2</span>
          <span>Penerima</span>
        </div>
        <div className="h-0.5 w-6 bg-[var(--line)]" />
        <div className="flex items-center gap-1.5 font-sora font-semibold text-[var(--ink-soft)]">
          <span className="w-5 h-5 rounded-full bg-[var(--paper)] border border-[var(--line)] text-[11px] flex items-center justify-center text-[var(--ink-soft)]">3</span>
          <span>Bayar (COD)</span>
        </div>
      </div>

      {/* LANGKAH 1: CARA PENGIRIMAN */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[var(--accent-bg)] text-[var(--accent-2)] font-sora font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h2 className="font-sora font-bold text-xs text-[var(--ink)]">Metode & Tujuan Pengiriman</h2>
          </div>
          <span className="text-[10px] font-sora font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {metodePengiriman === 'ambil_di_toko'
              ? 'Bebas Biaya'
              : ongkir === 0
              ? '🎉 Gratis Ongkir'
              : `Ongkir ${formatRupiah(ongkir)}`}
          </span>
        </div>

        {/* 2-Option Selector: Ambil di Toko vs Diantar ke Rumah */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          {/* Opsi 1: Ambil di Toko */}
          <button
            type="button"
            onClick={() => setMetodePengiriman('ambil_di_toko')}
            className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between relative ${
              metodePengiriman === 'ambil_di_toko'
                ? 'border-[var(--accent)] bg-orange-50/40 shadow-xs ring-1 ring-[var(--accent)]'
                : 'border-[var(--line)] bg-white hover:border-[var(--accent)]/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                  metodePengiriman === 'ambil_di_toko'
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--paper)] text-[var(--ink-soft)]'
                }`}
              >
                <Store size={15} />
              </span>
              {metodePengiriman === 'ambil_di_toko' && (
                <CheckCircle2 size={16} className="text-[var(--accent)]" />
              )}
            </div>
            <div>
              <p className="font-sora font-bold text-xs text-[var(--ink)]">Ambil Sendiri</p>
              <p className="text-[10px] text-emerald-700 font-extrabold mt-0.5">
                Gratis di Kasir (Rp 0)
              </p>
            </div>
          </button>

          {/* Opsi 2: Diantar ke Alamat */}
          <button
            type="button"
            onClick={() => setMetodePengiriman('antar_alamat')}
            className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between relative ${
              metodePengiriman === 'antar_alamat'
                ? 'border-[var(--accent)] bg-orange-50/40 shadow-xs ring-1 ring-[var(--accent)]'
                : 'border-[var(--line)] bg-white hover:border-[var(--accent)]/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                  metodePengiriman === 'antar_alamat'
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--paper)] text-[var(--ink-soft)]'
                }`}
              >
                <Truck size={15} />
              </span>
              {metodePengiriman === 'antar_alamat' && (
                <CheckCircle2 size={16} className="text-[var(--accent)]" />
              )}
            </div>
            <div>
              <p className="font-sora font-bold text-xs text-[var(--ink)]">Diantar Kurir (COD)</p>
              <p className="text-[10px] text-[var(--accent-2)] font-semibold mt-0.5">
                Pengenjek & Sekitar
              </p>
            </div>
          </button>
        </div>

        <input type="hidden" name="metode_pengiriman" value={metodePengiriman} />

        {/* Content Opsi 1: Info Toko Pengambilan */}
        {metodePengiriman === 'ambil_di_toko' ? (
          <div className="p-3 rounded-xl bg-[var(--paper)] border border-[var(--line)]/60 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-sora font-bold text-[var(--ink)] flex items-center gap-1.5">
                <Store size={14} className="text-[var(--accent)]" />
                {store?.nama_toko || 'WIDIYA MART'}
              </span>
              <StoreStatusBadge />
            </div>
            <p className="text-[11px] text-[var(--ink-soft)] flex items-center gap-1">
              <MapPin size={12} className="text-emerald-600 shrink-0" />
              <span>{store?.alamat_toko || 'Desa Pengenjek, Kec. Jonggat'}</span>
            </p>
            <p className="text-[10.5px] text-emerald-800 font-medium pt-1">
              ✓ Barang disiapkan kasir toko. Bisa diambil kapan saja saat status sudah &quot;Siap Diambil&quot;.
            </p>
          </div>
        ) : (
          /* Content Opsi 2: Alamat Pengantaran */
          <div className="space-y-3 pt-1">
            {/* Case A: User has saved addresses and is NOT currently choosing manual */}
            {savedAddresses.length > 0 && selectedAddressId !== 'manual' && activeSavedAddress && !isChangingAddress ? (
              <div className="p-3 rounded-xl bg-orange-50/30 border border-orange-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-sora font-bold bg-[var(--accent-bg)] text-[var(--accent-2)] px-2 py-0.5 rounded-full">
                    <Bookmark size={11} /> {activeSavedAddress.label} {activeSavedAddress.is_default ? '(Utama)' : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsChangingAddress(true)}
                    className="text-[11px] font-sora font-bold text-[var(--accent-2)] hover:underline"
                  >
                    Ganti Alamat
                  </button>
                </div>
                <p className="text-xs font-semibold text-[var(--ink)] leading-snug">
                  {activeSavedAddress.alamat_lengkap}
                </p>
              </div>
            ) : null}

            {/* Case B: Address Picker List when changing address */}
            {savedAddresses.length > 0 && isChangingAddress && (
              <div className="p-3 rounded-xl bg-[var(--paper)] border border-[var(--line)] space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-1 border-b border-[var(--line)]/50">
                  <span className="text-xs font-sora font-bold text-[var(--ink)]">Pilih Alamat Tersimpan:</span>
                  <button
                    type="button"
                    onClick={() => setIsChangingAddress(false)}
                    className="text-[11px] text-[var(--ink-soft)] hover:underline"
                  >
                    Batal
                  </button>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectSavedAddress(addr.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-[var(--accent)] bg-white shadow-xs'
                          : 'border-[var(--line)] bg-white/70 hover:border-[var(--accent)]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-sora font-bold text-[var(--ink)] text-[11px]">{addr.label}</span>
                        {selectedAddressId === addr.id && <Check size={14} className="text-[var(--accent)]" />}
                      </div>
                      <p className="text-[11px] text-[var(--ink-soft)] line-clamp-2">{addr.alamat_lengkap}</p>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleSelectSavedAddress('manual')}
                    className="w-full py-2 rounded-xl border border-dashed border-[var(--accent)]/50 text-xs font-sora font-bold text-[var(--accent-2)] hover:bg-orange-50 text-center"
                  >
                    + Tulis Alamat Baru / Manual
                  </button>
                </div>
              </div>
            )}

            {/* Case C: Manual Address Fields (or if no saved addresses) */}
            {(savedAddresses.length === 0 || selectedAddressId === 'manual') && (
              <div className="space-y-2.5 p-3 rounded-xl bg-[var(--paper)] border border-[var(--line)]">
                {savedAddresses.length > 0 && (
                  <div className="flex justify-between items-center pb-1 border-b border-[var(--line)]/50">
                    <span className="text-xs font-sora font-bold text-[var(--ink)]">Tulis Alamat Baru</span>
                    <button
                      type="button"
                      onClick={() => handleSelectSavedAddress(defaultAddr ? defaultAddr.id : savedAddresses[0].id)}
                      className="text-[11px] font-sora font-bold text-[var(--accent-2)] hover:underline"
                    >
                      ← Pakai Alamat Tersimpan
                    </button>
                  </div>
                )}

                {/* Dusun Picker */}
                <div>
                  <label className="text-[11px] font-sora font-bold text-[var(--ink)] flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-[var(--accent)]" />
                      Pilih Dusun / Wilayah:
                    </span>
                    <span className="text-[10px] text-emerald-700 font-extrabold">
                      {dusunShipping.isFree ? 'Gratis Ongkir' : `Tarif: ${formatRupiah(selectedDusun.ongkir)}`}
                    </span>
                  </label>
                  <select
                    value={selectedDusunId}
                    onChange={(e) => {
                      setUseGpsDistance(false)
                      setSelectedDusunId(e.target.value)
                    }}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] outline-none focus:border-[var(--accent)]"
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
                  </select>
                </div>

                {/* Alamat Lengkap & Patokan */}
                <div>
                  <label className="text-[11px] font-sora font-bold text-[var(--ink)] block mb-1">
                    Patokan Rumah / Alamat Lengkap <span className="text-[var(--danger)]">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={alamatPengiriman}
                    onChange={(e) => setAlamatPengiriman(e.target.value)}
                    placeholder={`Contoh: Dusun ${selectedDusun.nama.split('(')[0].trim()}, RT 02 samping musholla, pagar warna hijau`}
                    required={metodePengiriman === 'antar_alamat'}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] placeholder:text-[var(--ink-soft)] outline-none focus:border-[var(--accent)] resize-none"
                  />
                </div>
              </div>
            )}

            {/* Hidden Input for Form Submission */}
            <input type="hidden" name="alamat_pengiriman" value={alamatPengiriman} />
            <input type="hidden" name="dusun_id" value={selectedDusunId} />
            <input type="hidden" name="dusun_pengiriman" value={selectedDusun.nama} />
            <input type="hidden" name="user_lat" value={userCoords?.lat || ''} />
            <input type="hidden" name="user_lng" value={userCoords?.lng || ''} />

            {/* Dynamic Free Shipping Indicator */}
            {dusunShipping.isFree ? (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-semibold">
                <Check size={14} className="text-emerald-600 shrink-0" />
                <span>Belanjaan Anda memenuhi syarat: <strong>GRATIS ONGKIR</strong> ke {selectedDusun.nama}!</span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between font-medium">
                <span>
                  Belanja <strong>{formatRupiah(dusunShipping.sisaUntukGratis)}</strong> lagi untuk <strong>Gratis Ongkir</strong>
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  Min. {formatRupiah(dusunShipping.minBelanja)}
                </span>
              </div>
            )}

            {/* Estimasi Waktu Tiba */}
            {estimasiMenit !== null && (
              <div className="p-2.5 rounded-xl bg-blue-50/90 border border-blue-200 text-xs text-blue-950 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-blue-600 shrink-0" />
                  <span className="font-semibold">Estimasi Pengantaran: ±{estimasiMenit} Menit</span>
                </div>
                <span className="text-[10px] font-sora font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                  Siap Antar
                </span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* LANGKAH 2: DATA PENERIMA */}
      <Card className="space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-[var(--line)]/50">
          <span className="w-6 h-6 rounded-lg bg-[var(--accent-bg)] text-[var(--accent-2)] font-sora font-bold text-xs flex items-center justify-center">
            2
          </span>
          <div>
            <h2 className="font-sora font-bold text-xs text-[var(--ink)]">Data Penerima Pesanan</h2>
            <p className="text-[10px] text-[var(--ink-soft)]">Kurir/kasir akan menghubungi kontak ini</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="nama_pemesan" className="text-[11px] font-sora font-bold text-[var(--ink)] flex items-center gap-1 mb-1">
              <User size={12} className="text-[var(--accent)]" />
              <span>Nama Lengkap <span className="text-[var(--danger)]">*</span></span>
            </label>
            <input
              id="nama_pemesan"
              name="nama_pemesan"
              defaultValue={profile?.nama || ''}
              required
              placeholder="Nama penerima pesanan"
              className="w-full text-xs p-2.5 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] placeholder:text-[var(--ink-soft)] outline-none focus:border-[var(--accent)] shadow-xs"
            />
          </div>

          <div>
            <label htmlFor="no_hp_pemesan" className="text-[11px] font-sora font-bold text-[var(--ink)] flex items-center gap-1 mb-1">
              <Phone size={12} className="text-[var(--accent)]" />
              <span>No. WhatsApp / HP <span className="text-[var(--danger)]">*</span></span>
            </label>
            <input
              id="no_hp_pemesan"
              type="tel"
              name="no_hp_pemesan"
              defaultValue={profile?.no_hp || ''}
              required
              placeholder="08xxxxxxxxxx"
              className="w-full text-xs p-2.5 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] placeholder:text-[var(--ink-soft)] outline-none focus:border-[var(--accent)] shadow-xs"
            />
          </div>
        </div>

        <div>
          <label htmlFor="catatan" className="text-[11px] font-sora font-bold text-[var(--ink)] flex items-center gap-1 mb-1">
            <FileText size={12} className="text-[var(--accent)]" />
            <span>Catatan untuk Toko (opsional)</span>
          </label>
          <input
            id="catatan"
            name="catatan"
            placeholder="Contoh: Tolong bungkus terpisah, kirim sebelum siang"
            className="w-full text-xs p-2.5 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] placeholder:text-[var(--ink-soft)] outline-none focus:border-[var(--accent)] shadow-xs"
          />
        </div>
      </Card>

      {/* LANGKAH 3: PEMBAYARAN & DISKON (COD) */}
      <Card className="space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-[var(--line)]/50">
          <span className="w-6 h-6 rounded-lg bg-[var(--accent-bg)] text-[var(--accent-2)] font-sora font-bold text-xs flex items-center justify-center">
            3
          </span>
          <h2 className="font-sora font-bold text-xs text-[var(--ink)]">Pembayaran & Diskon Hemat</h2>
        </div>

        {/* COD Guaranteed Banner */}
        <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-200 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="font-sora font-bold text-xs text-[var(--ink)]">
              Bayar di Tempat (COD / QRIS Kasir)
            </p>
            <p className="text-[10px] text-[var(--ink-soft)] font-medium leading-tight">
              Bayar tunai atau scan QRIS saat barang tiba atau diambil di toko. Aman & tanpa transfer.
            </p>
          </div>
        </div>

        {/* Voucher Promo Row */}
        {appliedCoupon ? (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-sora font-extrabold text-emerald-950 truncate">
                  {appliedCoupon.kode} &bull; Hemat {formatRupiah(couponDiscount)}
                </p>
                <p className="text-[10px] text-emerald-700 truncate">{appliedCoupon.judul}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="press px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-rose-50 hover:text-rose-600 transition-colors shrink-0"
            >
              Hapus
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsCouponModalOpen(true)}
            className="w-full p-2.5 rounded-xl border border-dashed border-[var(--accent)]/60 bg-white hover:bg-orange-50/30 flex items-center justify-between text-xs transition-colors"
          >
            <div className="flex items-center gap-2 text-[var(--accent-2)] font-sora font-bold">
              <TicketPercent size={15} />
              <span>Gunakan Voucher Promo</span>
            </div>
            <span className="text-[11px] font-sora font-bold text-[var(--accent-2)] flex items-center">
              <span>{availableCoupons.length > 0 ? `Pilih Kupon (${availableCoupons.length})` : 'Masukkan Kupon'}</span>
              <ChevronRight size={14} />
            </span>
          </button>
        )}

        <input type="hidden" name="kode_kupon" value={appliedCoupon?.kode || ''} />

        {/* Loyalty Points Redemption (jika punya poin) */}
        {canUseLoyalty && (
          <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Coins size={15} />
              </span>
              <div>
                <p className="font-sora font-bold text-xs text-[var(--ink)]">
                  Tukar {availablePoints} Poin Belanja
                </p>
                <p className="text-[10px] text-amber-800 font-medium">
                  {usePoints
                    ? `Potongan diskon ${formatRupiah(discountAmount)}`
                    : `Hemat hingga ${formatRupiah(maxRedeemablePoints * redeemRate)}`}
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
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent)]"></div>
            </label>
          </div>
        )}

        <input type="hidden" name="poin_digunakan" value={pointsToUse} />
      </Card>

      {/* ERROR ALERT BANNER */}
      {errorMsg && (
        <AlertBanner type="error" message={errorMsg} className="animate-fade-in" />
      )}

      {/* RINGKASAN BELANJA (COLLAPSIBLE / ACCORDION) */}
      <CheckoutOrderSummary
        items={items}
        subtotal={subtotal}
        metodePengiriman={metodePengiriman}
        selectedDusun={selectedDusun}
        ongkir={ongkir}
        couponDiscount={couponDiscount}
        appliedCoupon={appliedCoupon}
        discountAmount={discountAmount}
        pointsToUse={pointsToUse}
        finalTotal={finalTotal}
      />

      {/* STICKY BOTTOM CHECKOUT ACTION BAR (§12 Apple Translucent Material) */}
      <div className="fixed bottom-0 inset-x-0 z-40 apple-material-bar px-4 py-3 max-w-[480px] mx-auto flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] text-[var(--ink-soft)] font-medium block">
            Total Tagihan ({metodePengiriman === 'ambil_di_toko' ? 'Ambil Toko' : 'COD'})
          </span>
          <span className="font-sora font-extrabold text-[var(--accent-2)] text-lg tabular-nums leading-tight">
            {formatRupiah(finalTotal)}
          </span>
        </div>

        <button
          type="submit"
          disabled={isPending || isSubmitting}
          className="press flex-1 max-w-[210px] py-3 px-4 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white font-sora font-bold text-xs rounded-xl shadow-btn flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending || isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <span>Pesan Sekarang</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </div>

      {/* Interactive Voucher Picker Modal */}
      <CheckoutVoucherModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        availableCoupons={availableCoupons}
        appliedCoupon={appliedCoupon}
        subtotal={subtotal}
        onApplyCoupon={handleApplyCoupon}
      />
    </form>
  )
}

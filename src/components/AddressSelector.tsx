// @ts-nocheck
'use client'

import { useState, useEffect, useTransition } from 'react'
import { 
  MapPin, 
  ChevronDown, 
  Plus, 
  Check, 
  X, 
  Home, 
  Briefcase, 
  Building2, 
  Navigation, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { UserAddress } from '@/types/database'
import { 
  getUserAddresses, 
  addAddress, 
  setDefaultAddress 
} from '@/lib/actions/addresses'

interface AddressSelectorProps {
  initialAddresses?: UserAddress[]
}

export default function AddressSelector({ initialAddresses }: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<UserAddress[]>(initialAddresses || [])
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(!initialAddresses)
  const [isPending, startTransition] = useTransition()

  // New address form state
  const [newLabel, setNewLabel] = useState('Rumah')
  const [newAlamatLengkap, setNewAlamatLengkap] = useState('')
  const [newLat, setNewLat] = useState<number | null>(null)
  const [newLong, setNewLong] = useState<number | null>(null)
  const [newIsDefault, setNewIsDefault] = useState(false)
  const [geoLocating, setGeoLocating] = useState(false)
  const [geoMessage, setGeoMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  // Load addresses & initialize active address
  useEffect(() => {
    let isMounted = true

    const initAddresses = async () => {
      let list = initialAddresses || []
      if (!initialAddresses) {
        setIsLoading(true)
        const res = await getUserAddresses()
        list = res.data || []
        if (isMounted) {
          setAddresses(list)
          setIsLoading(false)
        }
      }

      // Read from localStorage
      try {
        const saved = localStorage.getItem('pengenjek_selected_address')
        if (saved) {
          const parsed = JSON.parse(saved)
          const matched = list.find((a) => a.id === parsed.id)
          if (matched) {
            if (isMounted) setSelectedAddress(matched)
            return
          }
        }
      } catch (e) {
        console.error('Error reading saved address:', e)
      }

      // Default fallback: find default address or first address
      if (list.length > 0) {
        const def = list.find((a) => a.is_default) || list[0]
        if (isMounted) {
          setSelectedAddress(def)
          try {
            localStorage.setItem('pengenjek_selected_address', JSON.stringify(def))
          } catch (e) {}
        }
      } else {
        if (isMounted) setSelectedAddress(null)
      }
    }

    initAddresses()

    // Listen for custom address update events from other components
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<UserAddress>
      if (customEvent.detail) {
        setSelectedAddress(customEvent.detail)
      } else {
        getUserAddresses().then((res) => {
          if (isMounted && res.data) {
            setAddresses(res.data)
            const def = res.data.find((a) => a.is_default) || res.data[0] || null
            setSelectedAddress(def)
          }
        })
      }
    }

    window.addEventListener('pengenjek_address_changed', handleSync)
    return () => {
      isMounted = false
      window.removeEventListener('pengenjek_address_changed', handleSync)
    }
  }, [initialAddresses])

  // Select an address and persist in localStorage
  const handleSelectAddress = (addr: UserAddress) => {
    setSelectedAddress(addr)
    try {
      localStorage.setItem('pengenjek_selected_address', JSON.stringify(addr))
      window.dispatchEvent(new CustomEvent('pengenjek_address_changed', { detail: addr }))
    } catch (e) {
      console.error('Error saving selected address:', e)
    }
    setIsOpen(false)
  }

  // Set default address
  const handleSetDefault = (e: React.MouseEvent, addr: UserAddress) => {
    e.stopPropagation()
    startTransition(async () => {
      const res = await setDefaultAddress(addr.id)
      if (res?.success) {
        setAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            is_default: a.id === addr.id,
          }))
        )
        const updated = { ...addr, is_default: true }
        setSelectedAddress(updated)
        try {
          localStorage.setItem('pengenjek_selected_address', JSON.stringify(updated))
          window.dispatchEvent(new CustomEvent('pengenjek_address_changed', { detail: updated }))
        } catch (e) {}
        setFeedbackMsg('Alamat utama berhasil diubah')
        setTimeout(() => setFeedbackMsg(null), 2500)
      } else if (res?.error) {
        setFeedbackMsg(res.error)
        setTimeout(() => setFeedbackMsg(null), 3000)
      }
    })
  }

  // Geolocation detector
  const handleDetectLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoMessage('Perangkat/browser Anda tidak mendukung GPS')
      return
    }

    setGeoLocating(true)
    setGeoMessage('Mencari titik koordinat GPS Anda...')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNewLat(pos.coords.latitude)
        setNewLong(pos.coords.longitude)
        setGeoLocating(false)
        setGeoMessage(`GPS terdeteksi (${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)})`)
      },
      (err) => {
        setGeoLocating(false)
        if (err.code === 1) {
          setGeoMessage('Izin akses lokasi ditolak oleh browser')
        } else {
          setGeoMessage('Gagal mendeteksi lokasi GPS')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  // Submit new address
  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!newLabel.trim()) {
      setFormError('Label alamat wajib dipilih atau diisi')
      return
    }
    if (!newAlamatLengkap.trim()) {
      setFormError('Alamat lengkap wajib diisi')
      return
    }

    startTransition(async () => {
      const res = await addAddress({
        label: newLabel.trim(),
        alamat_lengkap: newAlamatLengkap.trim(),
        lat: newLat,
        long: newLong,
        is_default: Boolean(newIsDefault || addresses.length === 0),
      })

      if (res?.error) {
        setFormError(res.error)
      } else if (res?.address) {
        const added = res.address
        setAddresses((prev) => {
          const next = added.is_default ? prev.map((a) => ({ ...a, is_default: false })) : [...prev]
          return [added, ...next]
        })
        handleSelectAddress(added)
        setIsAdding(false)
        setNewAlamatLengkap('')
        setNewLat(null)
        setNewLong(null)
        setGeoMessage(null)
        setFeedbackMsg('Alamat baru berhasil ditambahkan!')
        setTimeout(() => setFeedbackMsg(null), 2500)
      }
    })
  }

  const getLabelIcon = (labelStr: string) => {
    const l = (labelStr || '').toLowerCase()
    if (l.includes('rumah') || l.includes('home')) return <Home size={14} />
    if (l.includes('kantor') || l.includes('office') || l.includes('kerja')) return <Briefcase size={14} />
    if (l.includes('kos') || l.includes('toko') || l.includes('gudang')) return <Building2 size={14} />
    return <MapPin size={14} />
  }

  return (
    <>
      {/* 1. TOP HEADER BARIS ALAMAT (ALFAGIFT PATTERN DENGAN 3D NEUMORPHIC CORAL) */}
      <div className="px-4 mb-3">
        <button
          type="button"
          onClick={() => {
            setIsAdding(false)
            setIsOpen(true)
          }}
          className="w-full text-left bg-white/95 hover:bg-white border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] p-2.5 px-3.5 shadow-xs hover:shadow-3d transition-all flex items-center justify-between gap-2.5 group active:scale-[0.99] focus:outline-none"
          title="Klik untuk memilih atau mengubah alamat pengiriman"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent-bg)] text-[var(--accent-2)] flex items-center justify-center shrink-0 shadow-thumb-inset group-hover:scale-105 transition-transform">
              <MapPin size={16} className="text-[var(--accent)]" />
            </div>

            <div className="min-w-0 flex-1">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-3 w-20 bg-stone-200 animate-pulse rounded" />
                  <div className="h-3 w-32 bg-stone-100 animate-pulse rounded" />
                </div>
              ) : selectedAddress ? (
                <>
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span className="text-[11px] font-medium text-[var(--ink-soft)]">
                      Kirim ke:
                    </span>
                    <span className="font-sora font-bold text-xs text-[var(--ink)] truncate max-w-[120px]">
                      {selectedAddress.label}
                    </span>
                    {selectedAddress.is_default && (
                      <span className="bg-[var(--accent-bg)] text-[var(--accent-2)] text-[10px] font-sora font-extrabold px-1.5 py-0.2 rounded-full border border-[var(--accent)]/30">
                        Utama
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--ink-soft)] truncate font-normal mt-0.5">
                    {selectedAddress.alamat_lengkap}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span className="font-sora font-bold text-xs text-[var(--ink)]">
                      Pilih Alamat Pengiriman
                    </span>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-sora font-bold px-1.5 py-0.2 rounded-full">
                      Atur Alamat
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--ink-soft)] truncate font-normal mt-0.5">
                    Tambah alamat untuk estimasi ongkir & pengantaran
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 text-[var(--accent-2)] shrink-0 pl-1">
            <span className="text-[11px] font-sora font-bold hidden xs:inline">
              Ganti
            </span>
            <ChevronDown size={15} className="group-hover:translate-y-0.5 transition-transform" />
          </div>
        </button>
      </div>

      {/* 2. BOTTOM SHEET / MODAL PILIH ALAMAT */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="fixed inset-0" 
            onClick={() => {
              if (!isPending) setIsOpen(false)
            }} 
          />

          <div 
            className="relative w-full max-w-[480px] bg-[var(--paper)] rounded-t-[28px] border-t border-[var(--line)] shadow-pop max-h-[85vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-300"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Handle & Header */}
            <div className="p-4 border-b border-[var(--line)]/80 bg-white/70 rounded-t-[28px] backdrop-blur-md">
              <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--accent-bg)] text-[var(--accent-2)] flex items-center justify-center font-bold">
                    <MapPin size={15} />
                  </div>
                  <div>
                    <h3 className="font-sora font-bold text-sm text-[var(--ink)]">
                      {isAdding ? 'Tambah Alamat Baru' : 'Alamat Pengiriman'}
                    </h3>
                    <p className="text-[11px] text-[var(--ink-soft)] font-medium">
                      {isAdding ? 'Masukkan detail alamat Anda' : 'Pilih tujuan pengantaran pesanan Anda'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (isAdding) {
                      setIsAdding(false)
                    } else {
                      setIsOpen(false)
                    }
                  }}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-[var(--ink-soft)] flex items-center justify-center transition-all press"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Feedback toast */}
              {feedbackMsg && (
                <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-[var(--radius-sm)] flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span className="font-medium">{feedbackMsg}</span>
                </div>
              )}
            </div>

            {/* Content Body: Address List OR Inline Add Form */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 scrollbar-hide">
              {isAdding ? (
                /* INLINE FORM TAMBAH ALAMAT */
                <form onSubmit={handleCreateAddress} className="space-y-3.5">
                  {formError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-[var(--radius-sm)] flex items-center gap-2">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Preset Label */}
                  <div>
                    <label className="block text-xs font-sora font-bold text-[var(--ink)] mb-1.5">
                      Label Alamat
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Rumah', 'Kantor', 'Kos', 'Toko'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setNewLabel(preset)}
                          className={`px-3 py-1.5 rounded-full text-xs font-sora font-bold transition-all border ${
                            newLabel === preset
                              ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs'
                              : 'bg-white text-[var(--ink-soft)] border-[var(--line)] hover:border-[var(--accent)]'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="Atau ketik label lainnya..."
                      className="mt-2 w-full px-3 py-2 text-xs rounded-[var(--radius-md)] border border-[var(--line)] bg-white focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  {/* Alamat Lengkap */}
                  <div>
                    <label className="block text-xs font-sora font-bold text-[var(--ink)] mb-1">
                      Alamat Lengkap <span className="text-[var(--danger)]">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={newAlamatLengkap}
                      onChange={(e) => setNewAlamatLengkap(e.target.value)}
                      placeholder="Contoh: Dusun Pengenjek Daye RT 02 / RW 01, samping Musholla Al-Ikhlas, rumah pagar hijau"
                      className="w-full p-2.5 text-xs rounded-[var(--radius-md)] border border-[var(--line)] bg-white focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  {/* GPS Geolocation */}
                  <div className="p-3 bg-white rounded-[var(--radius-md)] border border-[var(--line)] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-sora font-bold text-[var(--ink)]">
                        <Navigation size={13} className="text-[var(--accent)]" />
                        <span>Titik Lokasi GPS (Akurasi Ongkir)</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={geoLocating}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-sora font-bold text-[var(--accent-2)] bg-[var(--accent-bg)] hover:bg-[var(--accent-bg)]/80 rounded-full transition-all disabled:opacity-50"
                      >
                        {geoLocating ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
                        <span>{newLat ? 'Deteksi Ulang' : 'Ambil Titik GPS'}</span>
                      </button>
                    </div>

                    {geoMessage && (
                      <p className="text-[11px] text-emerald-700 bg-emerald-50/80 p-1.5 rounded font-medium">
                        {geoMessage}
                      </p>
                    )}
                  </div>

                  {/* Default Checkbox */}
                  <label className="flex items-center gap-2 text-xs text-[var(--ink)] font-medium cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={newIsDefault}
                      onChange={(e) => setNewIsDefault(e.target.checked)}
                      className="w-4 h-4 rounded text-[var(--accent)] accent-[var(--accent)]"
                    />
                    <span>Jadikan sebagai alamat utama</span>
                  </label>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      disabled={isPending}
                      className="flex-1 py-2.5 text-xs font-sora font-bold text-[var(--ink-soft)] bg-white border border-[var(--line)] rounded-[var(--radius-md)] press"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex-1 py-2.5 text-xs font-sora font-bold text-white bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] rounded-[var(--radius-md)] shadow-btn press flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      <span>Simpan Alamat</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* LIST OF SAVED ADDRESSES */
                <>
                  {addresses.length === 0 ? (
                    <div className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] p-5 text-center shadow-3d space-y-2.5">
                      <div className="w-10 h-10 rounded-full bg-[var(--accent-bg)] text-[var(--accent-2)] flex items-center justify-center mx-auto">
                        <MapPin size={20} />
                      </div>
                      <h4 className="font-sora font-bold text-xs text-[var(--ink)]">
                        Belum Ada Alamat Tersimpan
                      </h4>
                      <p className="text-[11px] text-[var(--ink-soft)] max-w-xs mx-auto">
                        Tambahkan alamat rumah atau tempat tinggal Anda untuk memudahkan pengiriman pesanan.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsAdding(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-sora font-bold text-white bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-2 rounded-full shadow-btn press mt-1"
                      >
                        <Plus size={14} />
                        <span>Tambah Alamat Baru</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {addresses.map((addr) => {
                        const isSelected = selectedAddress?.id === addr.id
                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectAddress(addr)}
                            className={`p-3.5 rounded-[var(--radius-lg)] border transition-all cursor-pointer flex items-start gap-3 ${
                              isSelected
                                ? 'bg-[var(--accent-bg)]/40 border-[var(--accent)] shadow-3d ring-1 ring-[var(--accent)]'
                                : 'bg-white border-[var(--line)] hover:border-[var(--accent)]/50 shadow-xs'
                            }`}
                          >
                            {/* Radio indicator */}
                            <div className="pt-0.5 shrink-0">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                                    : 'border-stone-300 bg-white'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[var(--accent-2)]">
                                  {getLabelIcon(addr.label)}
                                </span>
                                <span className="font-sora font-bold text-xs text-[var(--ink)]">
                                  {addr.label}
                                </span>
                                {addr.is_default && (
                                  <span className="bg-[var(--accent-bg)] text-[var(--accent-2)] text-[10px] font-sora font-extrabold px-2 py-0.5 rounded-full border border-[var(--accent)]/30">
                                    Utama
                                  </span>
                                )}
                                {isSelected && (
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-sora font-bold px-1.5 py-0.2 rounded-full">
                                    Aktif
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-[var(--ink-soft)] leading-relaxed line-clamp-2">
                                {addr.alamat_lengkap}
                              </p>

                              {/* Secondary actions: Set default button if not default */}
                              {!addr.is_default && (
                                <div className="mt-2.5 pt-2 border-t border-[var(--line)]/50 flex items-center justify-end">
                                  <button
                                    type="button"
                                    onClick={(e) => handleSetDefault(e, addr)}
                                    disabled={isPending}
                                    className="text-[10px] font-sora font-bold text-[var(--accent-2)] hover:underline flex items-center gap-1"
                                  >
                                    Jadikan Alamat Utama
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Actions Footer */}
            {!isAdding && (
              <div className="p-4 border-t border-[var(--line)]/80 bg-white/80 rounded-b-[28px] backdrop-blur-md flex items-center justify-between gap-3">
                <Link
                  href="/alamat"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1 text-xs font-sora font-semibold text-[var(--ink-soft)] hover:text-[var(--accent-2)] transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>Kelola Semua Alamat</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-sora font-bold text-white bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] rounded-full shadow-btn press active:scale-95 transition-all"
                >
                  <Plus size={14} />
                  <span>+ Tambah Alamat Baru</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// @ts-nocheck
'use client'

import { useState, useTransition } from 'react'
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Navigation, 
  Loader2, 
  X, 
  Home, 
  Briefcase, 
  Building2, 
  Check, 
  AlertCircle 
} from 'lucide-react'
import { UserAddress } from '@/types/database'
import { 
  addAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress 
} from '@/lib/actions/addresses'
import { Card, Button, Badge } from '@/components/ui'

interface UserAddressManagerProps {
  initialAddresses: UserAddress[]
}

export default function UserAddressManager({ initialAddresses }: UserAddressManagerProps) {
  const [addresses, setAddresses] = useState<UserAddress[]>(initialAddresses)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null)

  // Form states
  const [label, setLabel] = useState('')
  const [alamatLengkap, setAlamatLengkap] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [long, setLong] = useState<number | null>(null)
  const [isDefault, setIsDefault] = useState(false)

  // Geolocation & action states
  const [geoLocating, setGeoLocating] = useState(false)
  const [geoMessage, setGeoMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Delete confirm state
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const openAddModal = () => {
    setEditingAddress(null)
    setLabel('Rumah')
    setAlamatLengkap('')
    setLat(null)
    setLong(null)
    setIsDefault(addresses.length === 0)
    setErrorMsg(null)
    setGeoMessage(null)
    setIsModalOpen(true)
  }

  const openEditModal = (addr: UserAddress) => {
    setEditingAddress(addr)
    setLabel(addr.label)
    setAlamatLengkap(addr.alamat_lengkap)
    setLat(addr.lat)
    setLong(addr.long)
    setIsDefault(addr.is_default)
    setErrorMsg(null)
    setGeoMessage(null)
    setIsModalOpen(true)
  }

  const handleDetectLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoMessage('Perangkat/browser Anda tidak mendukung GPS')
      return
    }

    setGeoLocating(true)
    setGeoMessage('Mencari koordinat lokasi Anda saat ini...')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude)
        setLong(pos.coords.longitude)
        setGeoLocating(false)
        setGeoMessage(`GPS berhasil dideteksi: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`)
      },
      (err) => {
        setGeoLocating(false)
        if (err.code === 1) {
          setGeoMessage('Izin akses lokasi ditolak oleh browser/HP')
        } else {
          setGeoMessage('Gagal mendeteksi lokasi GPS')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!label.trim()) {
      setErrorMsg('Label alamat (misal: Rumah, Kantor) wajib diisi')
      return
    }

    if (!alamatLengkap.trim()) {
      setErrorMsg('Alamat lengkap pengiriman wajib diisi')
      return
    }

    startTransition(async () => {
      if (editingAddress) {
        // Update
        const res = await updateAddress(editingAddress.id, {
          label,
          alamat_lengkap: alamatLengkap,
          lat,
          long,
          is_default: isDefault,
        })

        if (res?.error) {
          setErrorMsg(res.error)
        } else if (res?.address) {
          setAddresses((prev) =>
            prev.map((a) => {
              if (a.id === editingAddress.id) return res.address!
              if (isDefault) return { ...a, is_default: false }
              return a
            })
          )
          setSuccessMsg('Alamat berhasil diperbarui')
          setIsModalOpen(false)
          setTimeout(() => setSuccessMsg(null), 3000)
        }
      } else {
        // Add
        const res = await addAddress({
          label,
          alamat_lengkap: alamatLengkap,
          lat,
          long,
          is_default: isDefault,
        })

        if (res?.error) {
          setErrorMsg(res.error)
        } else if (res?.address) {
          setAddresses((prev) => {
            const next = isDefault ? prev.map((a) => ({ ...a, is_default: false })) : [...prev]
            return [res.address!, ...next]
          })
          setSuccessMsg('Alamat baru berhasil ditambahkan')
          setIsModalOpen(false)
          setTimeout(() => setSuccessMsg(null), 3000)
        }
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteAddress(id)
      if (res?.error) {
        setErrorMsg(res.error)
      } else {
        setAddresses((prev) => prev.filter((a) => a.id !== id))
        setDeletingId(null)
        setSuccessMsg('Alamat berhasil dihapus')
        setTimeout(() => setSuccessMsg(null), 3000)
      }
    })
  }

  const handleSetDefault = (id: string) => {
    startTransition(async () => {
      const res = await setDefaultAddress(id)
      if (res?.error) {
        setErrorMsg(res.error)
      } else {
        setAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            is_default: a.id === id,
          }))
        )
        setSuccessMsg('Alamat utama berhasil diubah')
        setTimeout(() => setSuccessMsg(null), 3000)
      }
    })
  }

  const getLabelIcon = (labelStr: string) => {
    const l = labelStr.toLowerCase()
    if (l.includes('rumah') || l.includes('home')) return <Home size={15} />
    if (l.includes('kantor') || l.includes('office') || l.includes('kerja')) return <Briefcase size={15} />
    if (l.includes('kos') || l.includes('toko') || l.includes('gudang')) return <Building2 size={15} />
    return <MapPin size={15} />
  }

  return (
    <div className="space-y-3">
      {/* Header section with Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--accent-bg)] text-[var(--accent-2)] flex items-center justify-center font-bold">
            <MapPin size={15} />
          </span>
          <div>
            <h2 className="font-sora font-bold text-xs text-[var(--ink)]">Daftar Alamat Pengiriman</h2>
            <p className="text-[var(--text-caption)] text-[var(--ink-soft)] font-medium">
              {addresses.length > 0 ? `${addresses.length} alamat tersimpan` : 'Belum ada alamat'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 text-xs font-sora font-bold text-[var(--accent-2)] bg-[var(--accent-bg)] hover:bg-[var(--accent-bg)]/80 px-3 py-1.5 rounded-full transition-all press shadow-xs active:scale-95"
        >
          <Plus size={14} />
          <span>Tambah</span>
        </button>
      </div>

      {/* Global feedback message */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-[var(--radius-md)] flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] p-5 text-center shadow-3d space-y-2">
          <div className="w-10 h-10 rounded-full bg-[var(--accent-bg)] text-[var(--accent-2)] flex items-center justify-center mx-auto">
            <MapPin size={20} />
          </div>
          <p className="text-xs font-sora font-bold text-[var(--ink)]">Belum Menyimpan Alamat</p>
          <p className="text-[var(--text-caption)] text-[var(--ink-soft)] font-medium max-w-xs mx-auto">
            Simpan alamat rumah atau kantor Anda untuk kemudahan checkout otomatis tanpa perlu input ulang.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-2 text-xs font-sora font-bold text-white bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-2 rounded-[var(--radius-md)] shadow-3d press active:scale-95 transition-all inline-flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Tambah Alamat Pertama</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {addresses.map((addr) => {
            const hasGps = addr.lat !== null && addr.long !== null
            const isDeleting = deletingId === addr.id

            return (
              <div
                key={addr.id}
                className={`card-3d bg-white border rounded-[var(--radius-lg)] p-3.5 shadow-3d transition-all ${
                  addr.is_default 
                    ? 'border-[var(--accent-2)]/60 bg-gradient-to-br from-white to-[var(--accent-bg)]/20 shadow-[0_6px_16px_-4px_rgba(255,107,53,0.12)]' 
                    : 'border-[rgba(232,214,205,0.9)]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      addr.is_default ? 'bg-[var(--accent-bg)] text-[var(--accent-2)]' : 'bg-[var(--paper)] text-[var(--ink-soft)]'
                    }`}>
                      {getLabelIcon(addr.label)}
                    </span>
                    <span className="font-sora font-bold text-xs text-[var(--ink)]">
                      {addr.label}
                    </span>
                    {addr.is_default && (
                      <span className="text-[10px] font-sora font-bold text-[var(--accent-2)] bg-[var(--accent-bg)] px-2 py-0.5 rounded-full">
                        Alamat Utama
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(addr)}
                      className="w-7 h-7 rounded-md text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--paper)] flex items-center justify-center transition-colors"
                      title="Edit Alamat"
                      aria-label="Edit Alamat"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(addr.id)}
                      className="w-7 h-7 rounded-md text-[var(--danger)] hover:bg-rose-50 flex items-center justify-center transition-colors"
                      title="Hapus Alamat"
                      aria-label="Hapus Alamat"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[var(--ink)] mt-2 font-medium leading-relaxed">
                  {addr.alamat_lengkap}
                </p>

                <div className="mt-2.5 pt-2 border-t border-[var(--line)] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    {hasGps ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1">
                        <Navigation size={11} className="text-emerald-600" />
                        <span>GPS Aktif</span>
                      </span>
                    ) : (
                      <span className="text-[var(--ink-soft)] bg-[var(--paper)] px-2 py-0.5 rounded-md font-medium">
                        Tanpa GPS
                      </span>
                    )}
                  </div>

                  {!addr.is_default && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      disabled={isPending}
                      className="text-[11px] font-sora font-semibold text-[var(--ink-soft)] hover:text-[var(--accent-2)] transition-colors active:scale-95"
                    >
                      Jadikan Utama
                    </button>
                  )}
                </div>

                {/* Delete Confirmation Prompt */}
                {isDeleting && (
                  <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-[var(--radius-md)] space-y-2 animate-in fade-in duration-150">
                    <p className="text-xs font-medium text-rose-900">
                      Hapus alamat "{addr.label}"?
                    </p>
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setDeletingId(null)}
                        className="px-2.5 py-1 text-xs font-medium text-[var(--ink)] bg-white border rounded-md hover:bg-gray-50"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(addr.id)}
                        disabled={isPending}
                        className="px-2.5 py-1 text-xs font-bold text-white bg-[var(--danger)] rounded-md hover:bg-rose-700 inline-flex items-center gap-1"
                      >
                        {isPending && <Loader2 size={12} className="animate-spin" />}
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Add / Edit Address */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-xl)] w-full max-w-md p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[var(--accent-bg)] text-[var(--accent-2)] flex items-center justify-center font-bold">
                  {editingAddress ? <Edit3 size={16} /> : <Plus size={16} />}
                </span>
                <h3 className="font-sora font-bold text-sm text-[var(--ink)]">
                  {editingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full text-[var(--ink-soft)] hover:bg-[var(--paper)] flex items-center justify-center transition-colors"
                aria-label="Tutup modal"
              >
                <X size={16} />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-[var(--radius-md)] flex items-center gap-2">
                <AlertCircle size={15} className="text-rose-600 shrink-0" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Label */}
              <div>
                <label className="block text-xs font-sora font-bold text-[var(--ink)] mb-1.5">
                  Label Alamat <span className="text-[var(--danger)]">*</span>
                </label>
                <div className="flex gap-1.5 mb-2">
                  {['Rumah', 'Kantor', 'Kos', 'Toko'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setLabel(tag)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                        label === tag
                          ? 'bg-[var(--accent-2)] text-white font-bold shadow-xs'
                          : 'bg-[var(--paper)] text-[var(--ink)] hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Misal: Rumah Utama, Kantor Cabang"
                  className="w-full text-xs px-3 py-2.5 rounded-[var(--radius-md)] border border-[rgba(232,214,205,0.9)] focus:outline-hidden focus:border-[var(--accent-2)] focus:ring-1 focus:ring-[var(--accent-2)]"
                  required
                />
              </div>

              {/* Alamat Lengkap */}
              <div>
                <label className="block text-xs font-sora font-bold text-[var(--ink)] mb-1.5">
                  Alamat Lengkap <span className="text-[var(--danger)]">*</span>
                </label>
                <textarea
                  value={alamatLengkap}
                  onChange={(e) => setAlamatLengkap(e.target.value)}
                  placeholder="Jalan, RT/RW, Dusun/Lingkungan, Desa, Patokan Rumah..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-[var(--radius-md)] border border-[rgba(232,214,205,0.9)] focus:outline-hidden focus:border-[var(--accent-2)] focus:ring-1 focus:ring-[var(--accent-2)] resize-none"
                  required
                />
              </div>

              {/* Koordinat GPS */}
              <div className="p-3 bg-[var(--paper)] rounded-[var(--radius-md)] border border-[var(--line)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sora font-bold text-[var(--ink)] flex items-center gap-1.5">
                    <Navigation size={13} className="text-[var(--accent-2)]" />
                    Titik Koordinat GPS
                  </span>

                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={geoLocating}
                    className="text-xs font-sora font-bold text-[var(--accent-2)] hover:underline inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    {geoLocating ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Mendeteksi...</span>
                      </>
                    ) : (
                      <>
                        <Navigation size={12} />
                        <span>{lat !== null ? 'Perbarui GPS' : 'Deteksi Lokasi'}</span>
                      </>
                    )}
                  </button>
                </div>

                {geoMessage && (
                  <p className="text-[11px] text-[var(--ink-soft)] font-medium leading-tight">
                    {geoMessage}
                  </p>
                )}

                {lat !== null && long !== null && (
                  <div className="pt-1 flex items-center gap-2 text-xs font-mono text-[var(--ink)]">
                    <span className="bg-white px-2 py-1 rounded border text-[11px]">
                      Lat: {lat.toFixed(6)}
                    </span>
                    <span className="bg-white px-2 py-1 rounded border text-[11px]">
                      Long: {long.toFixed(6)}
                    </span>
                  </div>
                )}
                <p className="text-[10px] text-[var(--ink-soft)] italic">
                  *Titik koordinat digunakan untuk kalkulasi otomatis radius gratis ongkir (&le; 7 km).
                </p>
              </div>

              {/* Default checkbox */}
              <label className="flex items-center gap-2 text-xs text-[var(--ink)] font-medium cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-[rgba(232,214,205,0.9)] text-[var(--accent-2)] focus:ring-[var(--accent-2)] w-4 h-4"
                />
                <span>Jadikan sebagai alamat utama pengiriman</span>
              </label>

              {/* Actions */}
              <div className="pt-3 flex gap-2 justify-end border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-sora font-semibold text-[var(--ink)] bg-white border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-md)] hover:bg-[var(--paper)] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-sora font-bold text-white bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] rounded-[var(--radius-md)] shadow-3d press active:scale-95 transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isPending && <Loader2 size={13} className="animate-spin" />}
                  <span>{editingAddress ? 'Simpan Perubahan' : 'Simpan Alamat'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

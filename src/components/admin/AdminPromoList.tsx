// @ts-nocheck
'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { createPromo, updatePromo, deletePromo, type PromoItem } from '@/lib/actions/promos'
import { Sparkles, Plus, Edit2, Trash2, Check, X, ImagePlus, Loader2, Tag, ExternalLink } from 'lucide-react'
import AdminPageTitle from './AdminPageTitle'

interface AdminPromoListProps {
  initialPromos: PromoItem[]
  products: { id: string; nama: string; slug: string; harga: number; image_url?: string | null }[]
}

export default function AdminPromoList({ initialPromos, products }: AdminPromoListProps) {
  const [promos, setPromos] = useState<PromoItem[]>(initialPromos)
  const [isPending, startTransition] = useTransition()
  const [editingPromo, setEditingPromo] = useState<PromoItem | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleOpenNew = () => {
    setEditingPromo(null)
    setShowForm(true)
  }

  const handleOpenEdit = (promo: PromoItem) => {
    setEditingPromo(promo)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Hapus promo ini?')) return

    startTransition(async () => {
      const res = await deletePromo(id)
      if (res.success) {
        setPromos((prev) => prev.filter((p) => p.id !== id))
        setFeedback({ type: 'success', text: 'Promo berhasil dihapus!' })
      } else {
        setFeedback({ type: 'error', text: res.error || 'Gagal menghapus promo' })
      }
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      let res
      if (editingPromo) {
        res = await updatePromo(editingPromo.id, formData)
      } else {
        res = await createPromo(formData)
      }

      if (res.success) {
        setFeedback({
          type: 'success',
          text: editingPromo ? 'Promo berhasil diperbarui!' : 'Promo baru berhasil ditambahkan!',
        })
        setShowForm(false)
        setEditingPromo(null)
        window.location.reload()
      } else {
        setFeedback({ type: 'error', text: res.error || 'Gagal menyimpan promo' })
      }
    })
  }

  return (
    <div className="space-y-4">
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{feedback.text}</span>
          <button type="button" onClick={() => setFeedback(null)}>✕</button>
        </div>
      )}

      {/* Top action bar */}
      <AdminPageTitle
        title="Kelola Promo"
        subtitle="Kelola banner promo homepage dan diskon produk"
        rightSlot={
          <button
            type="button"
            onClick={handleOpenNew}
            className="press inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white text-xs font-sora font-bold shadow-sm active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>Tambah Promo</span>
          </button>
        }
      />

      {/* Promos List */}
      <div className="space-y-3">
        {promos.length === 0 ? (
          <div className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-[20px] p-8 text-center text-xs text-[var(--ink-soft)]">
            Belum ada promo aktif di database. Sistem saat ini menampilkan banner bawaan toko. Tambahkan promo pertama Anda!
          </div>
        ) : (
          promos.map((p) => (
            <div
              key={p.id}
              className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-[20px] p-4 shadow-3d flex items-center gap-3.5"
            >
              {/* Preview image */}
              <div
                className="relative w-16 h-16 rounded-[14px] overflow-hidden shrink-0 flex items-center justify-center text-white"
                style={{ background: p.banner_bg || 'linear-gradient(135deg, #FF6B35 0%, #E85521 100%)' }}
              >
                {p.image_url ? (
                  <Image src={p.image_url} alt={p.judul} fill className="object-contain p-1" sizes="64px" />
                ) : (
                  <Sparkles size={20} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9.5px] font-sora font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                    {p.badge_text || 'PROMO'}
                  </span>
                  {p.diskon_persen && (
                    <span className="text-[9.5px] font-sora font-bold bg-amber-400 text-black px-1.5 py-0.5 rounded-md">
                      -{p.diskon_persen}%
                    </span>
                  )}
                  <span className={`text-[10px] font-bold ${p.is_active ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {p.is_active ? '● Aktif' : '○ Nonaktif'}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-[var(--ink)] line-clamp-1 mt-1">{p.judul}</h3>
                {p.subjudul && <p className="text-[11px] text-[var(--ink-soft)] line-clamp-1">{p.subjudul}</p>}
                {p.products && (
                  <p className="text-[10.5px] text-[var(--accent-2)] font-semibold mt-0.5 line-clamp-1">
                    🔗 Terhubung: {p.products.nama}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(p)}
                  className="press p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs"
                  title="Edit promo"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  disabled={isPending}
                  className="press p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs"
                  title="Hapus promo"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form Tambah / Edit Promo */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="card-3d bg-white rounded-[24px] p-5 w-full max-w-[460px] shadow-2xl border border-[var(--line)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
              <h3 className="font-sora font-bold text-sm text-[var(--ink)]">
                {editingPromo ? 'Edit Promo' : 'Tambah Promo Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">Judul Promo *</label>
                <input
                  type="text"
                  name="judul"
                  defaultValue={editingPromo?.judul}
                  required
                  placeholder="Misal: Diskon Sambal ABC Spesial"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] focus:border-[var(--accent)] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">Subjudul / Keterangan</label>
                <input
                  type="text"
                  name="subjudul"
                  defaultValue={editingPromo?.subjudul ?? ''}
                  placeholder="Misal: Beli 2 gratis 1 hanya hari ini"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] focus:border-[var(--accent)] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[var(--ink)] block mb-1">Badge Text</label>
                  <input
                    type="text"
                    name="badge_text"
                    defaultValue={editingPromo?.badge_text ?? 'PROMO HARI INI'}
                    placeholder="PROMO HARI INI"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] focus:border-[var(--accent)] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[var(--ink)] block mb-1">Diskon (%)</label>
                  <input
                    type="number"
                    name="diskon_persen"
                    min="1"
                    max="99"
                    defaultValue={editingPromo?.diskon_persen ?? ''}
                    placeholder="Misal: 15"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] focus:border-[var(--accent)] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">Hubungkan ke Produk (Opsional)</label>
                <select
                  name="product_id"
                  defaultValue={editingPromo?.product_id ?? ''}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] focus:border-[var(--accent)] outline-none bg-white"
                >
                  <option value="">-- Pilih Produk Terkait --</option>
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">Foto Banner / Produk Promo</label>
                <input
                  type="file"
                  name="image_file"
                  accept="image/*"
                  className="w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[var(--ink)] block mb-1">Urutan Tampil</label>
                  <input
                    type="number"
                    name="urutan"
                    defaultValue={editingPromo?.urutan ?? 0}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      value="true"
                      defaultChecked={editingPromo ? editingPromo.is_active : true}
                      className="rounded"
                    />
                    <span className="font-bold text-[var(--ink)]">Status Aktif</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-2)] text-white font-bold flex items-center justify-center gap-1.5"
                >
                  {isPending && <Loader2 size={13} className="animate-spin" />}
                  <span>{editingPromo ? 'Simpan Perubahan' : 'Terbitkan Promo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

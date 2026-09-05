// @ts-nocheck
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatRupiah, parseProductVariants, type ProductVariant } from '@/lib/utils'
import { updateProduct, deleteProduct } from '@/lib/actions/products'
import { Package, Edit2, Trash2, X, Check, Plus, Layers, Camera, ImagePlus } from 'lucide-react'
import type { Product, Category } from '@/types/database'

interface AdminProductListProps {
  products: (Product & { categories: { nama: string } | null })[]
  categories: Category[]
}

function ProductItemRow({
  product,
  categories,
  isEditing,
  onStartEdit,
  onCancelEdit,
}: {
  product: Product & { categories: { nama: string } | null }
  categories: Category[]
  isEditing: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
}) {
  const { cleanDeskripsi, variants: initialVariants } = parseProductVariants(product.deskripsi)
  const [variants, setVariants] = useState<(ProductVariant & { previewUrl?: string })[]>(initialVariants)

  const handleAddVariant = () => {
    setVariants((prev) => [...prev, { nama: '', harga: undefined, stok: undefined }])
  }

  const handleRemoveVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleVariantFileChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const preview = URL.createObjectURL(file)
      setVariants((prev) => {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], previewUrl: preview }
        return updated
      })
    }
  }

  const handleRemoveVariantImage = (idx: number) => {
    setVariants((prev) => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], image_url: undefined, previewUrl: undefined }
      return updated
    })
  }

  const handleUpdateVariant = (
    idx: number,
    field: keyof ProductVariant,
    value: string | number | undefined
  ) => {
    setVariants((prev) => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], [field]: value }
      return updated
    })
  }

  if (isEditing) {
    return (
      <form
        action={async (fd) => {
          await updateProduct(product.id, fd)
          onCancelEdit()
        }}
        encType="multipart/form-data"
        className="space-y-4 bg-[var(--paper)]/50 p-4 rounded-2xl border border-[var(--line)]"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <span className="text-xs font-sora font-bold text-[var(--ink)] flex items-center gap-1.5">
            <Edit2 className="w-3.5 h-3.5 text-[var(--accent)]" /> Edit Informasi Produk
          </span>
          <span className="text-[var(--text-caption)] text-[var(--ink-soft)]">ID: {product.id.slice(0, 8)}...</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-[var(--text-caption)] font-bold text-[var(--ink)] block mb-1">Nama Produk *</label>
            <input
              type="text"
              name="nama"
              defaultValue={product.nama}
              required
              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-white font-medium"
            />
          </div>

          <div>
            <label className="text-[var(--text-caption)] font-bold text-[var(--ink)] block mb-1">Harga Dasar (Rp) *</label>
            <input
              type="number"
              name="harga"
              defaultValue={product.harga}
              min="0"
              required
              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-white font-sora font-semibold"
              placeholder="Harga"
            />
          </div>

          <div>
            <label className="text-[var(--text-caption)] font-bold text-[var(--ink)] block mb-1">Total Stok *</label>
            <input
              type="number"
              name="stok"
              defaultValue={product.stok}
              min="0"
              required
              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-white font-semibold"
              placeholder="Stok"
            />
          </div>

          <div>
            <label className="text-[var(--text-caption)] font-bold text-[var(--ink)] block mb-1">Kategori</label>
            <select
              name="category_id"
              defaultValue={product.category_id ?? ''}
              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-white"
            >
              <option value="">-- Tanpa Kategori --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[var(--text-caption)] font-bold text-[var(--ink)] block mb-1">Status Penjualan</label>
            <select
              name="is_active"
              defaultValue={product.is_active ? 'true' : 'false'}
              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-white"
            >
              <option value="true">Aktif (Tampil di Toko)</option>
              <option value="false">Nonaktif (Disembunyikan)</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="text-[var(--text-caption)] font-bold text-[var(--ink)] block mb-1">Ganti Foto Produk (Opsional)</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="w-full text-sm text-[var(--ink-soft)] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[var(--accent-bg)] file:text-[var(--accent-2)] cursor-pointer"
            />
          </div>

          <div className="col-span-2">
            <label className="text-[var(--text-caption)] font-bold text-[var(--ink)] block mb-1">Deskripsi Produk</label>
            <textarea
              name="deskripsi"
              defaultValue={cleanDeskripsi}
              rows={2}
              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none bg-white font-inter"
              placeholder="Deskripsi produk..."
            />
          </div>

          {/* Opsi Tambah Varian Produk */}
          <div className="col-span-2 bg-[var(--paper)] border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] p-3.5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[var(--accent-bg)] text-[var(--accent-2)] flex items-center justify-center shadow-xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-sora font-bold text-[var(--ink)]">
                    Varian Produk (Opsi Pilihan)
                  </h4>
                  <p className="text-[var(--text-caption)] text-[var(--ink-soft)] font-medium">
                    Tambahkan opsi seperti rasa, ukuran, atau kemasan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="add-btn px-3 py-1.5 text-xs gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Varian
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="text-center py-3 px-2 text-xs text-[var(--ink-soft)] bg-white/70 rounded-xl border border-dashed border-[var(--line)]">
                Belum ada varian (produk tunggal). Klik <strong className="text-[var(--accent-2)]">&ldquo;+ Tambah Varian&rdquo;</strong> jika produk memiliki pilihan berbeda.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1 text-[var(--text-caption)] font-bold text-[var(--ink-soft)] uppercase tracking-wider">
                  <span className="w-24">Foto Varian</span>
                  <span className="flex-1">Nama Varian *</span>
                  <span className="w-28">Harga (Opsional)</span>
                  <span className="w-20">Stok</span>
                  <span className="w-7 text-center">Aksi</span>
                </div>
                {variants.map((v, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[var(--line)] shadow-xs">
                    {/* Foto Varian Upload & Preview */}
                    <div className="flex items-center gap-1.5 shrink-0 w-24">
                      <div className="relative w-8 h-8 rounded-lg bg-[var(--paper)] border border-[var(--line)] overflow-hidden flex items-center justify-center shrink-0">
                        {v.previewUrl || v.image_url ? (
                          <img
                            src={v.previewUrl || v.image_url}
                            alt={v.nama || `Varian ${idx + 1}`}
                            className="w-full h-full object-contain p-0.5"
                          />
                        ) : (
                          <ImagePlus className="w-3.5 h-3.5 text-gray-400" />
                        )}
                        {(v.previewUrl || v.image_url) && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVariantImage(idx)}
                            className="absolute top-0 right-0 bg-black/60 hover:bg-red-600 text-white p-0.5 rounded-full"
                            title="Hapus foto varian"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        )}
                      </div>
                      <label className="cursor-pointer text-[var(--text-caption)] font-bold text-[var(--accent-2)] bg-[var(--accent-bg)] px-1.5 py-1 rounded-md border border-[rgba(232,85,33,0.15)] hover:bg-[var(--accent-bg)]/80 flex items-center gap-0.5 shrink-0">
                        <Camera className="w-2.5 h-2.5" />
                        <span>{v.image_url || v.previewUrl ? 'Ubah' : '+Foto'}</span>
                        <input
                          type="file"
                          name={`variant_image_${idx}`}
                          accept="image/*"
                          onChange={(e) => handleVariantFileChange(idx, e)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      placeholder="Misal: Merah / Pink / Hitam"
                      value={v.nama}
                      onChange={(e) => handleUpdateVariant(idx, 'nama', e.target.value)}
                      required
                      className="flex-1 border rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                    <input
                      type="number"
                      placeholder="Harga (Rp)"
                      value={v.harga ?? ''}
                      onChange={(e) =>
                        handleUpdateVariant(idx, 'harga', e.target.value ? Number(e.target.value) : undefined)
                      }
                      className="w-28 border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-sora font-medium"
                      title="Kosongkan jika harga sama dengan produk utama"
                    />
                    <input
                      type="number"
                      placeholder="Stok"
                      value={v.stok ?? ''}
                      onChange={(e) =>
                        handleUpdateVariant(idx, 'stok', e.target.value ? Number(e.target.value) : undefined)
                      }
                      className="w-20 border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-medium"
                      title="Stok varian ini"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="w-7 h-7 flex items-center justify-center text-[var(--danger)] hover:brightness-90 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus varian ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Hidden Input serializing variants */}
            <input type="hidden" name="variants" value={JSON.stringify(variants)} />
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-[var(--line)]">
          <button
            type="submit"
            className="save-btn px-4 py-2 text-xs gap-1.5"
          >
            <Check className="w-4 h-4" /> Simpan Perubahan
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            className="cancel-btn px-4 py-2 text-xs font-sora font-bold gap-1.5"
          >
            <X className="w-4 h-4" /> Batal
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 rounded-xl bg-[var(--paper)] border border-[var(--line)] shrink-0 overflow-hidden shadow-xs">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.nama} fill className="object-contain p-1" sizes="48px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--accent)]/40">
            <Package className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <p className="font-bold text-sm text-[var(--ink)] truncate">{product.nama}</p>
          {!product.is_active && (
            <span className="text-[var(--text-caption)] font-bold bg-[var(--paper)] text-[var(--ink-soft)] px-2 py-0.5 rounded-full shrink-0">
              Nonaktif
            </span>
          )}
          {initialVariants.length > 0 && (
            <span className="text-[var(--text-caption)] font-bold bg-[var(--accent-bg)] text-[var(--accent-2)] px-2 py-0.5 rounded-full border border-[rgba(232,85,33,0.15)] flex items-center gap-1 shrink-0">
              <Layers className="w-3 h-3" /> {initialVariants.length} Varian
            </span>
          )}
        </div>

        <p className="text-xs text-[var(--ink-soft)]">
          {product.categories?.nama ?? 'Tanpa Kategori'} · Stok Total: {product.stok}
        </p>

        {initialVariants.length > 0 && (
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <p className="text-[var(--text-caption)] text-[var(--ink-soft)] truncate font-medium">
              Opsi: {initialVariants.map((v) => v.nama).join(' • ')}
            </p>
            <div className="flex items-center gap-1">
              {initialVariants.map((v, i) => v.image_url ? (
                <img
                  key={i}
                  src={v.image_url}
                  alt={v.nama}
                  title={`${v.nama} (dengan foto)`}
                  className="w-4 h-4 rounded-sm object-contain border border-[var(--line)] bg-[var(--paper)]"
                />
              ) : null)}
            </div>
          </div>
        )}

        <p className="text-[var(--accent-2)] font-sora font-bold text-sm mt-0.5 tabular-nums">
          {formatRupiah(product.harga)}
        </p>
      </div>

      <div className="flex gap-1.5 shrink-0">
        <button
          onClick={onStartEdit}
          className="press p-2 rounded-xl bg-white border border-[rgba(232,214,205,0.9)] text-[var(--ink-soft)] hover:text-[var(--accent)] hover:bg-[var(--accent-bg)] shadow-xs transition-colors"
          title="Edit Produk & Varian"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <form action={deleteProduct.bind(null, product.id)}>
          <button
            type="submit"
            className="press p-2 rounded-xl bg-white border border-[rgba(232,214,205,0.9)] text-[var(--danger)] hover:bg-red-50 shadow-xs transition-colors"
            title="Nonaktifkan Produk"
            onClick={(e) => {
              if (!confirm('Nonaktifkan produk ini?')) e.preventDefault()
            }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminProductList({ products, categories }: AdminProductListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  if (products.length === 0) {
    return (
      <div className="bg-white border rounded-2xl text-center py-12 text-gray-400">
        <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p>Belum ada produk</p>
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-xs">
      <div className="divide-y divide-[var(--line)]">
        {products.map((product) => (
          <div key={product.id} className="p-4 transition-colors">
            <ProductItemRow
              product={product}
              categories={categories}
              isEditing={editingId === product.id}
              onStartEdit={() => setEditingId(product.id)}
              onCancelEdit={() => setEditingId(null)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}


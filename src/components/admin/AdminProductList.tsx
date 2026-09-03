// @ts-nocheck
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatRupiah } from '@/lib/utils'
import { updateProduct, deleteProduct } from '@/lib/actions/products'
import { Package, Edit2, Trash2, X, Check } from 'lucide-react'
import type { Product, Category } from '@/types/database'

interface AdminProductListProps {
  products: (Product & { categories: { nama: string } | null })[]
  categories: Category[]
}

export default function AdminProductList({ products, categories }: AdminProductListProps) {
  const [editId, setEditId] = useState<string | null>(null)

  if (products.length === 0) {
    return (
      <div className="bg-white border rounded-2xl text-center py-12 text-gray-400">
        <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p>Belum ada produk</p>
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-2xl overflow-hidden">
      <div className="divide-y">
        {products.map((product) => (
          <div key={product.id} className="p-4">
            {editId === product.id ? (
              <form
                action={async (fd) => {
                  await updateProduct(product.id, fd)
                  setEditId(null)
                }}
                encType="multipart/form-data"
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <input type="text" name="nama" defaultValue={product.nama} required
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <input type="number" name="harga" defaultValue={product.harga} min="0" required
                    className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Harga" />
                  <input type="number" name="stok" defaultValue={product.stok} min="0" required
                    className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Stok" />
                  <select name="category_id" defaultValue={product.category_id ?? ''}
                    className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">-- Tanpa Kategori --</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
                  </select>
                  <select name="is_active" defaultValue={product.is_active ? 'true' : 'false'}
                    className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                  <div className="col-span-2">
                    <input type="file" name="image" accept="image/*"
                      className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-green-50 file:text-green-700" />
                  </div>
                  <textarea name="deskripsi" defaultValue={product.deskripsi ?? ''} rows={2}
                    className="col-span-2 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" placeholder="Deskripsi" />
                </div>
                <div className="flex gap-2">
                  <button type="submit"
                    className="btn-3d btn-3d-green px-4 py-2 rounded-xl text-sm font-medium gap-1.5">
                    <Check className="w-4 h-4" /> Simpan
                  </button>
                  <button type="button" onClick={() => setEditId(null)}
                    className="btn-3d btn-3d-white px-4 py-2 rounded-xl text-sm font-medium gap-1.5">
                    <X className="w-4 h-4" /> Batal
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl bg-gray-50 border shrink-0 overflow-hidden">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.nama} fill className="object-contain p-1" sizes="48px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <Package className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{product.nama}</p>
                    {!product.is_active && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full shrink-0">Nonaktif</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {product.categories?.nama ?? 'Tanpa Kategori'} · Stok: {product.stok}
                  </p>
                  <p className="text-green-600 font-bold text-sm">{formatRupiah(product.harga)}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => setEditId(product.id)}
                    className="btn-3d btn-3d-white p-2 text-blue-600 rounded-xl"
                    title="Edit Produk">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <form action={deleteProduct.bind(null, product.id)}>
                    <button type="submit"
                      className="btn-3d btn-3d-white p-2 text-red-500 hover:text-red-600 rounded-xl"
                      title="Nonaktifkan Produk"
                      onClick={(e) => { if (!confirm('Nonaktifkan produk ini?')) e.preventDefault() }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

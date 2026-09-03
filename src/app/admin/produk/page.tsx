// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/utils'
import { createProduct } from '@/lib/actions/products'
import AdminProductList from '@/components/admin/AdminProductList'
import { Plus } from 'lucide-react'

export default async function AdminProdukPage() {
  const supabase = await createClient()

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('*, categories(nama)')
      .order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('urutan'),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Manajemen Produk</h1>
        <span className="text-sm text-gray-500">{products?.length ?? 0} produk</span>
      </div>

      {/* Add product form */}
      <details className="bg-white border rounded-2xl mb-4 group">
        <summary className="px-4 py-3 font-semibold cursor-pointer flex items-center gap-2 hover:bg-gray-50 rounded-2xl">
          <Plus className="w-4 h-4 text-green-600" />
          Tambah Produk Baru
        </summary>
        <div className="px-4 pb-4 border-t">
          <form action={createProduct} className="mt-4 space-y-4" encType="multipart/form-data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Nama Produk *</label>
                <input type="text" name="nama" required
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Kategori</label>
                <select name="category_id"
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">-- Tanpa Kategori --</option>
                  {(categories ?? []).map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Harga (Rp) *</label>
                <input type="number" name="harga" min="0" required
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Stok *</label>
                <input type="number" name="stok" min="0" defaultValue="0" required
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1">Deskripsi</label>
                <textarea name="deskripsi" rows={3}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Foto Produk</label>
                <input type="file" name="image" accept="image/*"
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
                <select name="is_active"
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>
            </div>
            <button type="submit"
              className="btn-3d btn-3d-green px-6 py-2.5 rounded-xl text-sm font-semibold">
              Simpan Produk
            </button>
          </form>
        </div>
      </details>

      {/* Product list */}
      <AdminProductList products={products ?? []} categories={categories ?? []} />
    </div>
  )
}

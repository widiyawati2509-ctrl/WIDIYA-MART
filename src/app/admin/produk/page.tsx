// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/utils'
import { createProduct } from '@/lib/actions/products'
import AdminProductList from '@/components/admin/AdminProductList'
import AdminPageTitle from '@/components/admin/AdminPageTitle'
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
      <AdminPageTitle
        title="Kelola Produk"
        subtitle="Daftar produk, stok, dan kelola harga jual"
        rightSlot={
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--accent-bg)] text-[var(--accent-2)]">
            {products?.length ?? 0} produk
          </span>
        }
      />

      {/* Add product form */}
      <details className="bg-white border rounded-2xl mb-4 group">
        <summary className="px-4 py-3 font-semibold cursor-pointer flex items-center gap-2 hover:bg-gray-50 rounded-2xl">
          <Plus className="w-4 h-4 text-[var(--accent)]" />
          Tambah Produk Baru
        </summary>
        <div className="px-4 pb-4 border-t">
          <form action={createProduct} className="mt-4 space-y-4" encType="multipart/form-data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--ink)] block mb-1">Nama Produk *</label>
                <input type="text" name="nama" required
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--ink)] block mb-1">Kategori</label>
                <select name="category_id"
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
                  <option value="">-- Tanpa Kategori --</option>
                  {(categories ?? []).map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--ink)] block mb-1">Harga (Rp) *</label>
                <input type="number" name="harga" min="0" required
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--ink)] block mb-1">Stok *</label>
                <input type="number" name="stok" min="0" defaultValue="0" required
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-[var(--ink)] block mb-1">Deskripsi</label>
                <textarea name="deskripsi" rows={3}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--ink)] block mb-1">Foto Produk</label>
                <input type="file" name="image" accept="image/*"
                  className="w-full text-sm text-[var(--ink-soft)] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--accent-bg)] file:text-[var(--accent-2)] hover:file:bg-[var(--accent-bg)]/80" />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--ink)] block mb-1">Status</label>
                <select name="is_active"
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>
            </div>
            <button type="submit"
              className="save-btn px-6 py-2.5 text-sm">
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

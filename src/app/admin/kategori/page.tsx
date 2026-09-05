// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { createCategory } from '@/lib/actions/admin'
import { Plus } from 'lucide-react'
import AdminCategoryList from '@/components/admin/AdminCategoryList'
import AdminPageTitle from '@/components/admin/AdminPageTitle'

export default async function AdminKategoriPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('urutan')

  return (
    <div>
      <AdminPageTitle
        title="Kelola Kategori"
        subtitle="Daftar dan urutan kategori produk"
        rightSlot={
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--accent-bg)] text-[var(--accent-2)]">
            {categories?.length ?? 0} kategori
          </span>
        }
      />

      {/* Add form */}
      <details className="bg-white border rounded-2xl mb-4">
        <summary className="px-4 py-3 font-semibold cursor-pointer flex items-center gap-2 hover:bg-gray-50 rounded-2xl">
          <Plus className="w-4 h-4 text-[var(--accent)]" />
          Tambah Kategori Baru
        </summary>
        <div className="px-4 pb-4 border-t mt-0">
          <form action={createCategory} className="mt-4 flex gap-3">
            <input
              type="text"
              name="nama"
              required
              placeholder="Nama kategori"
              className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <button
              type="submit"
              className="save-btn px-5 py-2 text-sm"
            >
              Simpan
            </button>
          </form>
        </div>
      </details>

      {/* List */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <AdminCategoryList categories={categories ?? []} />
      </div>
    </div>
  )
}

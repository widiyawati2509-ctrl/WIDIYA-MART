// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { createCategory, updateCategory, deleteCategory } from '@/lib/actions/admin'
import { Plus, Trash2 } from 'lucide-react'

export default async function AdminKategoriPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('urutan')

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Manajemen Kategori</h1>

      {/* Add form */}
      <details className="bg-white border rounded-2xl mb-4">
        <summary className="px-4 py-3 font-semibold cursor-pointer flex items-center gap-2 hover:bg-gray-50 rounded-2xl">
          <Plus className="w-4 h-4 text-green-600" />
          Tambah Kategori Baru
        </summary>
        <div className="px-4 pb-4 border-t mt-0">
          <form action={createCategory} className="mt-4 flex gap-3">
            <input
              type="text"
              name="nama"
              required
              placeholder="Nama kategori"
              className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Simpan
            </button>
          </form>
        </div>
      </details>

      {/* List */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        {!categories || categories.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">Belum ada kategori</p>
        ) : (
          <div className="divide-y">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">{cat.nama}</p>
                  <p className="text-xs text-gray-400">/{cat.slug}</p>
                </div>
                <form action={deleteCategory.bind(null, cat.id)}>
                  <button
                    type="submit"
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    onClick={(e) => {
                      if (!confirm(`Hapus kategori "${cat.nama}"?`)) e.preventDefault()
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

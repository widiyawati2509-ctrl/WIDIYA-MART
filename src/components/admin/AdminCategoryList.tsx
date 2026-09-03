// @ts-nocheck
'use client'

import { deleteCategory } from '@/lib/actions/admin'
import { Trash2 } from 'lucide-react'

interface Category {
  id: string
  nama: string
  slug: string
}

export default function AdminCategoryList({ categories }: { categories: Category[] }) {
  if (!categories || categories.length === 0) {
    return <p className="text-center text-gray-400 py-8 text-sm">Belum ada kategori</p>
  }

  return (
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
  )
}

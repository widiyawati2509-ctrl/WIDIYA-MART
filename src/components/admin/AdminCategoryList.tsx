// @ts-nocheck
'use client'

import { deleteCategory } from '@/lib/actions/admin'
import { Trash2, Loader2 } from 'lucide-react'
import { useTransition } from 'react'

interface Category {
  id: string
  nama: string
  slug: string
}

function CategoryItem({ cat }: { cat: Category }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm(`Hapus kategori "${cat.nama}"?`)) return
    startTransition(async () => {
      await deleteCategory(cat.id)
    })
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1">
        <p className="font-medium text-sm">{cat.nama}</p>
        <p className="text-xs text-gray-400">/{cat.slug}</p>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-40"
        title="Hapus Kategori"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin text-red-500" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}

export default function AdminCategoryList({ categories }: { categories: Category[] }) {
  if (!categories || categories.length === 0) {
    return <p className="text-center text-gray-400 py-8 text-sm">Belum ada kategori</p>
  }

  return (
    <div className="divide-y">
      {categories.map((cat) => (
        <CategoryItem key={cat.id} cat={cat} />
      ))}
    </div>
  )
}

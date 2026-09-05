// @ts-nocheck
'use client'

import { deleteCategory } from '@/lib/actions/admin'
import { Trash2, Loader2 } from 'lucide-react'
import { useTransition } from 'react'
import { REAL_CATEGORY_ICONS, LainnyaRealIcon } from '@/components/icons/RealIcons'

interface Category {
  id: string
  nama: string
  slug: string
}

function CategoryItem({ cat }: { cat: Category }) {
  const [isPending, startTransition] = useTransition()
  const normalizedSlug = (cat.slug || '').toLowerCase().trim().replace(/_/g, '-')
  const IconComponent = REAL_CATEGORY_ICONS[normalizedSlug] ?? LainnyaRealIcon

  const handleDelete = () => {
    if (!confirm(`Hapus kategori "${cat.nama}"?`)) return
    startTransition(async () => {
      await deleteCategory(cat.id)
    })
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-10 h-10 rounded-xl bg-[var(--accent-bg)] shadow-[inset_0_2px_4px_rgba(232,85,33,0.08)] flex items-center justify-center p-1 shrink-0">
        <IconComponent className="w-7 h-7" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-[var(--ink)]">{cat.nama}</p>
        <p className="text-xs text-[var(--ink-soft)] font-mono">/{cat.slug}</p>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        className="press p-2 rounded-xl bg-white border border-[rgba(232,214,205,0.9)] text-[var(--danger)] hover:bg-red-50 transition-colors disabled:opacity-40 shadow-xs"
        title="Hapus Kategori"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin text-[var(--danger)]" />
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

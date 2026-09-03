// @ts-nocheck
import Link from 'next/link'
import type { Category } from '@/types/database'

interface CategoryGridProps {
  categories: Category[]
}

const categoryEmojis: Record<string, string> = {
  sembako: '🌾',
  minuman: '🥤',
  snack: '🍪',
  kebersihan: '🧹',
  perawatan: '🧴',
  lainnya: '📦',
}

const categoryChipStyles: Record<string, string> = {
  sembako: 'chip-3d-warning',
  minuman: 'chip-3d-info',
  snack: 'chip-3d-accent',
  kebersihan: 'chip-3d-positive',
  perawatan: 'chip-3d-negative',
  lainnya: 'chip-3d-neutral',
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/kategori?kategori=${cat.slug}`}
          prefetch={true}
          className="btn-3d-card flex flex-col items-center gap-1.5 bg-white border rounded-2xl p-3 hover:border-green-300 hover:bg-green-50 transition-all text-center"
        >
          <div className={`w-12 h-12 rounded-2xl chip-3d ${categoryChipStyles[cat.slug] ?? 'chip-3d-accent'} text-2xl shadow-sm mb-0.5`}>
            {categoryEmojis[cat.slug] ?? '📦'}
          </div>
          <span className="text-xs font-semibold text-gray-700 leading-tight">{cat.nama}</span>
        </Link>
      ))}
    </div>
  )
}

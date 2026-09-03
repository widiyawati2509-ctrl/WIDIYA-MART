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

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/kategori?kategori=${cat.slug}`}
          className="flex flex-col items-center gap-1.5 bg-white border rounded-2xl p-3 hover:border-green-300 hover:bg-green-50 transition-colors text-center"
        >
          <span className="text-2xl">{categoryEmojis[cat.slug] ?? '📦'}</span>
          <span className="text-xs font-medium text-gray-700 leading-tight">{cat.nama}</span>
        </Link>
      ))}
    </div>
  )
}

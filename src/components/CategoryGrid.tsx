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
    <div className="grid grid-cols-3 gap-2.5">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/kategori?kategori=${cat.slug}`}
          prefetch={true}
          className="card-3d flex flex-col items-center gap-2 bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-3 text-center shadow-3d hover:border-[var(--accent)] transition-all"
        >
          <div className="w-12 h-12 rounded-[16px] bg-[var(--accent-bg)] shadow-[inset_0_2px_4px_rgba(232,85,33,0.08)] flex items-center justify-center text-2xl">
            {categoryEmojis[cat.slug] ?? '📦'}
          </div>
          <span className="text-xs font-semibold text-[var(--ink)] leading-tight">
            {cat.nama}
          </span>
        </Link>
      ))}
    </div>
  )
}

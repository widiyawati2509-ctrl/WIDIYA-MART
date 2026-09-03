// @ts-nocheck
import Link from 'next/link'
import type { Category } from '@/types/database'
import { REAL_CATEGORY_ICONS, LainnyaRealIcon } from '@/components/icons/RealIcons'

interface CategoryGridProps {
  categories: Category[]
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {categories.map((cat) => {
        const IconComponent = REAL_CATEGORY_ICONS[cat.slug] ?? LainnyaRealIcon

        return (
          <Link
            key={cat.id}
            href={`/kategori?kategori=${cat.slug}`}
            prefetch={true}
            className="card-3d flex flex-col items-center gap-2 bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-3 text-center shadow-3d hover:border-[var(--accent)] transition-all"
          >
            <div className="w-13 h-13 rounded-[16px] bg-[var(--accent-bg)] shadow-[inset_0_2px_4px_rgba(232,85,33,0.08)] flex items-center justify-center p-1">
              <IconComponent className="w-10 h-10" />
            </div>
            <span className="text-xs font-sora font-bold text-[var(--ink)] leading-tight">
              {cat.nama}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

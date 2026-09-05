// @ts-nocheck
import Link from 'next/link'
import type { Category } from '@/types/database'
import { REAL_CATEGORY_ICONS, LainnyaRealIcon } from '@/components/icons/RealIcons'

interface CategoryGridProps {
  categories: Category[]
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1.5 -mx-4 px-4">
      {categories.map((cat) => {
        const normalizedSlug = (cat.slug || '').toLowerCase().trim().replace(/_/g, '-')
        const IconComponent = REAL_CATEGORY_ICONS[normalizedSlug] ?? LainnyaRealIcon

        return (
          <Link
            key={cat.id}
            href={`/kategori?kategori=${cat.slug}`}
            prefetch={true}
            className="press flex flex-col items-center shrink-0 group focus:outline-none"
          >
            <div className="w-13 h-13 rounded-[var(--radius-lg)] bg-card border border-[rgba(232,214,205,0.9)] shadow-3d flex items-center justify-center p-1.5 group-hover:border-[var(--accent)] group-hover:scale-105 transition-all">
              <div className="w-full h-full rounded-[var(--radius-md)] bg-[var(--accent-bg)] shadow-[inset_0_2px_4px_rgba(232,85,33,0.06)] flex items-center justify-center p-1">
                <IconComponent className="w-8 h-8" />
              </div>
            </div>
            <span className="text-[var(--text-caption)] font-sora font-bold text-[var(--ink)] leading-tight text-center truncate max-w-[62px] mt-1.5 group-hover:text-[var(--accent-2)] transition-colors">
              {cat.nama}
            </span>
          </Link>
        )
      })}
    </div>
  )
}


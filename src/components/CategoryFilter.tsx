// @ts-nocheck
'use client'

import Link from 'next/link'
import type { Category } from '@/types/database'

interface CategoryFilterProps {
  categories: Category[]
  activeSlug?: string
}

export default function CategoryFilter({ categories, activeSlug }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide py-1">
      <Link
        href="/kategori"
        className={`press inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition shrink-0 ${
          !activeSlug
            ? 'bg-accent-subtle text-accent-press ring-1 ring-inset ring-accent/20'
            : 'glass text-muted-strong hover:bg-zinc-100'
        }`}
      >
        Semua
      </Link>
      {categories.map((cat) => {
        const isActive = activeSlug === cat.slug
        return (
          <Link
            key={cat.id}
            href={`/kategori?kategori=${cat.slug}`}
            className={`press inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition shrink-0 ${
              isActive
                ? 'bg-accent-subtle text-accent-press ring-1 ring-inset ring-accent/20'
                : 'glass text-muted-strong hover:bg-zinc-100'
            }`}
          >
            {cat.nama}
          </Link>
        )
      })}
    </div>
  )
}

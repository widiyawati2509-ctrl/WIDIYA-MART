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
        prefetch={true}
        className={`cat-chip shrink-0 ${!activeSlug ? 'active' : ''}`}
      >
        Semua
      </Link>
      {categories.map((cat) => {
        const isActive = activeSlug === cat.slug
        return (
          <Link
            key={cat.id}
            href={`/kategori?kategori=${cat.slug}`}
            prefetch={true}
            className={`cat-chip shrink-0 ${isActive ? 'active' : ''}`}
          >
            {cat.nama}
          </Link>
        )
      })}
    </div>
  )
}

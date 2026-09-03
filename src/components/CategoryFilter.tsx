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
    <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-hide">
      <Link
        href="/kategori"
        className={`btn-3d flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
          !activeSlug
            ? 'btn-3d-green'
            : 'btn-3d-white text-gray-700'
        }`}
      >
        Semua
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/kategori?kategori=${cat.slug}`}
          className={`btn-3d flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
            activeSlug === cat.slug
              ? 'btn-3d-green'
              : 'btn-3d-white text-gray-700'
          }`}
        >
          {cat.nama}
        </Link>
      ))}
    </div>
  )
}

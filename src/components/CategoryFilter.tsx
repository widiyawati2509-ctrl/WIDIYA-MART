// @ts-nocheck
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Category } from '@/types/database'

interface CategoryFilterProps {
  categories: Category[]
  activeSlug?: string
}

export default function CategoryFilter({ categories, activeSlug }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <Link
        href="/kategori"
        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          !activeSlug
            ? 'bg-green-600 text-white'
            : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'
        }`}
      >
        Semua
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/kategori?kategori=${cat.slug}`}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeSlug === cat.slug
              ? 'bg-green-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'
          }`}
        >
          {cat.nama}
        </Link>
      ))}
    </div>
  )
}

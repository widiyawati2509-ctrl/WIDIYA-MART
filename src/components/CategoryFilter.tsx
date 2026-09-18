// @ts-nocheck
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Category } from '@/types/database'
import { setCachedCategories } from '@/lib/categoryCache'

interface CategoryFilterProps {
  categories: Category[]
  activeSlug?: string
}

export default function CategoryFilter({ categories, activeSlug }: CategoryFilterProps) {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (categories && categories.length > 0) {
      setCachedCategories(categories)
    }
  }, [categories])

  const buildCategoryUrl = (slug?: string) => {
    const params = new URLSearchParams(searchParams)
    if (slug) {
      params.set('kategori', slug)
    } else {
      params.delete('kategori')
    }
    const qs = params.toString()
    return qs ? `/kategori?${qs}` : '/kategori'
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide py-1">
      <Link
        href={buildCategoryUrl()}
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
            href={buildCategoryUrl(cat.slug)}
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

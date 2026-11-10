// @ts-nocheck
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Category } from '@/types/database'
import { setCachedCategories } from '@/lib/categoryCache'
import { Store, Tag } from 'lucide-react'

interface CategoryFilterProps {
  categories: Category[]
  activeSlug?: string
  variant?: 'rail' | 'chips'
}

export default function CategoryFilter({
  categories,
  activeSlug,
  variant = 'chips',
}: CategoryFilterProps) {
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

  if (variant === 'chips') {
    return (
      <nav
        aria-label="Tab Kategori Produk"
        className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide mask-fade-right py-1 pr-4 select-none"
      >
        <Link
          href={buildCategoryUrl()}
          prefetch={true}
          aria-current={!activeSlug ? 'page' : undefined}
          className={`press shrink-0 px-3.5 py-2 rounded-full text-xs font-sora font-bold transition-all flex items-center gap-1.5 border ${
            !activeSlug
              ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs'
              : 'bg-white text-[var(--ink-soft)] border-[rgba(232,214,205,0.9)] hover:border-[var(--accent)]/60 hover:text-[var(--ink)]'
          }`}
        >
          <Store size={13} aria-hidden="true" />
          <span>Semua</span>
        </Link>
        {categories.map((cat) => {
          const isActive = activeSlug === cat.slug
          return (
            <Link
              key={cat.id}
              href={buildCategoryUrl(cat.slug)}
              prefetch={true}
              aria-current={isActive ? 'page' : undefined}
              className={`press shrink-0 px-3.5 py-2 rounded-full text-xs font-sora font-bold transition-all flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs'
                  : 'bg-white text-[var(--ink-soft)] border-[rgba(232,214,205,0.9)] hover:border-[var(--accent)]/60 hover:text-[var(--ink)]'
              }`}
            >
              <Tag size={12} aria-hidden="true" className={isActive ? 'text-white' : 'text-[var(--accent)]'} />
              <span>{cat.nama}</span>
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <aside
      aria-label="Navigasi Kategori Minimarket"
      className="w-[82px] sm:w-[92px] shrink-0 sticky top-[16px] max-h-[calc(100vh-110px)] overflow-y-auto scrollbar-hide mask-fade-bottom flex flex-col gap-1.5 rounded-r-[var(--radius-md)] bg-white/85 backdrop-blur-md border-y border-r border-[rgba(232,214,205,0.9)] p-1.5 pb-5 shadow-[var(--shadow-sm)]"
    >
      <div className="px-1.5 pt-1 pb-0.5 text-[9px] font-extrabold uppercase tracking-[0.06em] text-[var(--ink-faint)] text-center">
        Kategori
      </div>
      <Link
        href={buildCategoryUrl()}
        prefetch={true}
        aria-current={!activeSlug ? 'page' : undefined}
        className={`press relative flex flex-col items-center justify-center text-center gap-1 px-1.5 py-2 rounded-[var(--radius-sm)] transition-[background-color,color,box-shadow,transform] duration-200 ${
          !activeSlug
            ? 'bg-[var(--accent-bg)] text-[var(--accent-deep)] font-extrabold shadow-[inset_0_0_0_1px_rgba(255,107,53,0.28)]'
            : 'text-[var(--ink-soft)] hover:bg-[var(--bg)] font-semibold'
        }`}
      >
        {!activeSlug && (
          <span
            aria-hidden="true"
            className="absolute left-0 top-2 bottom-2 w-[3.5px] rounded-r-full bg-[var(--accent)]"
          />
        )}
        <span
          aria-hidden="true"
          className={`w-8 h-8 rounded-[10px] flex items-center justify-center text-[17px] transition-transform ${
            !activeSlug
              ? 'bg-white shadow-[0_2px_6px_rgba(232,85,33,0.18)] scale-105'
              : 'bg-[var(--bg)]'
          }`}
        >
          🏪
        </span>
        <span className="text-[10.5px] leading-[1.15] line-clamp-2 break-words">
          Semua
        </span>
      </Link>
      {categories.map((cat) => {
        const isActive = activeSlug === cat.slug
        return (
          <Link
            key={cat.id}
            href={buildCategoryUrl(cat.slug)}
            prefetch={true}
            aria-current={isActive ? 'page' : undefined}
            className={`press relative flex flex-col items-center justify-center text-center gap-1 px-1.5 py-2 rounded-[var(--radius-sm)] transition-[background-color,color,box-shadow,transform] duration-200 ${
              isActive
                ? 'bg-[var(--accent-bg)] text-[var(--accent-deep)] font-extrabold shadow-[inset_0_0_0_1px_rgba(255,107,53,0.28)]'
                : 'text-[var(--ink-soft)] hover:bg-[var(--bg)] font-semibold'
            }`}
          >
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute left-0 top-2 bottom-2 w-[3.5px] rounded-r-full bg-[var(--accent)]"
              />
            )}
            <span
              aria-hidden="true"
              className={`w-8 h-8 rounded-[10px] flex items-center justify-center text-[17px] transition-transform ${
                isActive
                  ? 'bg-white shadow-[0_2px_6px_rgba(232,85,33,0.18)] scale-105'
                  : 'bg-[var(--bg)]'
              }`}
            >
              {getCategoryIconEmoji(cat.nama)}
            </span>
            <span className="text-[10.5px] leading-[1.15] line-clamp-2 break-words">
              {cat.nama}
            </span>
          </Link>
        )
      })}
    </aside>
  )
}

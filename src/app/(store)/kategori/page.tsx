// @ts-nocheck
import { createPublicClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import CategoryFilter from '@/components/CategoryFilter'
import SearchBar from '@/components/SearchBar'
import { EmptyState } from '@/components/ui'
import { Package } from 'lucide-react'

export const revalidate = 30

interface KategoriPageProps {
  searchParams: Promise<{ q?: string; kategori?: string }>
}

export default async function KategoriPage({ searchParams }: KategoriPageProps) {
  const { q, kategori } = await searchParams
  const supabase = createPublicClient()

  const { data: categories } = await supabase.from('categories').select('*').order('urutan')

  let query = supabase
    .from('products')
    .select('*, categories(nama, slug)')
    .eq('is_active', true)
    .gt('stok', 0)

  if (q) query = query.ilike('nama', `%${q}%`)
  if (kategori && categories) {
    const matchedCategory = categories.find((c) => c.slug === kategori)
    if (matchedCategory) {
      query = query.eq('category_id', matchedCategory.id)
    }
  }

  const { data: products } = await query.order('nama')

  return (
    <div className="w-full pb-28">
      {/* Toko Kita Frosted Top Header */}
      <div className="top-header sticky top-0 z-40 px-4 pt-3.5 pb-3 border-b border-[rgba(232,214,205,0.8)] shadow-[0_4px_20px_-2px_rgba(43,24,16,0.06)] bg-[rgba(250,240,235,0.92)] backdrop-blur-md mb-3.5">
        <h1 className="font-sora font-bold text-base text-[var(--ink)] mb-2.5">Katalog Produk</h1>
        <SearchBar defaultValue={q} />
      </div>

      <div className="px-4 mb-3.5">
        <CategoryFilter categories={categories ?? []} activeSlug={kategori} />
      </div>

      <div className="px-4">
        {products && products.length > 0 ? (
          <>
            <p className="text-xs font-semibold text-[var(--ink-soft)] mb-3">
              {products.length} produk ditemukan
            </p>
            <div className="grid grid-cols-2 gap-3.5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Package}
            message="Produk tidak ditemukan. Coba gunakan kata kunci lain atau pilih kategori berbeda."
            actionHref="/kategori"
            actionLabel="Semua Produk"
          />
        )}
      </div>
    </div>
  )
}

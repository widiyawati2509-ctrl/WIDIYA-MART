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
    <div className="max-w-lg mx-auto pb-28">
      {/* Header */}
      <div className="glass sticky top-0 z-40 px-4 pt-4 pb-3 border-b border-border mb-3">
        <h1 className="font-bold text-lg text-ink mb-2.5">Katalog Produk</h1>
        <SearchBar defaultValue={q} />
      </div>

      <div className="px-4 mb-3">
        <CategoryFilter categories={categories ?? []} activeSlug={kategori} />
      </div>

      <div className="px-4">
        {products && products.length > 0 ? (
          <>
            <p className="text-xs font-medium text-muted mb-3">{products.length} produk ditemukan</p>
            <div className="grid grid-cols-2 gap-3">
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

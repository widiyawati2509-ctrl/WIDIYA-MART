// @ts-nocheck
import { createPublicClient } from '@/lib/supabase/server'
import CategoryFilter from '@/components/CategoryFilter'
import SearchBar from '@/components/SearchBar'
import PageHeader from '@/components/PageHeader'
import CatalogProductList from '@/components/CatalogProductList'
import { EmptyState } from '@/components/ui'
import { Package } from 'lucide-react'

export const revalidate = 30
const PAGE_SIZE = 12

interface KategoriPageProps {
  searchParams: Promise<{ q?: string; kategori?: string }>
}

export default async function KategoriPage({ searchParams }: KategoriPageProps) {
  const { q, kategori } = await searchParams
  const supabase = createPublicClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, nama, slug, urutan')
    .order('urutan')

  let query = supabase
    .from('products')
    .select('id, nama, slug, harga, stok, image_url, category_id, categories(nama, slug)', { count: 'exact' })
    .eq('is_active', true)
    .gt('stok', 0)

  if (q) query = query.ilike('nama', `%${q}%`)
  if (kategori && categories) {
    const matchedCategory = categories.find((c) => c.slug === kategori)
    if (matchedCategory) {
      query = query.eq('category_id', matchedCategory.id)
    }
  }

  const { data: products, count } = await query
    .order('nama')
    .range(0, PAGE_SIZE - 1)

  const totalCount = count ?? products?.length ?? 0

  return (
    <div className="w-full pb-28">
      {/* Top Header */}
      <PageHeader
        title="Katalog Produk"
        subtitle="Cari dan temukan sembako & kebutuhan harian"
        className="mb-3.5"
      >
        <SearchBar defaultValue={q} />
      </PageHeader>

      <div className="px-4 mb-3.5">
        <CategoryFilter categories={categories ?? []} activeSlug={kategori} />
      </div>

      <div className="px-4">
        {products && products.length > 0 ? (
          <>
            <p className="text-xs font-semibold text-[var(--ink-soft)] mb-3">
              {totalCount} produk ditemukan
            </p>
            <CatalogProductList
              initialProducts={products}
              totalCount={totalCount}
              kategori={kategori}
              q={q}
              pageSize={PAGE_SIZE}
            />
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

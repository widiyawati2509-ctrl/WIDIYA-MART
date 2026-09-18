// @ts-nocheck
import { createPublicClient } from '@/lib/supabase/server'
import { getActivePromoProductIds } from '@/lib/actions/promos'
import CategoryFilter from '@/components/CategoryFilter'
import CatalogSortFilterBar from '@/components/CatalogSortFilterBar'
import SearchBar from '@/components/SearchBar'
import PageHeader from '@/components/PageHeader'
import CatalogProductList from '@/components/CatalogProductList'
import { EmptyState } from '@/components/ui'
import { Package } from 'lucide-react'

export const revalidate = 30
const PAGE_SIZE = 12

interface KategoriPageProps {
  searchParams: Promise<{
    q?: string
    kategori?: string
    urutan?: string
    filter?: string
  }>
}

export default async function KategoriPage({ searchParams }: KategoriPageProps) {
  const { q, kategori, urutan, filter } = await searchParams
  const supabase = createPublicClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, nama, slug, urutan')
    .order('urutan')

  let query = supabase
    .from('products')
    .select('id, nama, slug, harga, stok, image_url, category_id, categories(nama, slug)', { count: 'exact' })
    .eq('is_active', true)

  // Stock / Promo filter
  if (filter === 'promo') {
    const promoIds = await getActivePromoProductIds()
    if (promoIds.length > 0) {
      query = query.in('id', promoIds)
    } else {
      query = query.eq('id', '00000000-0000-0000-0000-000000000000')
    }
  } else if (filter === 'ready' || !filter) {
    query = query.gt('stok', 0)
  }

  // Search keyword
  if (q) query = query.ilike('nama', `%${q}%`)

  // Category filter
  if (kategori && categories) {
    const matchedCategory = categories.find((c) => c.slug === kategori)
    if (matchedCategory) {
      query = query.eq('category_id', matchedCategory.id)
    }
  }

  // Price sorting
  if (urutan === 'termurah') {
    query = query.order('harga', { ascending: true })
  } else if (urutan === 'termahal') {
    query = query.order('harga', { ascending: false })
  } else if (urutan === 'terbaru') {
    query = query.order('created_at', { ascending: false })
  } else {
    query = query.order('nama', { ascending: true })
  }

  const { data: products, count } = await query.range(0, PAGE_SIZE - 1)
  const totalCount = count ?? products?.length ?? 0

  return (
    <div className="w-full pb-32">
      {/* Top Header */}
      <PageHeader
        title="Katalog Produk"
        subtitle="Cari dan temukan sembako & kebutuhan harian"
        className="mb-3.5"
      >
        <SearchBar defaultValue={q} />
      </PageHeader>

      {/* Category Chips Bar */}
      <div className="px-4 mb-2">
        <CategoryFilter categories={categories ?? []} activeSlug={kategori} />
      </div>

      {/* Sorting & Quick Filter Toolbar */}
      <div className="px-4 mb-3.5">
        <CatalogSortFilterBar activeSort={urutan} activeFilter={filter} />
      </div>

      {/* Product List */}
      <div className="px-4">
        {products && products.length > 0 ? (
          <>
            <div className="flex items-center justify-between text-xs text-[var(--ink-soft)] font-medium mb-3">
              <span>
                Menampilkan <strong className="text-[var(--ink)]">{products.length}</strong> dari{' '}
                <strong className="text-[var(--ink)]">{totalCount}</strong> produk
              </span>
              {q && (
                <span className="truncate max-w-[150px] italic">
                  untuk &quot;{q}&quot;
                </span>
              )}
            </div>
            <CatalogProductList
              initialProducts={products}
              totalCount={totalCount}
              kategori={kategori}
              q={q}
              urutan={urutan}
              filter={filter}
              pageSize={PAGE_SIZE}
            />
          </>
        ) : (
          <EmptyState
            icon={Package}
            message={
              q
                ? `Tidak ada produk yang cocok dengan pencarian "${q}".`
                : 'Belum ada produk yang sesuai dengan filter yang dipilih.'
            }
            actionHref="/kategori"
            actionLabel="Reset Semua Filter"
          />
        )}
      </div>
    </div>
  )
}

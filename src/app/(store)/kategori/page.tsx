// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import CategoryFilter from '@/components/CategoryFilter'
import SearchBar from '@/components/SearchBar'
import { Package } from 'lucide-react'

interface KategoriPageProps {
  searchParams: Promise<{ q?: string; kategori?: string }>
}

export default async function KategoriPage({ searchParams }: KategoriPageProps) {
  const { q, kategori } = await searchParams
  const supabase = await createClient()

  const [{ data: categories }, productsResult] = await Promise.all([
    supabase.from('categories').select('*').order('urutan'),
    (async () => {
      let query = supabase
        .from('products')
        .select('*, categories(nama, slug)')
        .eq('is_active', true)
        .gt('stok', 0)

      if (q) query = query.ilike('nama', `%${q}%`)
      if (kategori) {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', kategori)
          .single()
        if (cat) query = query.eq('category_id', cat.id)
      }

      return query.order('nama')
    })(),
  ])

  const products = productsResult.data

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white sticky top-0 z-10 px-4 pt-6 pb-3 border-b">
        <h1 className="font-bold text-xl mb-3">Katalog Produk</h1>
        <SearchBar defaultValue={q} />
      </div>

      <div className="px-4 py-3">
        <CategoryFilter categories={categories ?? []} activeSlug={kategori} />
      </div>

      <div className="px-4 pb-6">
        {products && products.length > 0 ? (
          <>
            <p className="text-sm text-gray-500 mb-3">{products.length} produk ditemukan</p>
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="font-medium">Produk tidak ditemukan</p>
            {q && <p className="text-sm mt-1">Coba kata kunci lain</p>}
          </div>
        )}
      </div>
    </div>
  )
}

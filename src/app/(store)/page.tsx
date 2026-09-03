// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import CategoryGrid from '@/components/CategoryGrid'
import SearchBar from '@/components/SearchBar'
import { ShoppingBag } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: products }, { data: storeInfo }] =
    await Promise.all([
      supabase
        .from('categories')
        .select('*')
        .order('urutan'),
      supabase
        .from('products')
        .select('*, categories(nama, slug)')
        .eq('is_active', true)
        .gt('stok', 0)
        .order('created_at', { ascending: false })
        .limit(12),
      supabase.from('store_info').select('*').single(),
    ])

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 pt-10 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <ShoppingBag className="w-6 h-6" />
          <span className="font-bold text-lg">{storeInfo?.nama_toko ?? 'Widiya Mart'}</span>
        </div>
        <p className="text-green-100 text-sm">Pesan online, ambil di toko, bayar COD</p>
      </div>

      {/* Search */}
      <div className="px-4 -mt-4 mb-4">
        <SearchBar />
      </div>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="px-4 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">Kategori</h2>
          <CategoryGrid categories={categories} />
        </section>
      )}

      {/* Products */}
      <section className="px-4 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Produk Terbaru</h2>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Belum ada produk</p>
          </div>
        )}
      </section>
    </div>
  )
}

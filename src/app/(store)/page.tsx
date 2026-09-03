// @ts-nocheck
import { createPublicClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import CategoryGrid from '@/components/CategoryGrid'
import SearchBar from '@/components/SearchBar'
import PromoBannerCarousel from '@/components/PromoBannerCarousel'
import { Section } from '@/components/ui'
import Image from 'next/image'

export const revalidate = 60

export default async function HomePage() {
  const supabase = createPublicClient()

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
    <div className="max-w-lg mx-auto pb-24">
      {/* Apple System Glass Header */}
      <header className="glass sticky top-0 z-40 px-4 py-3 flex items-center justify-between border-b border-border mb-3">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Widiya Mart Logo"
            width={36}
            height={36}
            className="rounded-xl shadow-card border border-white/40 shrink-0"
            priority
          />
          <div>
            <h1 className="font-bold text-base leading-tight text-ink">
              {storeInfo?.nama_toko ?? 'Widiya Mart'}
            </h1>
            <p className="text-[11px] text-muted leading-tight">
              Pesan online, ambil di toko (COD)
            </p>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 mb-4">
        <SearchBar />
      </div>

      {/* Promo Banner Carousel */}
      <div className="px-4 mb-5">
        <PromoBannerCarousel />
      </div>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="px-4 mb-5">
          <Section title="Kategori Pilihan" description="Pilih kebutuhan harian kamu">
            <div className="p-1">
              <CategoryGrid categories={categories} />
            </div>
          </Section>
        </div>
      )}

      {/* Products */}
      <div className="px-4 mb-6">
        <Section
          title="Produk Terbaru"
          description="Kebutuhan segar & stok siap ambil"
        >
          <div className="p-1.5">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="glass rounded-concentric p-8 text-center text-muted">
                <p className="text-sm">Belum ada produk tersedia</p>
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  )
}

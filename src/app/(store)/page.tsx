// @ts-nocheck
import { createPublicClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import CategoryGrid from '@/components/CategoryGrid'
import PromoBannerCarousel from '@/components/PromoBannerCarousel'
import { Section } from '@/components/ui'
import Link from 'next/link'
import { getPublicPromos } from '@/lib/actions/promos'
import HomeHeader from '@/components/HomeHeader'

export const revalidate = 60

// In-memory cache to eliminate remote database roundtrip latency on repetitive visits (< 5ms response)
let homeCache: {
  data: {
    categories: any
    products: any
    storeInfo: any
    promos: any
  }
  timestamp: number
} | null = null

const HOME_CACHE_TTL = 60 * 1000 // 60 seconds

export default async function HomePage() {
  let homeData = homeCache
  const now = Date.now()

  if (!homeData || now - homeData.timestamp > HOME_CACHE_TTL) {
    const supabase = createPublicClient()
    const [{ data: categories }, { data: products }, { data: storeInfo }, promos] =
      await Promise.all([
        supabase
          .from('categories')
          .select('id, nama, slug, icon_url, urutan')
          .order('urutan'),
        supabase
          .from('products')
          .select('id, nama, slug, harga, stok, image_url, category_id, created_at, categories(id, nama, slug)')
          .eq('is_active', true)
          .gt('stok', 0)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('store_info')
          .select('*')
          .single(),
        getPublicPromos(),
      ])

    homeData = {
      data: { categories, products, storeInfo, promos },
      timestamp: now,
    }
    homeCache = homeData
  }

  const { categories, products, storeInfo, promos } = homeData.data

  // 1. Produk Terbaru (10 produk teranyar)
  const newestProducts = (products || []).slice(0, 10)

  // 2. Produk Populer / Paling Banyak Dicari
  const popularProducts = [...(products || [])]
    .sort((a, b) => b.stok - a.stok)
    .slice(0, 10)

  // 3. Kategori yang memiliki produk aktif
  const categoriesWithProducts = (categories || [])
    .map((cat) => ({
      ...cat,
      products: (products || []).filter(
        (p) => p.category_id === cat.id || p.categories?.slug === cat.slug
      ),
    }))
    .filter((cat) => cat.products.length > 0)

  return (
    <div className="w-full pb-32">
      {/* Toko Kita Frosted Top Header dengan Transisi Scroll */}
      <HomeHeader storeInfo={storeInfo} />

      {/* Promo Banner Carousel */}
      <div className="px-4 mb-5">
        <PromoBannerCarousel banners={promos} />
      </div>

      {/* Categories (Minimalist Space-Saving Strip) */}
      {categories && categories.length > 0 && (
        <div className="px-4 mb-4">
          <Section
            title="Kategori"
            action={
              <Link
                href="/kategori"
                className="text-xs font-sora font-bold text-[var(--accent-2)] hover:underline flex items-center gap-0.5"
              >
                Lihat Semua &rarr;
              </Link>
            }
          >
            <CategoryGrid categories={categories} />
          </Section>
        </div>
      )}

      {/* Product Carousels (Alfagift Style Horizontal Rows) */}
      {products && products.length > 0 ? (
        <>
          {/* 1. Produk Terbaru */}
          <div className="px-4 mb-6">
            <Section
              title="Produk Terbaru"
              description="Kebutuhan segar & stok siap ambil"
              action={
                <Link
                  href="/kategori"
                  className="text-xs font-sora font-bold text-[var(--accent-2)] hover:underline flex items-center gap-0.5"
                >
                  Lihat Semua &rarr;
                </Link>
              }
            >
              <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-2 -mx-4 px-4 overscroll-x-contain">
                {newestProducts.map((product, idx) => (
                  <div key={product.id} className="w-40 shrink-0 snap-start">
                    <ProductCard product={product} priority={idx === 0} />
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* 2. Paling Banyak Dicari */}
          {popularProducts.length > 0 && (
            <div className="px-4 mb-6">
              <Section
                title="Paling Banyak Dicari"
                description="Produk favorit pilihan warga sekitar"
                action={
                  <Link
                    href="/kategori"
                    className="text-xs font-sora font-bold text-[var(--accent-2)] hover:underline flex items-center gap-0.5"
                  >
                    Lihat Semua &rarr;
                  </Link>
                }
              >
                <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-2 -mx-4 px-4 overscroll-x-contain">
                  {popularProducts.map((product) => (
                    <div key={`popular-${product.id}`} className="w-40 shrink-0 snap-start">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}

          {/* 3. Section per Kategori Pilihan (Koleksi Alfagift) */}
          {categoriesWithProducts.map((cat) => (
            <div key={cat.id} className="px-4 mb-6">
              <Section
                title={cat.nama}
                description={`Pilihan produk ${cat.nama.toLowerCase()} siap pesan`}
                action={
                  <Link
                    href={`/kategori?kategori=${cat.slug}`}
                    className="text-xs font-sora font-bold text-[var(--accent-2)] hover:underline flex items-center gap-0.5"
                  >
                    Lihat Semua &rarr;
                  </Link>
                }
              >
                <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-2 -mx-4 px-4 overscroll-x-contain">
                  {cat.products.map((product) => (
                    <div key={`${cat.slug}-${product.id}`} className="w-40 shrink-0 snap-start">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          ))}
        </>
      ) : (
        <div className="px-4 mb-6">
          <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] p-8 text-center text-[var(--ink-soft)] shadow-3d">
            <p className="text-xs font-medium">Belum ada produk tersedia</p>
          </div>
        </div>
      )}
    </div>
  )
}

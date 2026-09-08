// @ts-nocheck
import { createPublicClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import CategoryGrid from '@/components/CategoryGrid'
import SearchBar from '@/components/SearchBar'
import PromoBannerCarousel from '@/components/PromoBannerCarousel'
import { Section } from '@/components/ui'
import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { getPublicPromos } from '@/lib/actions/promos'
import AddressSelector from '@/components/AddressSelector'

export const revalidate = 60

export default async function HomePage() {
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
        .order('created_at', { ascending: false }),
      supabase
        .from('store_info')
        .select('*')
        .single(),
      getPublicPromos(),
    ])

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
      {/* Toko Kita Frosted Top Header */}
      <header className="top-header sticky top-[var(--admin-bar-offset,0px)] z-40 px-4 pt-3 pb-2.5 flex flex-col gap-2 border-b border-[rgba(232,214,205,0.8)] shadow-header bg-[rgba(250,240,235,0.92)] backdrop-blur-md mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="logo-box flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-badge">
              <Image
                src="/logo.png"
                alt="PENGENJEK MART Logo"
                width={34}
                height={34}
                className="rounded-[var(--radius-sm)] object-cover"
                priority
              />
            </div>
            <div>
              <h1 className="font-sora font-bold text-[var(--text-subtitle)] leading-tight text-[var(--ink)]">
                {storeInfo?.nama_toko ?? 'PENGENJEK MART'}
              </h1>
              <p className="text-[var(--text-caption)] text-[var(--ink-soft)] leading-tight font-medium">
                Pesan online, ambil di toko (COD)
              </p>
            </div>
          </div>

          {/* Quick Link to Daftar Belanja (Favorit) */}
          <Link
            href="/daftar-belanja"
            prefetch={true}
            className="press flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[rgba(232,214,205,0.9)] shadow-xs hover:border-rose-300 text-[var(--ink)] text-xs font-sora font-semibold transition-all active:scale-95"
            title="Daftar Produk Disukai / Favorit"
          >
            <Heart size={14} className="text-rose-500 fill-rose-500/20" />
            <span>Favorit</span>
          </Link>
        </div>

        {/* SATU Baris Ringkas Alamat & Jam Buka */}
        <AddressSelector storeInfo={storeInfo} />
      </header>

      {/* Search Bar */}
      <div className="px-4 mb-4">
        <SearchBar />
      </div>

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
              <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-2 -mx-4 px-4 overscroll-x-contain">
                {newestProducts.map((product) => (
                  <div key={product.id} className="w-40 shrink-0 snap-start">
                    <ProductCard product={product} />
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
                <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-2 -mx-4 px-4 overscroll-x-contain">
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
                <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-2 -mx-4 px-4 overscroll-x-contain">
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

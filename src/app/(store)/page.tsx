// @ts-nocheck
import { createPublicClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import CategoryGrid from '@/components/CategoryGrid'
import SearchBar from '@/components/SearchBar'
import PromoBannerCarousel from '@/components/PromoBannerCarousel'
import { Section } from '@/components/ui'
import Image from 'next/image'
import Link from 'next/link'

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
    <div className="w-full pb-20">
      {/* Toko Kita Frosted Top Header */}
      <header className="top-header sticky top-0 z-40 px-4 py-3.5 flex items-center justify-between border-b border-[rgba(232,214,205,0.8)] shadow-[0_4px_20px_-2px_rgba(43,24,16,0.06)] bg-[rgba(250,240,235,0.92)] backdrop-blur-md mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="logo-box flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-[0_6px_14px_-2px_rgba(255,107,53,.45),inset_0_1px_0_rgba(255,255,255,.4)]">
            <Image
              src="/logo.png"
              alt="TOKO MIRING Logo"
              width={34}
              height={34}
              className="rounded-[10px] object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="font-sora font-bold text-[15px] leading-tight text-[var(--ink)]">
              {storeInfo?.nama_toko ?? 'TOKO MIRING'}
            </h1>
            <p className="text-[11px] text-[var(--ink-soft)] leading-tight font-medium">
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

      {/* Products Grid (2 Kolom, Gap 14px) */}
      <div className="px-4 mb-6">
        <Section
          title="Produk Terbaru"
          description="Kebutuhan segar & stok siap ambil"
        >
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3.5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-8 text-center text-[var(--ink-soft)] shadow-3d">
              <p className="text-xs font-medium">Belum ada produk tersedia</p>
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

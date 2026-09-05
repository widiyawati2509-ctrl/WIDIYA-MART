// @ts-nocheck
import { createPublicClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductDetailInteractive from '@/components/ProductDetailInteractive'
import ProductCard from '@/components/ProductCard'
import ProductReviewsSection from '@/components/ProductReviewsSection'
import PageHeader from '@/components/PageHeader'
import Link from 'next/link'
import type { Metadata } from 'next'
import { cache } from 'react'

export const revalidate = 60

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

const getProduct = cache(async (slug: string) => {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('products')
    .select('*, categories(nama, slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data
})

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) return { title: 'Produk tidak ditemukan' }
  return {
    title: product.nama,
    description: product.deskripsi ?? undefined,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  const supabase = createPublicClient()
  const [relatedResult, storeResult, reviewsResult] = await Promise.all([
    supabase
      .from('products')
      .select('id, nama, slug, harga, stok, image_url')
      .eq('category_id', product.category_id ?? '')
      .eq('is_active', true)
      .neq('id', product.id)
      .limit(4),
    supabase
      .from('store_info')
      .select('whatsapp, no_hp_toko')
      .single(),
    supabase
      .from('product_reviews')
      .select('id, rating, ulasan, nama_reviewer, created_at, order_id')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false }),
  ])

  const related = relatedResult.data
  const reviews = reviewsResult.data || []
  const storePhone = storeResult.data?.whatsapp || storeResult.data?.no_hp_toko || '087816182036'

  return (
    <div className="w-full pb-36">
      {/* Top Header */}
      <PageHeader
        title={product.nama}
        subtitle={product.categories?.nama || 'Detail Produk'}
        showBack={true}
        backHref="/kategori"
      />

      {/* Interactive Image Gallery, Variants, Description, WhatsApp & Floating Cart */}
      <ProductDetailInteractive product={product} storePhone={storePhone} />

      {/* Customer Reviews Section */}
      <ProductReviewsSection reviews={reviews} />

      {/* Related Products */}
      {related && related.length > 0 && (
        <div className="mx-4 mt-4">
          <h2 className="font-sora font-bold text-sm text-[var(--ink)] mb-3">Produk Lainnya</h2>
          <div className="grid grid-cols-2 gap-3.5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

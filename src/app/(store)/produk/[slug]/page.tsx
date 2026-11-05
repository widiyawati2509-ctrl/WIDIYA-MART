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
  const plainDesc = (product.deskripsi || `Beli ${product.nama} dengan harga hemat di WIDIYA MART. Bisa diantar kurir atau ambil di toko (COD).`)
    .replace(/\[VARIAN:[\s\S]*?\]/g, '')
    .trim()
    .slice(0, 160)
  const canonicalPath = `/produk/${slug}`
  const ogImages = product.image_url ? [{ url: product.image_url, alt: product.nama }] : [{ url: '/logo.png', alt: product.nama }]

  return {
    title: product.nama,
    description: plainDesc,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${product.nama} | WIDIYA MART`,
      description: plainDesc,
      url: canonicalPath,
      type: 'website',
      locale: 'id_ID',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.nama} | WIDIYA MART`,
      description: plainDesc,
      images: product.image_url ? [product.image_url] : ['/logo.png'],
    },
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
    <div className="w-full pb-44">
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

      {/* Related Products - Added safe bottom margin */}
      {related && related.length > 0 && (
        <div className="mx-4 mt-4 mb-4">
          <h2 className="font-sora font-bold text-xs text-[var(--ink)] mb-2.5">Produk Lainnya</h2>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-1 -mx-4 px-4">
            {related.map((p) => (
              <div key={p.id} className="w-36 shrink-0 snap-start">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

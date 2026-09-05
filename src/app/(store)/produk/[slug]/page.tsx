// @ts-nocheck
import { createPublicClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductDetailInteractive from '@/components/ProductDetailInteractive'
import ProductCard from '@/components/ProductCard'
import { ChevronLeft } from 'lucide-react'
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
  const [relatedResult, storeResult] = await Promise.all([
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
  ])

  const related = relatedResult.data
  const storePhone = storeResult.data?.whatsapp || storeResult.data?.no_hp_toko || '087816182036'

  return (
    <div className="w-full pb-36">
      {/* Top Header */}
      <div className="top-header sticky top-0 z-40 bg-[rgba(250,240,235,0.92)] backdrop-blur-md px-4 py-3 flex items-center gap-2 border-b border-[rgba(232,214,205,0.8)] shadow-[0_4px_20px_-2px_rgba(43,24,16,0.06)]">
        <Link href="/kategori" className="press p-1.5 -ml-1 rounded-full hover:bg-[var(--line)]/50 text-[var(--ink)]">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <span className="font-sora font-bold text-sm text-[var(--ink)] truncate">{product.nama}</span>
      </div>

      {/* Interactive Image Gallery, Variants, Description, WhatsApp & Floating Cart */}
      <ProductDetailInteractive product={product} storePhone={storePhone} />

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

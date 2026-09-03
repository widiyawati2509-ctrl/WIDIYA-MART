// @ts-nocheck
import { createPublicClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { formatRupiah } from '@/lib/utils'
import AddToCartButton from '@/components/AddToCartButton'
import { ChevronLeft, Package } from 'lucide-react'
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
  const { data: related } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', product.category_id ?? '')
    .eq('is_active', true)
    .neq('id', product.id)
    .limit(4)

  const outOfStock = product.stok === 0

  return (
    <div className="max-w-lg mx-auto">
      {/* Back */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm px-4 py-3 flex items-center gap-2 border-b">
        <Link href="/kategori" className="p-1 -ml-1 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <span className="font-medium truncate">{product.nama}</span>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.nama}
            fill
            className="object-contain p-4"
            sizes="(max-width: 512px) 100vw, 512px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Package className="w-24 h-24" />
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-semibold px-4 py-2 rounded-full text-sm">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 py-4 bg-white mb-2">
        {product.categories && (
          <Link
            href={`/kategori?kategori=${product.categories.slug}`}
            className="text-xs text-green-600 font-medium mb-1 block"
          >
            {product.categories.nama}
          </Link>
        )}
        <h1 className="text-xl font-bold text-gray-900 mb-1">{product.nama}</h1>
        <p className="text-2xl font-bold text-green-600 mb-2">{formatRupiah(product.harga)}</p>
        <p className="text-sm text-gray-500">
          Stok: <span className={product.stok < 5 ? 'text-red-500 font-medium' : 'text-gray-700'}>
            {product.stok} tersisa
          </span>
        </p>
      </div>

      {/* Description */}
      {product.deskripsi && (
        <div className="px-4 py-4 bg-white mb-2">
          <h2 className="font-semibold mb-2">Deskripsi Produk</h2>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
            {product.deskripsi}
          </p>
        </div>
      )}

      {/* Related */}
      {related && related.length > 0 && (
        <div className="px-4 py-4 bg-white mb-2">
          <h2 className="font-semibold mb-3">Produk Lainnya</h2>
          <div className="grid grid-cols-2 gap-3">
            {related.map((p) => (
              <Link key={p.id} href={`/produk/${p.slug}`} className="block">
                <div className="border rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="relative aspect-square bg-gray-50">
                    {p.image_url ? (
                      <Image src={p.image_url} alt={p.nama} fill className="object-contain p-2" sizes="50vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{p.nama}</p>
                    <p className="text-green-600 font-bold text-sm">{formatRupiah(p.harga)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Add to cart */}
      <div className="fixed bottom-16 left-0 right-0 max-w-lg mx-auto px-4 pb-3">
        <AddToCartButton productId={product.id} disabled={outOfStock} />
      </div>
    </div>
  )
}

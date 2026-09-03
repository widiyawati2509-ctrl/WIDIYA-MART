// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { formatRupiah } from '@/lib/utils'
import CartItemRow from '@/components/CartItemRow'
import { ShoppingCart, ArrowRight, Package } from 'lucide-react'
import Link from 'next/link'

export default async function KeranjangPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/masuk')

  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .single()

  let items: {
    id: string
    qty: number
    products: { id: string; nama: string; harga: number; stok: number; image_url: string | null; slug: string } | null
  }[] = []

  if (cart) {
    const { data } = await supabase
      .from('cart_items')
      .select('id, qty, products(id, nama, harga, stok, image_url, slug)')
      .eq('cart_id', cart.id)
    items = (data ?? []) as typeof items
  }

  const total = items.reduce((sum, item) => {
    return sum + (item.products?.harga ?? 0) * item.qty
  }, 0)

  const isEmpty = items.length === 0

  return (
    <div className="max-w-lg mx-auto">
      <div className="sticky top-0 z-10 bg-white px-4 py-4 border-b">
        <h1 className="font-bold text-xl flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Keranjang Belanja
        </h1>
      </div>

      {isEmpty ? (
        <div className="text-center py-20 px-4">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-200" />
          <p className="text-gray-500 font-medium mb-1">Keranjang masih kosong</p>
          <p className="text-gray-400 text-sm mb-6">Yuk mulai belanja!</p>
          <Link
            href="/kategori"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full font-medium hover:bg-green-700 transition-colors"
          >
            Lihat Produk
          </Link>
        </div>
      ) : (
        <>
          <div className="divide-y bg-white mb-2">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white px-4 py-4 mb-24">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span className="text-green-600">{formatRupiah(total)}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">*Pembayaran COD saat ambil di toko</p>
          </div>

          {/* Checkout button */}
          <div className="fixed bottom-16 left-0 right-0 max-w-lg mx-auto px-4 pb-3">
            <Link
              href="/checkout"
              className="flex items-center justify-between bg-green-600 text-white px-6 py-4 rounded-2xl hover:bg-green-700 transition-colors shadow-lg"
            >
              <span className="font-semibold">Checkout ({items.length} item)</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{formatRupiah(total)}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

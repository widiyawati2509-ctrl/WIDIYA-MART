// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CartItemRow from '@/components/CartItemRow'
import { formatRupiah } from '@/lib/utils'
import { ShoppingCart, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { buttonClass, EmptyState, Card } from '@/components/ui'

export default async function KeranjangPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/masuk')

  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .single()

  let items: unknown[] = []
  if (cart) {
    const { data } = await supabase
      .from('cart_items')
      .select('id, qty, products(id, nama, harga, stok, image_url, slug)')
      .eq('cart_id', cart.id)
    items = data ?? []
  }

  const total = items.reduce((sum: number, item: { qty: number; products: unknown }) => {
    const p = item.products as { harga: number } | null
    return sum + (p?.harga ?? 0) * item.qty
  }, 0)

  const isEmpty = items.length === 0

  return (
    <div className="max-w-lg mx-auto pb-32">
      {/* Header */}
      <div className="glass sticky top-0 z-40 px-4 py-3.5 border-b border-border flex items-center justify-between mb-4">
        <h1 className="font-bold text-lg text-ink flex items-center gap-2">
          <span className="chip-3d chip-3d-accent grid size-8 place-items-center rounded-full">
            <ShoppingCart size={16} />
          </span>
          Keranjang Belanja
        </h1>
        <span className="text-xs text-muted font-medium">{items.length} item</span>
      </div>

      <div className="px-4">
        {isEmpty ? (
          <EmptyState
            icon={ShoppingCart}
            message="Keranjang belanja kamu masih kosong. Yuk temukan produk kebutuhan harian!"
            actionHref="/kategori"
            actionLabel="Lihat Produk"
          />
        ) : (
          <>
            {/* Grouped list of cart items */}
            <div className="glass divide-y divide-border overflow-hidden rounded-xl mb-4">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>

            {/* Summary */}
            <Card className="mb-6">
              <div className="flex justify-between items-center text-base font-semibold text-ink">
                <span>Total Belanja</span>
                <span className="text-positive text-xl font-bold tabular-nums">
                  {formatRupiah(total)}
                </span>
              </div>
              <p className="text-xs text-muted mt-1">
                *Pembayaran tunai / QRIS (COD) saat ambil langsung di toko
              </p>
            </Card>

            {/* Checkout floating button */}
            <div className="fixed inset-x-4 bottom-20 max-w-lg mx-auto z-40">
              <Link
                href="/checkout"
                className={`w-full flex items-center justify-between ${buttonClass({
                  variant: 'primary',
                  size: 'md',
                  className: 'py-3.5 px-5 rounded-xl text-base shadow-fab',
                })}`}
              >
                <span>Checkout ({items.length} item)</span>
                <div className="flex items-center gap-2 tabular-nums font-bold">
                  <span>{formatRupiah(total)}</span>
                  <ArrowRight size={18} />
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

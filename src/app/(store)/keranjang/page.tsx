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
    <div className="w-full pb-36">
      {/* Top Header */}
      <div className="top-header sticky top-0 z-40 px-4 py-3.5 border-b border-[rgba(232,214,205,0.8)] bg-[rgba(250,240,235,0.92)] backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(43,24,16,0.06)] flex items-center justify-between mb-4">
        <h1 className="font-sora font-bold text-base text-[var(--ink)] flex items-center gap-2">
          <span className="w-7 h-7 rounded-xl bg-[var(--accent-bg)] text-[var(--accent-2)] flex items-center justify-center font-bold">
            <ShoppingCart size={15} />
          </span>
          Keranjang Belanja
        </h1>
        <span className="text-xs font-semibold text-[var(--ink-soft)] bg-[var(--accent-bg)] text-[var(--accent-2)] px-2.5 py-0.5 rounded-full">
          {items.length} item
        </span>
      </div>

      <div className="px-4">
        {isEmpty ? (
          <EmptyState
            icon={ShoppingCart}
            message="Keranjang belanja kamu masih kosong. Yuk temukan produk kebutuhan harian!"
            actionHref="/kategori"
            actionLabel="Mulai Belanja"
          />
        ) : (
          <>
            {/* List-as-Card: Individual 3D cards with gap */}
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>

            {/* Receipt Summary Card */}
            <Card className="mb-6 border border-[rgba(232,214,205,0.9)]">
              <div className="flex justify-between items-center text-sm font-semibold text-[var(--ink)] mb-2">
                <span>Subtotal ({items.length} item)</span>
                <span className="font-sora font-bold text-[var(--ink)] tabular-nums">
                  {formatRupiah(total)}
                </span>
              </div>
              <div className="receipt-dashed pt-2.5 mt-2 flex justify-between items-center">
                <span className="font-sora font-bold text-[var(--ink)] text-base">Total Tagihan</span>
                <span className="font-sora font-bold text-[var(--accent-2)] text-xl tabular-nums">
                  {formatRupiah(total)}
                </span>
              </div>
              <p className="text-[11px] text-[var(--ink-soft)] mt-2 font-medium">
                *Pembayaran tunai / QRIS (COD) saat ambil langsung di toko
              </p>
            </Card>

            {/* Checkout floating button */}
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 max-w-[480px] w-full px-4 z-40">
              <Link
                href="/checkout"
                prefetch={true}
                className={`w-full flex items-center justify-between checkout-btn py-3.5 px-5 rounded-[16px] text-base ${buttonClass({
                  variant: 'primary',
                  size: 'lg',
                })}`}
              >
                <span className="font-sora font-bold">Checkout ({items.length} item)</span>
                <div className="flex items-center gap-1.5 tabular-nums font-sora font-bold">
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

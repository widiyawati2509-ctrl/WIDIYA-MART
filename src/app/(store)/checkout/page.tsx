// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserLoyaltySummary } from '@/lib/actions/loyalty'
import CheckoutFormClient from '@/components/CheckoutFormClient'

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/masuk')

  const [profileResult, cartResult, storeResult, loyaltySummary] = await Promise.all([
    supabase.from('profiles').select('nama, no_hp').eq('id', user.id).single(),
    (async () => {
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!cart) return { items: [], total: 0 }

      const { data: items } = await supabase
        .from('cart_items')
        .select('id, qty, products(id, nama, harga, stok)')
        .eq('cart_id', cart.id)

      const safeItems = (items ?? []) as {
        id: string; qty: number
        products: { id: string; nama: string; harga: number; stok: number } | null
      }[]

      const total = safeItems.reduce((sum, item) => {
        return sum + (item.products?.harga ?? 0) * item.qty
      }, 0)

      return { items: safeItems, total }
    })(),
    supabase.from('store_info').select('nama_toko, alamat_toko, kota, jam_operasional, no_hp_toko').single(),
    getUserLoyaltySummary(user.id),
  ])

  const profile = profileResult.data
  const { items, total } = cartResult
  const store = storeResult.data

  if (items.length === 0) redirect('/keranjang')

  return (
    <div className="w-full pb-28">
      {/* Top Header */}
      <div className="top-header sticky top-0 z-40 px-4 py-3.5 border-b border-[rgba(232,214,205,0.8)] bg-[rgba(250,240,235,0.92)] backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(43,24,16,0.06)] mb-4">
        <h1 className="font-sora font-bold text-base text-[var(--ink)]">Konfirmasi Pesanan</h1>
        <p className="text-xs text-[var(--ink-soft)] font-medium">Periksa kembali data belanjaan kamu</p>
      </div>

      <CheckoutFormClient
        items={items}
        subtotal={total}
        store={store}
        profile={profile}
        loyaltySummary={loyaltySummary}
      />
    </div>
  )
}

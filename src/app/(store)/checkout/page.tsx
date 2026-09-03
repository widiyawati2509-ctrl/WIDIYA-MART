// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatRupiah } from '@/lib/utils'
import { createOrder } from '@/lib/actions/orders'
import { MapPin, Clock, Phone, ShieldCheck } from 'lucide-react'

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/masuk')

  const [profileResult, cartResult, storeResult] = await Promise.all([
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
    supabase.from('store_info').select('*').single(),
  ])

  const profile = profileResult.data
  const { items, total } = cartResult
  const store = storeResult.data

  if (items.length === 0) redirect('/keranjang')

  return (
    <div className="max-w-lg mx-auto">
      <div className="sticky top-0 z-10 bg-white px-4 py-4 border-b">
        <h1 className="font-bold text-xl">Konfirmasi Pesanan</h1>
      </div>

      <form action={createOrder} className="space-y-3 p-4">
        {/* Info pengambilan */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <h2 className="font-semibold text-green-800 flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4" />
            Ambil di Toko
          </h2>
          <div className="space-y-2 text-sm">
            <p className="font-medium text-gray-800">{store?.nama_toko}</p>
            {store?.alamat_toko && (
              <p className="text-gray-600 flex gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-green-500" />
                {store.alamat_toko}{store.kota ? `, ${store.kota}` : ''}
              </p>
            )}
            {store?.jam_operasional && (
              <p className="text-gray-600 flex gap-2">
                <Clock className="w-4 h-4 shrink-0 mt-0.5 text-green-500" />
                {store.jam_operasional}
              </p>
            )}
            {store?.no_hp_toko && (
              <p className="text-gray-600 flex gap-2">
                <Phone className="w-4 h-4 shrink-0 mt-0.5 text-green-500" />
                {store.no_hp_toko}
              </p>
            )}
          </div>
        </div>

        {/* Pembayaran */}
        <div className="bg-white border rounded-2xl p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            Pembayaran
          </h2>
          <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700">
            <p className="font-medium">COD (Cash on Delivery)</p>
            <p className="text-gray-500 text-xs mt-0.5">Bayar tunai saat mengambil pesanan di toko</p>
          </div>
        </div>

        {/* Data pemesan */}
        <div className="bg-white border rounded-2xl p-4 space-y-4">
          <h2 className="font-semibold">Data Pemesan</h2>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Nama Lengkap</label>
            <input
              type="text"
              name="nama_pemesan"
              defaultValue={profile?.nama}
              required
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nama lengkap pemesan"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Nomor HP</label>
            <input
              type="tel"
              name="no_hp_pemesan"
              defaultValue={profile?.no_hp ?? ''}
              required
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="08xxxxxxxxxx"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Catatan (opsional)</label>
            <textarea
              name="catatan"
              rows={3}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Contoh: minta dikemas dengan baik"
            />
          </div>
        </div>

        {/* Ringkasan */}
        <div className="bg-white border rounded-2xl p-4">
          <h2 className="font-semibold mb-3">Ringkasan Pesanan</h2>
          <div className="space-y-2 text-sm mb-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-gray-600">
                  {item.products?.nama} × {item.qty}
                </span>
                <span className="font-medium">
                  {formatRupiah((item.products?.harga ?? 0) * item.qty)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-base">
            <span>Total</span>
            <span className="text-green-600">{formatRupiah(total)}</span>
          </div>
        </div>

        <button
          type="submit"
          className="btn-3d btn-3d-green w-full py-4 rounded-2xl font-bold text-base"
        >
          Buat Pesanan — {formatRupiah(total)}
        </button>
      </form>
    </div>
  )
}

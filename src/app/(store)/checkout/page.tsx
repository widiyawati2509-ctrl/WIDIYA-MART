// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatRupiah } from '@/lib/utils'
import { createOrder } from '@/lib/actions/orders'
import { MapPin, Clock, Phone, ShieldCheck } from 'lucide-react'
import { Card, Field, Input, Button, Badge } from '@/components/ui'

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
    <div className="w-full pb-28">
      {/* Top Header */}
      <div className="top-header sticky top-0 z-40 px-4 py-3.5 border-b border-[rgba(232,214,205,0.8)] bg-[rgba(250,240,235,0.92)] backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(43,24,16,0.06)] mb-4">
        <h1 className="font-sora font-bold text-base text-[var(--ink)]">Konfirmasi Pesanan</h1>
        <p className="text-xs text-[var(--ink-soft)] font-medium">Periksa kembali data belanjaan kamu</p>
      </div>

      <form action={createOrder} className="space-y-3.5 px-4">
        {/* Info Pengambilan */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <MapPin size={15} />
            </span>
            <h2 className="font-sora font-bold text-sm text-[var(--ink)]">Ambil Langsung di Toko</h2>
            <Badge variant="positive" className="ml-auto">Bebas Ongkir</Badge>
          </div>
          <div className="space-y-2 text-xs">
            <p className="font-bold text-[var(--ink)]">{store?.nama_toko}</p>
            {store?.alamat_toko && (
              <p className="text-[var(--ink-soft)] flex gap-2 font-medium">
                <MapPin size={15} className="shrink-0 mt-0.5 text-emerald-600" />
                {store.alamat_toko}{store.kota ? `, ${store.kota}` : ''}
              </p>
            )}
            {store?.jam_operasional && (
              <p className="text-[var(--ink-soft)] flex gap-2 font-medium">
                <Clock size={15} className="shrink-0 mt-0.5 text-emerald-600" />
                {store.jam_operasional}
              </p>
            )}
            {store?.no_hp_toko && (
              <p className="text-[var(--ink-soft)] flex gap-2 font-medium">
                <Phone size={15} className="shrink-0 mt-0.5 text-emerald-600" />
                {store.no_hp_toko}
              </p>
            )}
          </div>
        </Card>

        {/* Pembayaran */}
        <Card>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-7 h-7 rounded-xl bg-[var(--accent-bg)] text-[var(--accent-2)] flex items-center justify-center font-bold">
              <ShieldCheck size={15} />
            </span>
            <h2 className="font-sora font-bold text-sm text-[var(--ink)]">Metode Pembayaran</h2>
          </div>
          <div className="rounded-[14px] bg-[var(--accent-bg)] border border-[var(--accent)]/30 p-3 text-xs">
            <p className="font-bold text-[var(--accent-2)]">COD (Bayar saat Ambil di Toko)</p>
            <p className="text-[11px] text-[var(--ink-soft)] mt-0.5 font-medium">
              Bisa bayar tunai atau scan QRIS langsung di kasir toko
            </p>
          </div>
        </Card>

        {/* Data Pemesan */}
        <Card className="space-y-3.5">
          <h2 className="font-sora font-bold text-sm text-[var(--ink)]">Data Pemesan</h2>
          <Field label="Nama Lengkap" htmlFor="nama_pemesan">
            <Input
              id="nama_pemesan"
              name="nama_pemesan"
              defaultValue={profile?.nama}
              required
              placeholder="Nama lengkap pemesan"
            />
          </Field>
          <Field label="Nomor WhatsApp" htmlFor="no_hp_pemesan">
            <Input
              id="no_hp_pemesan"
              type="tel"
              name="no_hp_pemesan"
              defaultValue={profile?.no_hp ?? ''}
              required
              placeholder="08xxxxxxxxxx"
            />
          </Field>
          <Field label="Catatan Tambahan (opsional)" htmlFor="catatan">
            <textarea
              id="catatan"
              name="catatan"
              rows={2}
              className="w-full min-w-0 rounded-[14px] border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] shadow-[0_4px_10px_-2px_rgba(43,24,16,.04),inset_0_1px_0_#ffffff] outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 resize-none"
              placeholder="Contoh: tolong pisahkan belanjaan bumbu dapur"
            />
          </Field>
        </Card>

        {/* Ringkasan Pesanan (Struk Nota dengan Garis Putus-putus) */}
        <Card>
          <h2 className="font-sora font-bold text-sm text-[var(--ink)] mb-3">Ringkasan Belanja</h2>
          <div className="space-y-2 text-xs mb-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between py-1">
                <span className="text-[var(--ink-soft)] line-clamp-1 pr-2 font-medium">
                  {item.products?.nama} × {item.qty}
                </span>
                <span className="font-bold text-[var(--ink)] tabular-nums shrink-0 font-sora">
                  {formatRupiah((item.products?.harga ?? 0) * item.qty)}
                </span>
              </div>
            ))}
          </div>
          <div className="receipt-dashed pt-3 flex justify-between items-center text-sm font-bold text-[var(--ink)]">
            <span className="font-sora">Total Tagihan</span>
            <span className="font-sora font-bold text-[var(--accent-2)] text-xl tabular-nums">
              {formatRupiah(total)}
            </span>
          </div>
        </Card>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3.5 rounded-[16px] text-base checkout-btn"
        >
          Buat Pesanan — {formatRupiah(total)}
        </Button>
      </form>
    </div>
  )
}

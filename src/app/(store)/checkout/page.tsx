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
    <div className="max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="glass sticky top-0 z-40 px-4 py-3.5 border-b border-border mb-4">
        <h1 className="font-bold text-lg text-ink">Konfirmasi Pesanan</h1>
        <p className="text-xs text-muted">Periksa kembali data belanjaan kamu</p>
      </div>

      <form action={createOrder} className="space-y-3.5 px-4">
        {/* Info pengambilan */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <span className="chip-3d chip-3d-positive grid size-7 place-items-center rounded-full">
              <MapPin size={15} />
            </span>
            <h2 className="font-semibold text-base text-ink">Ambil di Toko</h2>
            <Badge variant="positive" className="ml-auto">Bebas Ongkir</Badge>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-ink">{store?.nama_toko}</p>
            {store?.alamat_toko && (
              <p className="text-muted flex gap-2">
                <MapPin size={16} className="shrink-0 mt-0.5 text-positive" />
                {store.alamat_toko}{store.kota ? `, ${store.kota}` : ''}
              </p>
            )}
            {store?.jam_operasional && (
              <p className="text-muted flex gap-2">
                <Clock size={16} className="shrink-0 mt-0.5 text-positive" />
                {store.jam_operasional}
              </p>
            )}
            {store?.no_hp_toko && (
              <p className="text-muted flex gap-2">
                <Phone size={16} className="shrink-0 mt-0.5 text-positive" />
                {store.no_hp_toko}
              </p>
            )}
          </div>
        </Card>

        {/* Pembayaran */}
        <Card>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="chip-3d chip-3d-accent grid size-7 place-items-center rounded-full">
              <ShieldCheck size={15} />
            </span>
            <h2 className="font-semibold text-base text-ink">Metode Pembayaran</h2>
          </div>
          <div className="rounded-lg bg-accent-subtle/60 border border-accent/20 p-3 text-sm">
            <p className="font-semibold text-accent-press">COD (Bayar saat Ambil di Toko)</p>
            <p className="text-xs text-muted mt-0.5">Bisa bayar tunai atau scan QRIS langsung di kasir toko</p>
          </div>
        </Card>

        {/* Data pemesan */}
        <Card className="space-y-4">
          <h2 className="font-semibold text-base text-ink">Data Pemesan</h2>
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
              className="focus-ring w-full min-w-0 rounded-lg border border-border-strong bg-card px-3 py-2 text-base text-ink placeholder:text-muted focus:border-accent resize-none"
              placeholder="Contoh: tolong pisahkan belanjaan bumbu dapur"
            />
          </Field>
        </Card>

        {/* Ringkasan */}
        <Card>
          <h2 className="font-semibold text-base text-ink mb-3">Ringkasan Pesanan</h2>
          <div className="space-y-2 text-sm mb-3 divide-y divide-border">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between pt-2">
                <span className="text-muted line-clamp-1 pr-2">
                  {item.products?.nama} × {item.qty}
                </span>
                <span className="font-medium text-ink tabular-nums shrink-0">
                  {formatRupiah((item.products?.harga ?? 0) * item.qty)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 flex justify-between items-center text-base font-bold text-ink">
            <span>Total Pembayaran</span>
            <span className="text-positive text-xl tabular-nums">{formatRupiah(total)}</span>
          </div>
        </Card>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-4 rounded-xl text-base shadow-fab"
        >
          Buat Pesanan — {formatRupiah(total)}
        </Button>
      </form>
    </div>
  )
}

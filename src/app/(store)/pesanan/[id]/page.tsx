// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { formatRupiah, getOrderStatusLabel, formatWhatsAppUrl } from '@/lib/utils'
import { ChevronLeft, CheckCircle, Clock, MapPin, Phone, Truck, Star } from 'lucide-react'
import Link from 'next/link'
import PrintReceiptButton from '@/components/PrintReceiptButton'
import DeleteOrderButton from '@/components/admin/DeleteOrderButton'
import ReorderButton from '@/components/ReorderButton'
import ProductReviewFormModal from '@/components/ProductReviewFormModal'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/masuk')

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*, products(image_url))')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!order) notFound()

  const { data: store } = await supabase
    .from('store_info')
    .select('nama_toko, alamat_toko, kota, jam_operasional, whatsapp, no_hp_toko')
    .single()

  const statuses = ['menunggu_diproses', 'diproses', 'siap_diambil', 'selesai']
  const currentIdx = statuses.indexOf(order.status)

  return (
    <div className="w-full pb-28">
      {/* Top Header */}
      <div className="top-header sticky top-0 z-40 bg-[rgba(250,240,235,0.92)] backdrop-blur-md px-4 py-3.5 flex items-center justify-between border-b border-[rgba(232,214,205,0.8)] shadow-[0_4px_20px_-2px_rgba(43,24,16,0.06)] print:hidden">
        <div className="flex items-center gap-2">
          <Link href="/pesanan" className="press p-1.5 -ml-1 rounded-full hover:bg-[var(--line)]/50 text-[var(--ink)]">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-sora font-bold text-sm text-[var(--ink)]">Detail Pesanan</h1>
        </div>
        <PrintReceiptButton order={order} store={store} />
      </div>

      <div className="p-4 space-y-3.5">
        {/* Status Stepper Card */}
        <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-4 shadow-3d">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sora font-bold text-sm text-[var(--ink)]">Status Pesanan</h2>
            <span className="text-[10.5px] font-bold bg-[var(--accent-bg)] text-[var(--accent-2)] px-2.5 py-0.5 rounded-full">
              {getOrderStatusLabel(order.status)}
            </span>
          </div>

          {order.status !== 'dibatalkan' && (
            <div className="flex items-center gap-0">
              {statuses.map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      i <= currentIdx
                        ? 'bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-white shadow-xs'
                        : 'bg-[var(--line)] text-[var(--ink-soft)]'
                    }`}
                  >
                    {i < currentIdx ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  {i < statuses.length - 1 && (
                    <div
                      className={`flex-1 h-1 ${
                        i < currentIdx ? 'bg-[var(--accent)]' : 'bg-[var(--line)]'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lokasi Pengambilan / Pengantaran */}
        <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-4 shadow-3d">
          {order.metode_pengiriman === 'antar_alamat' ? (
            <>
              <h2 className="font-sora font-bold text-sm text-[var(--ink)] mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[var(--accent)]" />
                Diantar ke Alamat (COD)
              </h2>
              <p className="font-bold text-xs text-[var(--ink)]">
                {order.alamat_pengiriman || 'Alamat tidak tercantum'}
              </p>
              {order.jarak_km ? (
                <p className="text-xs text-[var(--ink-soft)] mt-1 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                  Jarak Pengantaran: ~{order.jarak_km} km dari toko
                </p>
              ) : null}
              <p className="text-[11px] text-emerald-700 font-bold mt-1">
                {order.ongkir === 0 ? '🎉 Gratis Ongkir (Radius ≤ 7 km)' : `Ongkir: ${formatRupiah(order.ongkir || 15000)}`}
              </p>
            </>
          ) : (
            <>
              <h2 className="font-sora font-bold text-sm text-[var(--ink)] mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--accent)]" />
                Lokasi Pengambilan (Ambil di Toko)
              </h2>
              <p className="font-bold text-xs text-[var(--ink)]">{store?.nama_toko || 'PENGENJEK MART'}</p>
              {store?.alamat_toko && (
                <p className="text-xs text-[var(--ink-soft)] mt-0.5 font-medium">
                  {store.alamat_toko}, {store.kota}
                </p>
              )}
              {store?.jam_operasional && (
                <p className="text-xs text-[var(--ink-soft)] mt-1 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[var(--accent)]" /> {store.jam_operasional}
                </p>
              )}
              {(store?.whatsapp || store?.no_hp_toko) && (
                <a
                  href={formatWhatsAppUrl(
                    store.whatsapp || store.no_hp_toko,
                    `Halo Admin PENGENJEK MART, saya ingin menanyakan pesanan #${order.id.slice(0, 8).toUpperCase()}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-sora font-bold text-[var(--accent-2)] bg-[var(--accent-bg)] px-3 py-1.5 rounded-full hover:brightness-95 transition-all active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" /> Hubungi via WhatsApp
                </a>
              )}
            </>
          )}
        </div>

        {/* Info Pemesan */}
        <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-4 shadow-3d">
          <h2 className="font-sora font-bold text-sm text-[var(--ink)] mb-3">Info Pemesan</h2>
          <div className="space-y-1.5 text-xs font-medium">
            <div className="flex justify-between">
              <span className="text-[var(--ink-soft)]">Nama</span>
              <span className="font-bold text-[var(--ink)]">{order.nama_pemesan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ink-soft)]">No. HP</span>
              <span className="font-bold text-[var(--ink)]">{order.no_hp_pemesan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ink-soft)]">Pengiriman</span>
              <span className="font-bold text-[var(--ink)]">
                {order.metode_pengiriman === 'antar_alamat' ? 'Diantar ke Alamat' : 'Ambil di Toko'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ink-soft)]">Pembayaran</span>
              <span className="font-bold text-[var(--ink)]">
                COD (Bayar saat {order.metode_pengiriman === 'antar_alamat' ? 'Pesanan Tiba' : 'Ambil di Toko'})
              </span>
            </div>
            {order.catatan && (
              <div className="flex justify-between">
                <span className="text-[var(--ink-soft)]">Catatan</span>
                <span className="font-bold text-right max-w-[60%] text-[var(--ink)]">{order.catatan}</span>
              </div>
            )}
          </div>
        </div>

        {/* Item Pesanan (Struk Nota Dashed) */}
        <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-4 shadow-3d">
          <h2 className="font-sora font-bold text-sm text-[var(--ink)] mb-3">Item Pesanan</h2>
          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div key={item.id} className="text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-[var(--ink)]">{item.nama_produk}</p>
                    <p className="text-[var(--ink-soft)]">
                      {formatRupiah(item.harga_saat_beli)} × {item.qty}
                    </p>
                  </div>
                  <span className="font-sora font-bold text-[var(--ink)]">{formatRupiah(item.subtotal)}</span>
                </div>

                {/* Rating & Review Button when order is finished */}
                {order.status === 'selesai' && item.product_id && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <ProductReviewFormModal
                      productId={item.product_id}
                      productName={item.nama_produk}
                      orderId={order.id}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Subtotal Produk */}
          <div className="pt-2.5 mt-2 border-t border-[var(--line)] flex justify-between items-center text-xs text-[var(--ink-soft)] font-medium">
            <span>Subtotal Produk</span>
            <span className="font-sora font-semibold text-[var(--ink)]">{formatRupiah(order.subtotal)}</span>
          </div>

          {/* Ongkir Breakdown */}
          <div className="pt-1.5 flex justify-between items-center text-xs text-[var(--ink-soft)] font-medium">
            <span>Biaya Pengiriman ({order.metode_pengiriman === 'antar_alamat' ? 'Diantar' : 'Ambil di Toko'})</span>
            <span className={`font-sora font-semibold ${order.ongkir === 0 ? 'text-emerald-700' : 'text-[var(--ink)]'}`}>
              {order.metode_pengiriman === 'antar_alamat'
                ? (order.ongkir === 0 ? 'Gratis (≤ 7 km)' : formatRupiah(order.ongkir || 15000))
                : 'Gratis'}
            </span>
          </div>

          {/* Diskon Poin & Ringkasan */}
          {order.diskon_poin > 0 && (
            <div className="pt-1.5 flex justify-between items-center text-xs text-emerald-700 font-semibold">
              <span>Diskon Poin Digunakan ({order.poin_digunakan} poin)</span>
              <span>-{formatRupiah(order.diskon_poin)}</span>
            </div>
          )}
          {order.poin_didapat > 0 && (
            <div className="pt-1.5 flex justify-between items-center text-xs text-amber-700 font-semibold">
              <span>Poin Didapat dari Pesanan</span>
              <span>+{order.poin_didapat} Poin</span>
            </div>
          )}

          <div className="receipt-dashed mt-3 pt-3 flex justify-between items-center text-sm font-bold">
            <span className="font-sora text-[var(--ink)]">Total Tagihan (COD)</span>
            <span className="font-sora font-bold text-[var(--accent-2)] text-lg tabular-nums">
              {formatRupiah(order.total)}
            </span>
          </div>
        </div>

        {/* Beli Lagi Quick Action */}
        <div className="pt-1">
          <ReorderButton orderId={order.id} />
        </div>

        <div className="pt-1">
          <DeleteOrderButton
            orderId={order.id}
            orderNumber={order.id.slice(0, 8).toUpperCase()}
            redirectTo="/pesanan"
          />
        </div>

        <p className="text-[11px] text-[var(--ink-soft)] text-center font-medium">
          ID Pesanan: {order.id.slice(0, 8).toUpperCase()}
        </p>
      </div>
    </div>
  )
}

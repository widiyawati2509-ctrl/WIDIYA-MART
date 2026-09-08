// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { formatRupiah, getOrderStatusLabel, getOrderStatusColor, formatWhatsAppUrl, formatBatasWaktu, getPickupCountdown, parseOrderShippingInfo } from '@/lib/utils'
import { ChevronLeft, CheckCircle, Clock, MapPin, Phone, Truck, Star, AlertTriangle, Sparkles } from 'lucide-react'
import Link from 'next/link'
import PrintReceiptButton from '@/components/PrintReceiptButton'
import PageHeader from '@/components/PageHeader'
import DeleteOrderButton from '@/components/admin/DeleteOrderButton'
import ReorderButton from '@/components/ReorderButton'
import ProductReviewFormModal from '@/components/ProductReviewFormModal'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ created?: string }>
}

export default async function OrderDetailPage({ params, searchParams }: OrderDetailPageProps) {
  const { id } = await params
  const sParams = searchParams ? await searchParams : {}
  const isJustCreated = sParams?.created === 'true'
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

  const shipping = parseOrderShippingInfo(order)
  const statuses = ['menunggu_diproses', 'diproses', 'siap_diambil', 'selesai']
  const currentIdx = statuses.indexOf(order.status)


  return (
    <div className="w-full pb-28">
      {/* Top Header */}
      <PageHeader
        title="Detail Pesanan"
        subtitle={`ID: #${order.id.slice(0, 8).toUpperCase()}`}
        showBack={true}
        backHref="/pesanan"
        printHidden={true}
        rightSlot={<PrintReceiptButton order={order} store={store} />}
      />

      <div className="p-3.5 space-y-2.5">
        {/* Banner Konfirmasi Sukses Checkout */}
        {isJustCreated && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-xs text-emerald-950 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🎉</span>
              <div>
                <h3 className="font-sora font-extrabold text-sm text-emerald-950">Pesanan Berhasil Dibuat!</h3>
                <p className="text-[11px] text-emerald-800 font-medium">Terima kasih telah berbelanja di {store?.nama_toko || 'PENGENJEK MART'}</p>
              </div>
            </div>
            {shipping.isDelivery ? (
              <div className="bg-white/85 rounded-xl p-2.5 border border-emerald-200 text-xs flex items-center justify-between">
                <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  Estimasi Tiba Pengantaran:
                </span>
                <span className="bg-blue-600 text-white font-extrabold px-2.5 py-0.5 rounded-full text-[11px]">
                  ±{shipping.estimasiMenit || 35} Menit
                </span>
              </div>
            ) : (
              <div className="bg-white/85 rounded-xl p-2.5 border border-emerald-200 text-xs text-emerald-900 font-medium">
                Silakan ambil pesanan Anda langsung di toko saat status berubah menjadi <strong>Siap Diambil</strong>.
              </div>
            )}
          </div>
        )}

        {/* Status Stepper Card */}
        <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] p-3 shadow-3d">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sora font-bold text-sm text-[var(--ink)]">Status Pesanan</h2>
            <span className={`text-[var(--text-caption)] font-bold px-2.5 py-0.5 rounded-full ${getOrderStatusColor(order.status, shipping.metode)}`}>
              {getOrderStatusLabel(order.status, shipping.metode)}
            </span>
          </div>

          {order.status !== 'dibatalkan' && order.status !== 'tidak_diambil' && (
            <div className="space-y-2">
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
              <div className="flex justify-between text-[10px] text-[var(--ink-soft)] font-medium px-0.5">
                <span className={currentIdx >= 0 ? 'text-[var(--ink)] font-bold' : ''}>Menunggu</span>
                <span className={currentIdx >= 1 ? 'text-[var(--ink)] font-bold' : ''}>Diproses</span>
                <span className={currentIdx >= 2 ? 'text-[var(--ink)] font-bold' : ''}>
                  {shipping.isDelivery ? 'Diantar' : 'Siap Diambil'}
                </span>
                <span className={currentIdx >= 3 ? 'text-[var(--ink)] font-bold' : ''}>Selesai</span>
              </div>
            </div>
          )}

          {/* Pengantaran ke Alamat (siap_diambil -> Pesanan Proses Pengantaran) */}
          {order.status === 'siap_diambil' && shipping.isDelivery && (
            <div className="mt-4 p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between font-bold text-blue-900">
                <span className="flex items-center gap-1.5">
                  <Truck size={16} className="text-blue-700 animate-pulse" />
                  <span>Pesanan Sedang Diantar ke Alamat Anda!</span>
                </span>
                {shipping.estimasiMenit && (
                  <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
                    ±{shipping.estimasiMenit} Menit
                  </span>
                )}
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                Kurir sedang dalam perjalanan mengantarkan pesanan ke <strong>{shipping.alamat || 'alamat Anda'}</strong>. Mohon pastikan nomor HP aktif dan siapkan uang pas COD saat kurir tiba.
              </p>
            </div>
          )}

          {/* Sisa Waktu Pengambilan COD (siap_diambil + ambil_di_toko) */}
          {order.status === 'siap_diambil' && !shipping.isDelivery && order.batas_waktu_ambil && (
            <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between font-bold text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className="text-emerald-700" />
                  <span>Sisa Waktu Pengambilan:</span>
                </span>
                <span className="bg-emerald-200/90 text-emerald-900 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
                  {getPickupCountdown(order.batas_waktu_ambil).text}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                Pesanan sudah siap di toko! Silakan ambil sebelum batas waktu berakhir ({formatBatasWaktu(order.batas_waktu_ambil)}). Pesanan yang tidak diambil hingga batas waktu akan otomatis dibatalkan dan stok dikembalikan.
              </p>
            </div>
          )}

          {/* Estimasi Waktu Tiba Pengantaran (Antar Alamat) */}
          {shipping.isDelivery && shipping.estimasiMenit && (order.status === 'menunggu_diproses' || order.status === 'diproses') && (
            <div className="mt-4 p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between font-bold text-blue-900">
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className="text-blue-700" />
                  <span>Estimasi Pesanan Tiba:</span>
                </span>
                <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
                  ±{shipping.estimasiMenit} Menit
                </span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                Pesanan sedang disiapkan untuk diantar ke alamat Anda. Mohon siapkan uang pas COD saat kurir tiba.
              </p>
            </div>
          )}

          {/* Alert Tidak Diambil */}
          {order.status === 'tidak_diambil' && (
            <div className="mt-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-950 space-y-1.5 shadow-xs">
              <p className="font-bold flex items-center gap-1.5 text-rose-800">
                <AlertTriangle size={15} className="text-rose-600 shrink-0" />
                <span>Pesanan Dibatalkan (Tidak Diambil)</span>
              </p>
              <p className="text-[11px] text-rose-800 leading-relaxed font-medium">
                Pesanan ini telah dibatalkan otomatis karena melewati batas waktu pengambilan maksimal (2x24 jam) pada {formatBatasWaktu(order.batas_waktu_ambil)}. Stok barang telah dikembalikan ke toko.
              </p>
            </div>
          )}
        </div>

        {/* Lokasi Pengambilan / Alamat Pengantaran */}
        <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] p-3 shadow-3d">
          {shipping.isDelivery ? (
            <>
              <h2 className="font-sora font-bold text-sm text-[var(--ink)] mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[var(--accent)]" />
                Alamat Pengantaran
              </h2>
              <div className="bg-[var(--paper)] p-3 rounded-xl border border-[var(--line)] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-soft)] block">Tujuan Pengiriman:</span>
                <p className="font-bold text-xs text-[var(--ink)] leading-relaxed">
                  {shipping.alamat || 'Alamat tujuan tidak tercantum'}
                </p>
              </div>
              {shipping.jarakKm ? (
                <p className="text-xs text-[var(--ink-soft)] mt-2 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                  Jarak Pengantaran: ~{shipping.jarakKm} km dari toko
                </p>
              ) : null}
              <p className="text-[var(--text-caption)] text-emerald-700 font-bold mt-1">
                {shipping.ongkir === 0 ? '🎉 Gratis Ongkir (Radius ≤ 7 km)' : `Ongkir: ${formatRupiah(shipping.ongkir || 15000)}`}
              </p>

              {/* Delivery estimate detail badge */}
              {shipping.estimasiMenit ? (
                <div className="mt-2.5 p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/90 flex items-center justify-between text-xs">
                  <span className="text-blue-900 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Target Waktu Pengantaran:
                  </span>
                  <span className="font-sora font-extrabold text-blue-700 bg-blue-100/90 px-2 py-0.5 rounded-md text-[11px]">
                    ±{shipping.estimasiMenit} Menit
                  </span>
                </div>
              ) : null}
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
        <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] p-3 shadow-3d">
          <h2 className="font-sora font-bold text-sm text-[var(--ink)] mb-2">Info Pemesan</h2>
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
                {shipping.isDelivery ? 'Diantar ke Alamat' : 'Ambil di Toko'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ink-soft)]">Pembayaran</span>
              <span className="font-bold text-[var(--ink)]">
                COD (Bayar saat {shipping.isDelivery ? 'Pesanan Tiba' : 'Ambil di Toko'})
              </span>
            </div>
            {shipping.cleanCatatan && (
              <div className="flex justify-between items-start pt-1 border-t border-[var(--line)]">
                <span className="text-[var(--ink-soft)] shrink-0">Catatan</span>
                <span className="font-bold text-right max-w-[65%] text-[var(--ink)]">{shipping.cleanCatatan}</span>
              </div>
            )}
          </div>
        </div>


        {/* Item Pesanan (Struk Nota Dashed) */}
        <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] p-3 shadow-3d">
          <h2 className="font-sora font-bold text-sm text-[var(--ink)] mb-2">Item Pesanan</h2>
          <div className="space-y-2">
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
            <span>Biaya Pengiriman ({shipping.isDelivery ? 'Diantar' : 'Ambil di Toko'})</span>
            <span className={`font-sora font-semibold ${shipping.ongkir === 0 ? 'text-emerald-700' : 'text-[var(--ink)]'}`}>
              {shipping.isDelivery
                ? (shipping.ongkir === 0 ? 'Gratis (≤ 7 km)' : formatRupiah(shipping.ongkir || 15000))
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
            <div className="pt-1.5 flex justify-between items-center text-xs text-[var(--warning)] font-semibold">
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

        <p className="text-[var(--text-caption)] text-[var(--ink-soft)] text-center font-medium">
          ID Pesanan: {order.id.slice(0, 8).toUpperCase()}
        </p>
      </div>
    </div>
  )
}

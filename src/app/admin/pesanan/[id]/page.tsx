// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { 
  formatRupiah, 
  getOrderStatusLabel, 
  getOrderStatusColor, 
  formatBatasWaktu, 
  getPickupCountdown,
  parseOrderShippingInfo 
} from '@/lib/utils'
import { updateOrderStatus } from '@/lib/actions/orders'
import PrintReceiptButton from '@/components/PrintReceiptButton'
import DeleteOrderButton from '@/components/admin/DeleteOrderButton'
import AdminPageTitle from '@/components/admin/AdminPageTitle'
import { 
  Truck, 
  Store, 
  MapPin, 
  Clock, 
  FileText, 
  AlertTriangle, 
  Phone, 
  User, 
  Calendar, 
  Hash, 
  Info 
} from 'lucide-react'

interface AdminOrderDetailProps {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailProps) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: order }, { data: store }] = await Promise.all([
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single(),
    supabase.from('store_info').select('*').single(),
  ])

  if (!order) notFound()

  // Parse structured shipping info directly from columns, with fallback to legacy catatan
  const shipping = parseOrderShippingInfo(order)
  const isDelivery = shipping.isDelivery

  const statuses = [
    { value: 'menunggu_diproses', label: 'Menunggu Diproses' },
    { value: 'diproses', label: 'Sedang Diproses' },
    { 
      value: 'siap_diambil', 
      label: isDelivery ? 'Pesanan Proses Pengantaran' : 'Siap Diambil' 
    },
    { value: 'selesai', label: 'Selesai' },
    { 
      value: 'tidak_diambil', 
      label: isDelivery ? 'Gagal Diantar (Kembalikan Stok)' : 'Tidak Diambil (Kembalikan Stok)' 
    },
    { value: 'dibatalkan', label: 'Batalkan Pesanan (Kembalikan Stok)' },
  ]

  return (
    <div className="space-y-4">
      <AdminPageTitle
        title="Detail Pesanan"
        subtitle={`ID: #${order.id.slice(0, 8).toUpperCase()}`}
        backHref="/admin/pesanan"
        className="print:hidden"
        rightSlot={<PrintReceiptButton order={order} store={store} />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* 1. KARTU INFO PESANAN */}
          <div className="bg-white border rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h2 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-500" />
                Info Pesanan
              </h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${getOrderStatusColor(order.status, shipping.metode)}`}>
                {getOrderStatusLabel(order.status, shipping.metode)}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-gray-400" /> ID Pesanan
                </span>
                <span className="font-mono text-xs font-semibold text-gray-800">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" /> Tanggal Dibuat
                </span>
                <span className="text-xs text-gray-700">
                  {new Date(order.created_at).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" /> Nama Pembeli
                </span>
                <span className="font-medium text-xs text-gray-900">{order.nama_pemesan}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> WhatsApp / HP
                </span>
                <a
                  href={`https://wa.me/${(order.no_hp_pemesan || '').replace(/^0/, '62').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  {order.no_hp_pemesan}
                </a>
              </div>
            </div>

            {/* Catatan Bebas Pembeli (HANYA catatan dari pembeli, tanpa teks data pengiriman) */}
            <div className="pt-2 border-t">
              {shipping.cleanCatatan ? (
                <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-xs space-y-1">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-700" />
                    Catatan Khusus Pembeli:
                  </span>
                  <p className="text-amber-950 font-medium whitespace-pre-wrap leading-relaxed">
                    &ldquo;{shipping.cleanCatatan}&rdquo;
                  </p>
                </div>
              ) : (
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gray-300" /> Catatan Pembeli
                  </span>
                  <span className="text-gray-400 italic">Tidak ada catatan</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. KARTU TERPISAH: INFO PENGIRIMAN (TERSTRUKTUR) */}
          <div className="bg-white border rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h2 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                {isDelivery ? <Truck className="w-4 h-4 text-blue-600" /> : <Store className="w-4 h-4 text-emerald-600" />}
                Info Pengiriman
              </h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                isDelivery 
                  ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {isDelivery ? '🛵 Diantar ke Alamat' : '🏪 Ambil di Toko (COD)'}
              </span>
            </div>

            {isDelivery ? (
              <div className="space-y-3 text-sm">
                {/* Alamat Tujuan Pengantaran */}
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    Alamat Tujuan Pembeli:
                  </span>
                  <p className="text-xs font-semibold text-gray-900 leading-relaxed pl-5">
                    {shipping.alamat || 'Alamat tidak dicantumkan oleh pembeli'}
                  </p>
                </div>

                {/* Data Pengiriman Terstruktur */}
                <div className="space-y-2 text-xs pt-1">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-500">Metode</span>
                    <span className="font-semibold text-blue-900">Diantar ke Alamat (COD)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-500">Jarak Tempuh</span>
                    <span className="font-semibold text-gray-900">
                      {shipping.jarakKm !== null ? `~${shipping.jarakKm} km dari toko` : 'Dalam radius pengantaran'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-500">Ongkos Kirim</span>
                    <span className="font-bold text-emerald-700">
                      {shipping.ongkir === 0 ? '🎉 Gratis (Radius ≤ 7 km)' : formatRupiah(shipping.ongkir)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500">Estimasi Waktu Tiba</span>
                    <span className="bg-blue-600 text-white font-extrabold px-2.5 py-0.5 rounded-full text-[11px]">
                      ±{shipping.estimasiMenit ?? 25} Menit
                    </span>
                  </div>
                </div>

                {/* Petunjuk / Target Kurir */}
                <div className="p-2.5 rounded-xl bg-gray-50 border text-[11px] text-gray-600 space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-gray-800">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Rincian Waktu Antar:</span>
                  </div>
                  <p className="leading-relaxed">
                    Persiapan pesanan ({store?.estimasi_menit_tambahan ?? 15} mnt) + Perjalanan (~{shipping.jarakKm || 3} km × {store?.estimasi_menit_per_km ?? 5} mnt/km). Total estimasi kurir tiba: ±{shipping.estimasiMenit ?? 25} menit.
                  </p>
                </div>

                {order.status === 'siap_diambil' && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-blue-900">
                      <Truck className="w-4 h-4 text-blue-600 animate-pulse" />
                      <span>Status: Pesanan Proses Pengantaran</span>
                    </p>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      Kurir sedang dalam proses mengantarkan pesanan ke <strong>{shipping.alamat || 'alamat pemesan'}</strong>. Klik tombol &ldquo;Selesai&rdquo; setelah barang berhasil diserahkan dan uang COD diterima.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Lokasi Pengambilan:
                  </span>
                  <p className="text-xs font-semibold text-gray-900 leading-relaxed pl-5">
                    {store?.nama_toko || 'PENGENJEK MART'} — {store?.alamat_toko || 'Desa Pengenjek, Kec. Jonggat, Lombok Tengah'}
                  </p>
                </div>

                <div className="space-y-2 text-xs pt-1">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-500">Metode</span>
                    <span className="font-semibold text-emerald-900">Ambil di Toko (COD)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-500">Ongkos Kirim</span>
                    <span className="font-bold text-emerald-700">Rp 0 (Gratis)</span>
                  </div>
                  {order.batas_waktu_ambil && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-500">Batas Waktu Pengambilan</span>
                      <span className="font-semibold text-emerald-800">
                        {formatBatasWaktu(order.batas_waktu_ambil)}
                      </span>
                    </div>
                  )}
                </div>

                {order.status === 'siap_diambil' && order.batas_waktu_ambil && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Sisa Waktu Pengambilan:</span>
                      </span>
                      <span className="text-[11px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                        {getPickupCountdown(order.batas_waktu_ambil).text}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-relaxed">
                      Batas akhir: {formatBatasWaktu(order.batas_waktu_ambil)}. Jika lewat, pesanan otomatis berstatus &ldquo;Tidak Diambil&rdquo; dan stok barang dikembalikan.
                    </p>
                  </div>
                )}
              </div>
            )}

            {order.status === 'tidak_diambil' && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Pesanan Tidak Diambil / Dibatalkan</span>
                </p>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  Pesanan telah melewati batas waktu maksimal (2x24 jam). Seluruh kuantitas produk dalam pesanan ini telah otomatis dikembalikan ke stok toko.
                </p>
                {order.batas_waktu_ambil && (
                  <p className="text-[10px] text-rose-600 font-medium">
                    Batas waktu lewat pada: {formatBatasWaktu(order.batas_waktu_ambil)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 3. UPDATE STATUS */}
          <div className="bg-white border rounded-2xl p-4 shadow-xs">
            <h2 className="font-semibold mb-3 text-sm text-gray-900">Update Status Pesanan</h2>
            <div className="space-y-2">
              {statuses.map(({ value, label }) => {
                const isCurrent = order.status === value
                const updateAction = updateOrderStatus.bind(null, order.id, value)
                return (
                  <form key={value} action={updateAction}>
                    <button
                      type="submit"
                      disabled={isCurrent}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                        isCurrent
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 cursor-default font-bold shadow-xs'
                          : value === 'dibatalkan' || value === 'tidak_diambil'
                          ? 'bg-white hover:bg-rose-50 border-rose-200 text-rose-700 shadow-xs active:scale-[0.98]'
                          : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-800 shadow-xs active:scale-[0.98]'
                      }`}
                    >
                      {isCurrent ? '✓ ' : ''}{label}
                    </button>
                  </form>
                )
              })}
            </div>
            <div className="mt-4 pt-3 border-t">
              <DeleteOrderButton orderId={order.id} orderNumber={order.id.slice(0, 8).toUpperCase()} />
            </div>
          </div>
        </div>

        {/* Right Column — Item Pesanan & Rincian Pembayaran */}
        <div className="bg-white border rounded-2xl p-4 shadow-xs space-y-4 h-fit">
          <div className="border-b pb-2.5">
            <h2 className="font-semibold text-sm text-gray-900">Item Pesanan ({order.order_items?.length || 0})</h2>
          </div>

          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between items-start border-b pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.nama_produk}</p>
                  <p className="text-xs text-gray-500">
                    {formatRupiah(item.harga_saat_beli)} × {item.qty}
                  </p>
                </div>
                <span className="font-bold text-sm text-gray-800">{formatRupiah(item.subtotal)}</span>
              </div>
            ))}
          </div>

          {/* Rincian Finansial */}
          <div className="border-t pt-3 space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal Produk</span>
              <span className="font-semibold text-gray-800">{formatRupiah(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongkos Kirim ({isDelivery ? 'Diantar ke Alamat' : 'Ambil di Toko'})</span>
              <span className={`font-semibold ${shipping.ongkir === 0 ? 'text-emerald-700' : 'text-gray-800'}`}>
                {isDelivery ? (shipping.ongkir === 0 ? 'Gratis (≤ 7 km)' : formatRupiah(shipping.ongkir)) : 'Gratis'}
              </span>
            </div>
            {order.diskon_poin > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Diskon Poin Digunakan ({order.poin_digunakan} poin)</span>
                <span>-{formatRupiah(order.diskon_poin)}</span>
              </div>
            )}
            <div className="border-t pt-2.5 flex justify-between items-center text-sm font-bold text-gray-900">
              <span>Total Tagihan (COD)</span>
              <span className="text-base text-emerald-600 font-extrabold">{formatRupiah(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


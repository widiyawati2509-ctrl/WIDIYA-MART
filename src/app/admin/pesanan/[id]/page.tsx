// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatRupiah, getOrderStatusLabel, getOrderStatusColor, formatBatasWaktu, getPickupCountdown } from '@/lib/utils'
import { updateOrderStatus } from '@/lib/actions/orders'
import PrintReceiptButton from '@/components/PrintReceiptButton'
import DeleteOrderButton from '@/components/admin/DeleteOrderButton'
import AdminPageTitle from '@/components/admin/AdminPageTitle'

interface AdminOrderDetailProps {
  params: Promise<{ id: string }>
}

const statuses = [
  { value: 'menunggu_diproses', label: 'Menunggu Diproses' },
  { value: 'diproses', label: 'Sedang Diproses' },
  { value: 'siap_diambil', label: 'Siap Diambil' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'tidak_diambil', label: 'Tidak Diambil (Kembalikan Stok)' },
  { value: 'dibatalkan', label: 'Batalkan Pesanan (Kembalikan Stok)' },
]

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

  return (
    <div>
      <AdminPageTitle
        title="Detail Pesanan"
        subtitle={`ID: #${order.id.slice(0, 8).toUpperCase()}`}
        backHref="/admin/pesanan"
        className="print:hidden"
        rightSlot={<PrintReceiptButton order={order} store={store} />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left */}
        <div className="space-y-4">
          <div className="bg-white border rounded-2xl p-4 space-y-3">
            <h2 className="font-semibold mb-1">Info Pesanan</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">ID</span>
                <span className="font-mono text-xs">{order.id.slice(0, 12)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tanggal</span>
                <span>{new Date(order.created_at).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pemesan</span>
                <span className="font-medium">{order.nama_pemesan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">No. HP</span>
                <span>{order.no_hp_pemesan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pengiriman</span>
                <span className="font-medium text-right">
                  {order.metode_pengiriman === 'antar_alamat' ? 'Diantar ke Alamat' : 'Ambil di Toko (COD)'}
                </span>
              </div>
              {order.metode_pengiriman === 'antar_alamat' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Alamat Kirim</span>
                    <span className="font-medium text-right max-w-[65%] text-xs text-gray-800">
                      {order.alamat_pengiriman || '-'}
                    </span>
                  </div>
                  {order.jarak_km ? (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Jarak</span>
                      <span className="font-medium">~{order.jarak_km} km</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ongkir</span>
                    <span className="font-bold text-emerald-700">
                      {order.ongkir === 0 ? 'Gratis (Radius ≤ 7 km)' : formatRupiah(order.ongkir || 0)}
                    </span>
                  </div>
                </>
              )}
              {order.catatan && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Catatan</span>
                  <span className="text-right max-w-[60%]">{order.catatan}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-gray-500">Status</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getOrderStatusColor(order.status)}`}>
                  {getOrderStatusLabel(order.status)}
                </span>
              </div>
            </div>

            {/* Target Waktu Pengantaran Admin */}
            {order.metode_pengiriman === 'antar_alamat' && order.estimasi_menit && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5 text-blue-900">
                    <span>🛵</span>
                    <span>Target Waktu Antar Kurir:</span>
                  </span>
                  <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
                    ±{order.estimasi_menit} Menit
                  </span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                  Rincian: Persiapan toko ({store?.estimasi_menit_tambahan ?? 15} mnt) + Perjalanan (~{order.jarak_km || 3} km × {store?.estimasi_menit_per_km ?? 5} mnt).
                </p>
              </div>
            )}

            {/* Informasi Batas Ambil / Status Tidak Diambil */}
            {order.status === 'siap_diambil' && order.batas_waktu_ambil && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>⏰ Batas Waktu Pengambilan COD</span>
                  <span className="text-[11px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-semibold">
                    {getPickupCountdown(order.batas_waktu_ambil).text}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Batas akhir: <strong>{formatBatasWaktu(order.batas_waktu_ambil)}</strong>. Jika lewat, pesanan otomatis berstatus &ldquo;Tidak Diambil&rdquo; dan stok barang dikembalikan.
                </p>
              </div>
            )}

            {order.status === 'tidak_diambil' && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-xs text-rose-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-rose-800">
                  <span>⚠️</span>
                  <span>Pesanan Tidak Diambil Tepat Waktu</span>
                </p>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  Pesanan telah melewati batas waktu pengambilan (2x24 jam). Seluruh kuantitas produk dalam pesanan ini telah otomatis dikembalikan ke stok toko.
                </p>
                {order.batas_waktu_ambil && (
                  <p className="text-[10px] text-rose-600 font-medium">
                    Batas waktu lewat pada: {formatBatasWaktu(order.batas_waktu_ambil)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Update status */}
          <div className="bg-white border rounded-2xl p-4">
            <h2 className="font-semibold mb-3">Update Status</h2>
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
                          : 'bg-white hover:bg-[var(--paper)] border-[rgba(232,214,205,0.9)] text-[var(--ink)] shadow-xs active:scale-[0.98]'
                      }`}
                    >
                      {isCurrent ? '✓ ' : ''}{label}
                    </button>
                  </form>
                )
              })}
            </div>
            <DeleteOrderButton orderId={order.id} orderNumber={order.id.slice(0, 8).toUpperCase()} />
          </div>
        </div>

        {/* Right — items */}
        <div className="bg-white border rounded-2xl p-4">
          <h2 className="font-semibold mb-3">Item Pesanan</h2>
          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between items-start border-b pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{item.nama_produk}</p>
                  <p className="text-xs text-gray-500">
                    {formatRupiah(item.harga_saat_beli)} × {item.qty}
                  </p>
                </div>
                <span className="font-bold text-sm">{formatRupiah(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-green-600">{formatRupiah(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

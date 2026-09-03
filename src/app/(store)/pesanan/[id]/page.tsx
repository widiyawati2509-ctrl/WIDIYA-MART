// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { formatRupiah, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils'
import { ChevronLeft, CheckCircle, Clock, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import PrintReceiptButton from '@/components/PrintReceiptButton'

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

  const { data: store } = await supabase.from('store_info').select('*').single()

  const statuses = ['menunggu_diproses', 'diproses', 'siap_diambil', 'selesai']
  const currentIdx = statuses.indexOf(order.status)

  return (
    <div className="max-w-lg mx-auto">
      <div className="sticky top-0 z-10 bg-white px-4 py-3 flex items-center justify-between border-b print:hidden">
        <div className="flex items-center gap-2">
          <Link href="/pesanan" className="p-1 -ml-1 rounded-full hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold">Detail Pesanan</span>
        </div>
        <PrintReceiptButton />
      </div>

      <div className="p-4 space-y-3">
        {/* Status */}
        <div className="bg-white border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Status Pesanan</h2>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${getOrderStatusColor(order.status)}`}>
              {getOrderStatusLabel(order.status)}
            </span>
          </div>

          {order.status !== 'dibatalkan' && (
            <div className="flex items-center gap-0">
              {statuses.map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    i <= currentIdx ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {i < currentIdx ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < statuses.length - 1 && (
                    <div className={`flex-1 h-1 ${i < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Store info */}
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
          <h2 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Lokasi Pengambilan
          </h2>
          <p className="font-medium text-sm">{store?.nama_toko}</p>
          {store?.alamat_toko && <p className="text-sm text-gray-600 mt-0.5">{store.alamat_toko}, {store.kota}</p>}
          {store?.jam_operasional && (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {store.jam_operasional}
            </p>
          )}
          {store?.whatsapp && (
            <a
              href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-sm text-green-600 flex items-center gap-1 font-medium"
            >
              <Phone className="w-3 h-3" /> Hubungi via WhatsApp
            </a>
          )}
        </div>

        {/* Pemesan */}
        <div className="bg-white border rounded-2xl p-4">
          <h2 className="font-semibold mb-3">Info Pemesan</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Nama</span>
              <span className="font-medium">{order.nama_pemesan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">No. HP</span>
              <span className="font-medium">{order.no_hp_pemesan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pembayaran</span>
              <span className="font-medium">COD (Bayar di Toko)</span>
            </div>
            {order.catatan && (
              <div className="flex justify-between">
                <span className="text-gray-500">Catatan</span>
                <span className="font-medium text-right max-w-[60%]">{order.catatan}</span>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white border rounded-2xl p-4">
          <h2 className="font-semibold mb-3">Item Pesanan</h2>
          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">{item.nama_produk}</p>
                  <p className="text-xs text-gray-500">
                    {formatRupiah(item.harga_saat_beli)} × {item.qty}
                  </p>
                </div>
                <span className="text-sm font-bold">{formatRupiah(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-green-600">{formatRupiah(order.total)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          ID Pesanan: {order.id.slice(0, 8).toUpperCase()}
        </p>
      </div>
    </div>
  )
}

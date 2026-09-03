// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatRupiah, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils'
import { updateOrderStatus } from '@/lib/actions/orders'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import PrintReceiptButton from '@/components/PrintReceiptButton'

interface AdminOrderDetailProps {
  params: Promise<{ id: string }>
}

const statuses = [
  { value: 'menunggu_diproses', label: 'Menunggu Diproses' },
  { value: 'diproses', label: 'Sedang Diproses' },
  { value: 'siap_diambil', label: 'Siap Diambil' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'dibatalkan', label: 'Batalkan Pesanan' },
]

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()

  if (!order) notFound()

  return (
    <div>
      <div className="flex items-center justify-between mb-4 print:hidden">
        <div className="flex items-center gap-2">
          <Link href="/admin/pesanan" className="p-1 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Detail Pesanan</h1>
        </div>
        <PrintReceiptButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left */}
        <div className="space-y-4">
          <div className="bg-white border rounded-2xl p-4">
            <h2 className="font-semibold mb-3">Info Pesanan</h2>
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
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-colors ${
                        isCurrent
                          ? 'bg-green-50 border-green-300 text-green-700 cursor-default'
                          : value === 'dibatalkan'
                          ? 'hover:bg-red-50 border-gray-200 text-red-600 hover:border-red-200'
                          : 'hover:bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      {isCurrent ? '✓ ' : ''}{label}
                    </button>
                  </form>
                )
              })}
            </div>
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

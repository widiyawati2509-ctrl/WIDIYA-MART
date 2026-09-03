// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatRupiah, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils'
import { Package, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function PesananPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/masuk')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(id, nama_produk, qty, harga_saat_beli)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const isEmpty = !orders || orders.length === 0

  return (
    <div className="max-w-lg mx-auto">
      <div className="sticky top-0 z-10 bg-white px-4 py-4 border-b">
        <h1 className="font-bold text-xl">Pesanan Saya</h1>
      </div>

      {isEmpty ? (
        <div className="text-center py-20 px-4">
          <div className="w-20 h-20 rounded-3xl chip-3d chip-3d-neutral mx-auto mb-4 shadow-sm">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium mb-1">Belum ada pesanan</p>
          <p className="text-gray-400 text-sm mb-6">Mulai belanja sekarang!</p>
          <Link
            href="/"
            className="btn-3d btn-3d-green px-6 py-3 rounded-2xl gap-2 text-white"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="p-3 space-y-2.5">
          {orders.map((order) => (
            <Link key={order.id} href={`/pesanan/${order.id}`}>
              <div className="btn-3d-card bg-white p-4 rounded-2xl border transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">
                      {new Date(order.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.order_items.length} item
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  {order.order_items.slice(0, 2).map((item) => item.nama_produk).join(', ')}
                  {order.order_items.length > 2 && ` +${order.order_items.length - 2} lainnya`}
                </div>
                <p className="font-bold text-green-600">{formatRupiah(order.total)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { formatRupiah, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default async function AdminPesananPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(count)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Manajemen Pesanan</h1>

      <div className="bg-white border rounded-2xl overflow-hidden">
        {!orders || orders.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Belum ada pesanan</p>
        ) : (
          <div className="divide-y">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/pesanan/${order.id}`}
                className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{order.nama_pemesan}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleString('id-ID')} · {order.no_hp_pemesan}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <p className="font-bold text-green-600 text-sm">{formatRupiah(order.total)}</p>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

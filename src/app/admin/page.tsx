// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/utils'
import { ShoppingBag, TrendingUp, AlertTriangle, Package } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase: any = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [ordersToday, ordersTotal, lowStockProducts, recentOrders] = await Promise.all([
    supabase
      .from('orders')
      .select('total', { count: 'exact' })
      .gte('created_at', today.toISOString())
      .neq('status', 'dibatalkan'),
    supabase
      .from('orders')
      .select('total')
      .neq('status', 'dibatalkan'),
    supabase
      .from('products')
      .select('id, nama, stok')
      .eq('is_active', true)
      .lt('stok', 5)
      .order('stok'),
    supabase
      .from('orders')
      .select('id, status, total, nama_pemesan, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const todayRevenue = (ordersToday.data ?? []).reduce((sum: number, o: { total: number }) => sum + o.total, 0)
  const totalRevenue = (ordersTotal.data ?? []).reduce((sum: number, o: { total: number }) => sum + o.total, 0)

  const stats = [
    { label: 'Pesanan Hari Ini', value: ordersToday.count ?? 0, icon: ShoppingBag, chip: 'chip-3d-info' },
    { label: 'Omzet Hari Ini', value: formatRupiah(todayRevenue), icon: TrendingUp, chip: 'chip-3d-positive' },
    { label: 'Produk Stok Menipis', value: lowStockProducts.data?.length ?? 0, icon: AlertTriangle, chip: 'chip-3d-warning' },
    { label: 'Total Omzet', value: formatRupiah(totalRevenue), icon: Package, chip: 'chip-3d-accent' },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map(({ label, value, icon: Icon, chip }) => (
          <div key={label} className="btn-3d-card bg-white border rounded-2xl p-4 transition-all">
            <div className={`w-10 h-10 rounded-2xl chip-3d ${chip} mb-2 shadow-sm`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {lowStockProducts.data && lowStockProducts.data.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
          <h2 className="font-semibold text-orange-800 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" />
            Stok Menipis
          </h2>
          <div className="space-y-2">
            {lowStockProducts.data.map((p: { id: string; nama: string; stok: number }) => (
              <div key={p.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{p.nama}</span>
                <span className={`font-bold ${p.stok === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                  {p.stok === 0 ? 'Habis' : `Sisa ${p.stok}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold">Pesanan Terbaru</h2>
        </div>
        <div className="divide-y">
          {(recentOrders.data ?? []).map((order: { id: string; nama_pemesan: string; created_at: string; total: number; status: string }) => (
            <Link key={order.id} href={`/admin/pesanan/${order.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-medium">{order.nama_pemesan}</p>
                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('id-ID')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">{formatRupiah(order.total)}</p>
                <p className="text-xs text-gray-500">{order.status.replace(/_/g, ' ')}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

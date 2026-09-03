// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { formatRupiah, getOrderStatusLabel } from '@/lib/utils'
import { ShoppingBag, TrendingUp, AlertTriangle, Package, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Card, Section, Badge, buttonClass } from '@/components/ui'

function getBadgeVariant(status: string): 'positive' | 'warning' | 'accent' | 'neutral' {
  switch (status) {
    case 'selesai':
      return 'positive'
    case 'siap_diambil':
      return 'accent'
    case 'sedang_disiapkan':
    case 'menunggu_diproses':
      return 'warning'
    default:
      return 'neutral'
  }
}

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
    { label: 'Pesanan Hari Ini', value: ordersToday.count ?? 0, icon: ShoppingBag, chip: 'chip-3d-info', color: 'text-ink' },
    { label: 'Omzet Hari Ini', value: formatRupiah(todayRevenue), icon: TrendingUp, chip: 'chip-3d-positive', color: 'text-positive' },
    { label: 'Produk Stok Menipis', value: lowStockProducts.data?.length ?? 0, icon: AlertTriangle, chip: 'chip-3d-negative', color: 'text-red-600' },
    { label: 'Total Omzet Toko', value: formatRupiah(totalRevenue), icon: Package, chip: 'chip-3d-accent', color: 'text-ink' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Ringkasan Toko</h1>
        <p className="text-xs text-muted mt-0.5">Pantau kinerja penjualan dan operasional Widiya Mart</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, chip, color }) => (
          <Card key={label} className="flex items-center gap-3.5 p-4 press">
            <span className={`chip-3d ${chip} grid size-11 place-items-center rounded-full shrink-0 shadow-sm`}>
              <Icon size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-strong leading-tight">{label}</p>
              <p className={`text-xl font-bold tabular-nums mt-0.5 ${color}`}>{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Low Stock Warning */}
      {lowStockProducts.data && lowStockProducts.data.length > 0 && (
        <Section title="Peringatan Stok Menipis" description="Segera restock sebelum habis">
          <div className="glass rounded-concentric p-3 divide-y divide-border">
            {lowStockProducts.data.map((p: { id: string; nama: string; stok: number }) => (
              <div key={p.id} className="flex justify-between items-center py-2.5 px-2 text-sm">
                <span className="font-medium text-ink">{p.nama}</span>
                <Badge variant={p.stok === 0 ? 'warning' : 'neutral'}>
                  {p.stok === 0 ? 'Habis' : `Sisa ${p.stok}`}
                </Badge>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Recent Orders Section */}
      <Section
        title="Pesanan Terbaru"
        description="5 transaksi terakhir yang masuk"
        action={
          <Link href="/admin/pesanan" className={buttonClass({ variant: 'ghost', size: 'sm' })}>
            Lihat semua
          </Link>
        }
      >
        <div className="glass rounded-concentric divide-y divide-border overflow-hidden">
          {(recentOrders.data ?? []).map((order: { id: string; nama_pemesan: string; created_at: string; total: number; status: string }) => (
            <Link
              key={order.id}
              href={`/admin/pesanan/${order.id}`}
              className="flex items-center justify-between p-3.5 hover:bg-zinc-50/50 transition-colors press"
            >
              <div>
                <p className="text-sm font-semibold text-ink">{order.nama_pemesan}</p>
                <p className="text-xs text-muted">
                  {new Date(order.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-positive tabular-nums">{formatRupiah(order.total)}</p>
                  <Badge variant={getBadgeVariant(order.status)} className="mt-0.5">
                    {getOrderStatusLabel(order.status)}
                  </Badge>
                </div>
                <ChevronRight size={16} className="text-muted" />
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  )
}

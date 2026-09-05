// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { formatRupiah, getOrderStatusLabel } from '@/lib/utils'
import { ShoppingBag, TrendingUp, AlertTriangle, Package, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Card, Section, Badge, buttonClass } from '@/components/ui'

export default async function AdminDashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase: any = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [ordersToday, ordersTotal, lowStockProducts, recentOrders, totalProducts] = await Promise.all([
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
    supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('is_active', true),
  ])

  const todayRevenue = (ordersToday.data ?? []).reduce((sum: number, o: { total: number }) => sum + o.total, 0)
  const totalRevenue = (ordersTotal.data ?? []).reduce((sum: number, o: { total: number }) => sum + o.total, 0)

  const stats = [
    { label: 'Pesanan Hari Ini', value: ordersToday.count ?? 0, icon: ShoppingBag, color: 'text-[var(--accent-2)]', href: '/admin/pesanan' },
    { label: 'Total Produk Aktif', value: `${totalProducts.count ?? 0} produk`, icon: Package, color: 'text-[var(--ink)]', href: '/admin/produk' },
    { label: 'Omzet Hari Ini', value: formatRupiah(todayRevenue), icon: TrendingUp, color: 'text-[var(--accent-2)]' },
    { label: 'Total Omzet Toko', value: formatRupiah(totalRevenue), icon: Package, color: 'text-[var(--ink)]' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-sora font-bold text-[var(--ink)]">Ringkasan Toko</h1>
        <p className="text-xs text-[var(--ink-soft)] mt-0.5 font-medium">Pantau kinerja penjualan dan operasional PENGENJEK MART</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, color, href }) => {
          const content = (
            <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-3.5 shadow-3d press h-full flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-[12px] bg-[var(--accent-bg)] text-[var(--accent-2)] flex items-center justify-center">
                  <Icon size={16} />
                </span>
                <p className="text-xs font-semibold text-[var(--ink-soft)] leading-tight">{label}</p>
              </div>
              <p className={`text-base font-sora font-bold tabular-nums ${color}`}>{value}</p>
            </div>
          )

          return href ? (
            <Link key={label} href={href} prefetch={true} className="block">
              {content}
            </Link>
          ) : (
            <div key={label}>{content}</div>
          )
        })}
      </div>

      {/* Low Stock Warning */}
      {lowStockProducts.data && lowStockProducts.data.length > 0 && (
        <Section title="Peringatan Stok Menipis" description="Segera restock sebelum habis">
          <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-2 divide-y divide-[var(--line)] shadow-3d">
            {lowStockProducts.data.map((p: { id: string; nama: string; stok: number }) => (
              <div key={p.id} className="flex justify-between items-center py-2 px-2 text-xs">
                <span className="font-semibold text-[var(--ink)]">{p.nama}</span>
                <span className="var-badge text-[10px] font-bold bg-red-50 text-[var(--danger)] px-2 py-0.5 rounded-full">
                  {p.stok === 0 ? 'Habis' : `Sisa ${p.stok}`}
                </span>
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
          <Link href="/admin/pesanan" className="text-xs font-sora font-bold text-[var(--accent-2)] hover:underline">
            Lihat semua
          </Link>
        }
      >
        <div className="space-y-2.5">
          {(recentOrders.data ?? []).map((order: { id: string; nama_pemesan: string; created_at: string; total: number; status: string }) => (
            <Link
              key={order.id}
              href={`/admin/pesanan/${order.id}`}
              className="block press"
            >
              <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-3 shadow-3d hover:border-[var(--accent)] transition-all flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--ink)]">{order.nama_pemesan}</p>
                  <p className="text-[11px] text-[var(--ink-soft)] mt-0.5 font-medium">
                    {new Date(order.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs font-sora font-bold text-[var(--accent-2)] tabular-nums">{formatRupiah(order.total)}</p>
                    <span className="text-[9.5px] font-bold bg-[var(--accent-bg)] text-[var(--accent-2)] px-2 py-0.5 rounded-full inline-block mt-0.5">
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-[var(--ink-soft)]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  )
}

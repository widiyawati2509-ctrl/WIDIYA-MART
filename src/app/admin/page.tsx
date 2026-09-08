// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { formatRupiah, getOrderStatusLabel, getWitaStartOfDay } from '@/lib/utils'
import { ShoppingBag, TrendingUp, AlertTriangle, Package, ChevronRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import AdminPageTitle from '@/components/admin/AdminPageTitle'
import AdminDashboardLive from '@/components/admin/AdminDashboardLive'
import { Section } from '@/components/ui'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminDashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase: any = await createClient()

  // Menggunakan awal hari zona waktu WITA (00:00:00 WITA) yang akurat
  const startOfDayWita = getWitaStartOfDay()

  const [ordersToday, completedOrders, lowStockProducts, recentOrders, totalProducts] = await Promise.all([
    // 1. Pesanan masuk hari ini (tidak dibatalkan / tidak diambil)
    supabase
      .from('orders')
      .select('id, total, status, created_at, updated_at', { count: 'exact' })
      .gte('created_at', startOfDayWita.toISOString())
      .neq('status', 'dibatalkan')
      .neq('status', 'tidak_diambil'),

    // 2. Seluruh transaksi yang sudah SELESAI (uang sah masuk menjadi omzet toko)
    supabase
      .from('orders')
      .select('id, total, created_at, updated_at, status')
      .eq('status', 'selesai'),

    // 3. Peringatan stok menipis
    supabase
      .from('products')
      .select('id, nama, stok')
      .eq('is_active', true)
      .lt('stok', 5)
      .order('stok'),

    // 4. 5 transaksi terakhir untuk pemantauan cepat
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),

    // 5. Total produk aktif
    supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('is_active', true),
  ])

  // Omzet Hari Ini: Pesanan berstatus 'selesai' yang diselesaikan atau dibuat pada hari ini (WITA)
  const completedTodayList = (completedOrders.data ?? []).filter((o: any) => {
    const createdDate = new Date(o.created_at)
    const updatedDate = o.updated_at ? new Date(o.updated_at) : createdDate
    return createdDate >= startOfDayWita || updatedDate >= startOfDayWita
  })

  const todayRevenue = completedTodayList.reduce(
    (sum: number, o: { total: number }) => sum + Number(o.total || 0),
    0
  )

  // Total Omzet Toko: Akumulasi seluruh pesanan yang berstatus 'selesai'
  const totalRevenue = (completedOrders.data ?? []).reduce(
    (sum: number, o: { total: number }) => sum + Number(o.total || 0),
    0
  )

  const stats = [
    {
      label: 'Pesanan Hari Ini',
      value: ordersToday.count ?? 0,
      sublabel: `${completedTodayList.length} pesanan selesai`,
      icon: ShoppingBag,
      color: 'text-[var(--accent-2)]',
      href: '/admin/pesanan',
    },
    {
      label: 'Total Produk Aktif',
      value: `${totalProducts.count ?? 0} produk`,
      sublabel: 'siap dibeli pembeli',
      icon: Package,
      color: 'text-[var(--ink)]',
      href: '/admin/produk',
    },
    {
      label: 'Omzet Hari Ini',
      value: formatRupiah(todayRevenue),
      sublabel: `${completedTodayList.length} pesanan selesai hari ini`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      href: '/admin/pesanan?status=selesai',
    },
    {
      label: 'Total Omzet Toko',
      value: formatRupiah(totalRevenue),
      sublabel: `${(completedOrders.data ?? []).length} total pesanan selesai`,
      icon: CheckCircle2,
      color: 'text-[var(--accent-2)]',
      href: '/admin/pesanan?status=selesai',
    },
  ]

  return (
    <div className="space-y-4">
      <AdminPageTitle
        title="Ringkasan Toko"
        subtitle="Pantau kinerja penjualan dan omzet real-time PENGENJEK MART"
        rightSlot={<AdminDashboardLive />}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map(({ label, value, sublabel, icon: Icon, color, href }) => {
          const content = (
            <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] p-2.5 shadow-3d press h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--accent-bg)] text-[var(--accent-2)] flex items-center justify-center shrink-0">
                    <Icon size={16} />
                  </span>
                  <p className="text-xs font-semibold text-[var(--ink-soft)] leading-tight">{label}</p>
                </div>
                <p className={`text-base font-sora font-bold tabular-nums ${color}`}>{value}</p>
              </div>
              {sublabel && (
                <p className="text-[10.5px] font-medium text-[var(--ink-soft)] mt-2 pt-1.5 border-t border-[var(--line)] line-clamp-1">
                  {sublabel}
                </p>
              )}
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
          <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] p-2 divide-y divide-[var(--line)] shadow-3d">
            {lowStockProducts.data.map((p: { id: string; nama: string; stok: number }) => (
              <div key={p.id} className="flex justify-between items-center py-2 px-2 text-xs">
                <span className="font-semibold text-[var(--ink)]">{p.nama}</span>
                <span className="var-badge text-[var(--text-caption)] font-bold bg-red-50 text-[var(--danger)] px-2 py-0.5 rounded-full">
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
          {(recentOrders.data ?? []).map((order: { id: string; nama_pemesan: string; created_at: string; total: number; status: string; metode_pengiriman?: string | null }) => (
            <Link
              key={order.id}
              href={`/admin/pesanan/${order.id}`}
              className="block press"
            >
              <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] p-3 shadow-3d hover:border-[var(--accent)] transition-all flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--ink)]">{order.nama_pemesan}</p>
                  <p className="text-[var(--text-caption)] text-[var(--ink-soft)] mt-0.5 font-medium">
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
                    <span className="text-[var(--text-caption)] font-bold bg-[var(--accent-bg)] text-[var(--accent-2)] px-2 py-0.5 rounded-full inline-block mt-0.5">
                      {getOrderStatusLabel(order.status, order.metode_pengiriman)}
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

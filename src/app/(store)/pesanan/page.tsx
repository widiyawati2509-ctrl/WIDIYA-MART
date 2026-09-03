// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatRupiah, getOrderStatusLabel } from '@/lib/utils'
import { Package, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { EmptyState, Badge } from '@/components/ui'

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
    <div className="max-w-lg mx-auto pb-28">
      <div className="glass sticky top-0 z-40 px-4 py-3.5 border-b border-border mb-4">
        <h1 className="font-bold text-lg text-ink">Pesanan Saya</h1>
        <p className="text-xs text-muted">Lacak status pesanan yang diambil di toko</p>
      </div>

      <div className="px-4">
        {isEmpty ? (
          <EmptyState
            icon={Package}
            message="Kamu belum memiliki riwayat pesanan."
            actionHref="/"
            actionLabel="Mulai Belanja"
          />
        ) : (
          <div className="glass divide-y divide-border overflow-hidden rounded-xl">
            {orders.map((order) => (
              <Link key={order.id} href={`/pesanan/${order.id}`} className="block press">
                <div className="p-4 hover:bg-zinc-50/50 transition-colors">
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <p className="text-xs text-muted">
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs font-semibold text-ink mt-0.5">
                        {order.order_items.length} macam barang
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getBadgeVariant(order.status)}>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                      <ChevronRight size={16} className="text-muted" />
                    </div>
                  </div>
                  <p className="text-xs text-muted line-clamp-1 mb-2">
                    {order.order_items.map((i) => `${i.nama_produk} (${i.qty})`).join(', ')}
                  </p>
                  <p className="font-bold text-positive text-sm tabular-nums">
                    {formatRupiah(order.total)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

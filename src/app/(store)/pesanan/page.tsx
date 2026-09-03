// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatRupiah, getOrderStatusLabel } from '@/lib/utils'
import { Package, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/ui'

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
    <div className="w-full pb-28">
      {/* Top Header */}
      <div className="top-header sticky top-0 z-40 px-4 py-3.5 border-b border-[rgba(232,214,205,0.8)] bg-[rgba(250,240,235,0.92)] backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(43,24,16,0.06)] mb-4">
        <h1 className="font-sora font-bold text-base text-[var(--ink)]">Pesanan Saya</h1>
        <p className="text-xs text-[var(--ink-soft)] font-medium">Lacak status pesanan yang diambil di toko</p>
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
          <div className="space-y-3.5">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/pesanan/${order.id}`}
                prefetch={true}
                className="block press"
              >
                <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-4 shadow-3d hover:border-[var(--accent)] transition-all">
                  {/* Head */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-[var(--ink-soft)]">
                      {new Date(order.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10.5px] font-bold bg-[var(--accent-bg)] text-[var(--accent-2)] px-2.5 py-0.5 rounded-full">
                        {getOrderStatusLabel(order.status)}
                      </span>
                      <ChevronRight size={14} className="text-[var(--ink-soft)]" />
                    </div>
                  </div>

                  {/* Items summary */}
                  <p className="text-xs text-[var(--ink-soft)] leading-relaxed line-clamp-2 mb-2 font-medium">
                    {order.order_items.map((i) => `${i.nama_produk} (${i.qty})`).join(', ')}
                  </p>

                  {/* Foot (Receipt Dashed line + Sora font bold) */}
                  <div className="receipt-dashed pt-2.5 flex justify-between items-center text-xs">
                    <span className="text-[var(--ink-soft)] font-medium">Total Pesanan</span>
                    <span className="font-sora font-bold text-[var(--accent-2)] text-sm tabular-nums">
                      {formatRupiah(order.total)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

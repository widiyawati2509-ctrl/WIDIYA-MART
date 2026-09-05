// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import { getUserLoyaltySummary } from '@/lib/actions/loyalty'
import { getShoppingList } from '@/lib/actions/shopping-list'
import { getOrderStatusLabel, formatRupiah } from '@/lib/utils'
import { User, ShoppingBag, ChevronRight, LogOut, ShieldCheck, Coins, Bookmark, Heart, Bell, Clock, PackageCheck, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import { Card, Button } from '@/components/ui'

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/masuk')

  const [profileResult, orderCountResult, loyaltySummary, shoppingListResult, activeOrdersResult] = await Promise.all([
    supabase.from('profiles').select('nama, role, no_hp').eq('id', user.id).single(),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    getUserLoyaltySummary(user.id),
    getShoppingList(),
    supabase
      .from('orders')
      .select('id, status, total, created_at, order_items(nama_produk, qty)')
      .eq('user_id', user.id)
      .in('status', ['menunggu_diproses', 'diproses', 'siap_diambil'])
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const profile = profileResult.data
  const orderCount = orderCountResult.count ?? 0
  const userPoints = loyaltySummary?.totalPoints ?? 0
  const shoppingListCount = shoppingListResult.data?.length ?? 0
  const activeOrders = activeOrdersResult.data ?? []

  return (
    <div className="w-full pb-28">
      {/* Sticky Top Header */}
      <PageHeader
        title="Profil Saya"
        subtitle="Pengaturan akun & riwayat belanja"
        sticky={true}
        className="mb-4"
      />

      <div className="px-4 space-y-3.5">
        {/* User Identity Card */}
        <div className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-xl)] p-4 shadow-3d flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-white flex items-center justify-center shadow-[0_6px_14px_-2px_rgba(255,107,53,.45),inset_0_1px_0_rgba(255,255,255,.4)] shrink-0">
            <User size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-sora font-bold text-base text-[var(--ink)] truncate">
                {profile?.nama || 'Pelanggan'}
              </h2>
              {profile?.role === 'admin' && (
                <span className="text-[var(--text-caption)] font-sora font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--ink-soft)] truncate font-medium">{user.email}</p>
            {profile?.no_hp && (
              <p className="text-xs text-[var(--ink)] mt-0.5 font-semibold">{profile.no_hp}</p>
            )}
          </div>
        </div>
        {/* Notifikasi Status Pesanan Aktif (Feature 4) */}
        {activeOrders.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-sora font-bold text-[var(--ink)] flex items-center gap-1.5">
                <Bell size={13} className="text-[var(--accent)] animate-pulse" />
                Status Pesanan Berjalan ({activeOrders.length})
              </h2>
              <Link href="/pesanan" className="text-[var(--text-caption)] font-bold text-[var(--accent-2)] hover:underline">
                Lihat Semua
              </Link>
            </div>

            {activeOrders.map((ao) => {
              const isReady = ao.status === 'siap_diambil'
              const isProcessing = ao.status === 'diproses'

              return (
                <Link
                  key={ao.id}
                  href={`/pesanan/${ao.id}`}
                  className={`block card-3d p-4 rounded-[var(--radius-lg)] border shadow-3d transition-all press ${
                    isReady
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-[0_10px_20px_-4px_rgba(16,185,129,0.3)]'
                      : isProcessing
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-600 shadow-[0_10px_20px_-4px_rgba(245,158,11,0.3)]'
                      : 'bg-white text-[var(--ink)] border-[rgba(232,214,205,0.9)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[var(--text-caption)] font-sora font-extrabold uppercase ${
                      isReady || isProcessing ? 'bg-white/20 text-white' : 'bg-orange-50 text-[var(--accent-2)]'
                    }`}>
                      {isReady ? <PackageCheck size={12} /> : <Clock size={12} />}
                      {getOrderStatusLabel(ao.status)}
                    </span>
                    <span className={`text-[var(--text-caption)] font-medium ${isReady || isProcessing ? 'text-white/80' : 'text-[var(--ink-soft)]'}`}>
                      #{ao.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>

                  <p className={`text-xs font-bold leading-snug line-clamp-1 ${isReady || isProcessing ? 'text-white' : 'text-[var(--ink)]'}`}>
                    {ao.order_items?.map((i: any) => `${i.nama_produk} (${i.qty})`).join(', ') || 'Rincian pesanan'}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-white/20 flex items-center justify-between text-xs">
                    <span className={isReady || isProcessing ? 'text-white/90' : 'text-[var(--ink-soft)] font-medium'}>
                      {isReady ? 'Silakan ambil di kasir toko' : isProcessing ? 'Sedang disiapkan kasir' : 'Menunggu antrean'}
                    </span>
                    <span className="font-sora font-extrabold tabular-nums">
                      {formatRupiah(ao.total)} &rarr;
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Admin Panel Quick Access (if admin) */}
        {profile?.role === 'admin' && (
          <div className="card-3d bg-gradient-to-br from-[#2B1810] to-[#1E0F0A] text-white rounded-[var(--radius-lg)] p-4 shadow-[0_12px_28px_-4px_rgba(43,24,16,0.4)] border border-[var(--warning)]/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--warning)]/20 text-[var(--warning)] flex items-center justify-center text-base">
                  👑
                </span>
                <div>
                  <h2 className="font-sora font-bold text-sm text-white leading-tight">Panel Pemilik Toko</h2>
                  <p className="text-[var(--text-caption)] text-white/80 font-medium">Akses penuh pengelolaan toko</p>
                </div>
              </div>
              <Link
                href="/admin"
                prefetch={true}
                className="press px-3 py-1.5 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white text-xs font-sora font-bold shadow-sm active:scale-95"
              >
                Buka Admin &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-white/10 text-center">
              <Link
                href="/admin/pesanan"
                prefetch={true}
                className="py-1.5 px-1 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-caption)] font-medium text-white/90 transition-colors"
              >
                📦 Pesanan
              </Link>
              <Link
                href="/admin/produk"
                prefetch={true}
                className="py-1.5 px-1 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-caption)] font-medium text-white/90 transition-colors"
              >
                🏷️ Produk
              </Link>
              <Link
                href="/admin/promo"
                prefetch={true}
                className="py-1.5 px-1 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-caption)] font-medium text-white/90 transition-colors"
              >
                🎉 Promo
              </Link>
              <Link
                href="/admin/poin"
                prefetch={true}
                className="py-1.5 px-1 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-caption)] font-medium text-white/90 transition-colors"
              >
                🪙 Poin
              </Link>
            </div>
          </div>
        )}

        {/* Loyalty Points Banner Card */}
        <Link
          href="/poin"
          className="block card-3d bg-gradient-to-r from-[var(--warning)]/15 via-orange-500/10 to-[var(--warning)]/15 border border-[var(--warning)]/40 rounded-[var(--radius-lg)] p-4 shadow-3d press transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--warning)] text-white flex items-center justify-center shadow-md">
                <Coins size={20} />
              </span>
              <div>
                <p className="text-[var(--text-caption)] font-medium text-[var(--ink-soft)]">Poin Belanja Saya</p>
                <p className="font-sora font-extrabold text-base text-[var(--ink)] tabular-nums">
                  {userPoints.toLocaleString('id-ID')} <span className="text-xs font-semibold text-[var(--warning)]">Poin</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-sora font-bold text-[var(--warning)] bg-[var(--warning)]/10 px-3 py-1.5 rounded-full border border-[var(--warning)]/20">
              <span>Tukar Poin</span>
              <ChevronRight size={13} />
            </div>
          </div>
        </Link>

        {/* Toko Kita Grouped Menu List */}
        <div className="menu-list space-y-1">
          <Link
            href="/daftar-belanja"
            prefetch={true}
            className="item press"
          >
            <span className="w-7 h-7 rounded-[var(--radius-sm)] bg-rose-50 text-rose-500 flex items-center justify-center">
              <Heart size={15} className="fill-rose-500/30" />
            </span>
            <span className="flex-1 font-semibold text-xs text-[var(--ink)]">Daftar Favorit (Disukai)</span>
            {shoppingListCount > 0 && (
              <span className="text-[var(--text-caption)] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full mr-1">
                {shoppingListCount}
              </span>
            )}
            <ChevronRight size={15} className="text-[var(--ink-soft)]" />
          </Link>

          <Link
            href="/pesanan"
            prefetch={true}
            className="item press"
          >
            <span className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--paper)] text-[var(--ink-soft)] flex items-center justify-center">
              <ShoppingBag size={15} />
            </span>
            <span className="flex-1 font-semibold text-xs text-[var(--ink)]">Pesanan Saya</span>
            {orderCount > 0 && (
              <span className="text-[var(--text-caption)] font-bold bg-[var(--accent-bg)] text-[var(--accent-2)] px-2 py-0.5 rounded-full mr-1">
                {orderCount}
              </span>
            )}
            <ChevronRight size={15} className="text-[var(--ink-soft)]" />
          </Link>

          <Link
            href="/poin"
            prefetch={true}
            className="item press"
          >
            <span className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--paper)] text-[var(--ink-soft)] flex items-center justify-center">
              <Coins size={15} />
            </span>
            <span className="flex-1 font-semibold text-xs text-[var(--ink)]">Histori & Skema Poin</span>
            <ChevronRight size={15} className="text-[var(--ink-soft)]" />
          </Link>

          <Link
            href="/kebijakan-privasi"
            prefetch={true}
            className="item press"
          >
            <span className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--paper)] text-[var(--ink-soft)] flex items-center justify-center">
              <ShieldCheck size={15} />
            </span>
            <span className="flex-1 font-semibold text-xs text-[var(--ink)]">Kebijakan Privasi</span>
            <ChevronRight size={15} className="text-[var(--ink-soft)]" />
          </Link>
        </div>

        {/* Logout */}
        <form action={logout} className="pt-2">
          <Button
            type="submit"
            variant="secondary"
            className="w-full py-3 text-xs font-sora font-bold text-[var(--danger)] hover:bg-red-50 hover:border-red-200"
          >
            <LogOut size={15} />
            Keluar dari Akun
          </Button>
        </form>
      </div>
    </div>
  )
}

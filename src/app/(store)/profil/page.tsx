// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import { User, ShoppingBag, ChevronRight, LogOut, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { Card, Button } from '@/components/ui'

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/masuk')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <div className="w-full pb-28">
      {/* Header Profile */}
      <div className="top-header px-4 pt-8 pb-5 border-b border-[rgba(232,214,205,0.8)] bg-[rgba(250,240,235,0.92)] shadow-[0_4px_20px_-2px_rgba(43,24,16,0.06)] mb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-[16px] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-white flex items-center justify-center shadow-[0_6px_14px_-2px_rgba(255,107,53,.45),inset_0_1px_0_rgba(255,255,255,.4)]">
            <User size={26} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-sora font-bold text-base text-[var(--ink)] truncate">
                {profile?.nama || 'Pelanggan'}
              </h1>
              {profile?.role === 'admin' && (
                <span className="text-[10px] font-sora font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
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
      </div>

      <div className="px-4 space-y-3.5">
        {/* Admin Panel Quick Access (if admin) */}
        {profile?.role === 'admin' && (
          <div className="card-3d bg-gradient-to-br from-[#2B1810] to-[#1E0F0A] text-white rounded-[20px] p-4 shadow-[0_12px_28px_-4px_rgba(43,24,16,0.4)] border border-amber-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-[12px] bg-amber-500/20 text-amber-400 flex items-center justify-center text-base">
                  👑
                </span>
                <div>
                  <h2 className="font-sora font-bold text-sm text-white leading-tight">Panel Pemilik Toko</h2>
                  <p className="text-[11px] text-amber-200/80 font-medium">Akses penuh pengelolaan toko</p>
                </div>
              </div>
              <Link
                href="/admin"
                prefetch={true}
                className="press px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-sora font-bold shadow-sm active:scale-95"
              >
                Buka Admin &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
              <Link
                href="/admin/pesanan"
                prefetch={true}
                className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-medium text-white/90 transition-colors"
              >
                📦 Pesanan
              </Link>
              <Link
                href="/admin/produk"
                prefetch={true}
                className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-medium text-white/90 transition-colors"
              >
                🏷️ Produk
              </Link>
              <Link
                href="/admin/pengaturan"
                prefetch={true}
                className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-medium text-white/90 transition-colors"
              >
                ⚙️ Pengaturan
              </Link>
            </div>
          </div>
        )}

        {/* Stat Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-[10px] bg-[var(--accent-bg)] text-[var(--accent-2)] flex items-center justify-center">
                <ShoppingBag size={17} />
              </span>
              <span className="text-xs font-semibold text-[var(--ink)]">Total Pesanan</span>
            </div>
            <span className="font-sora font-bold text-base text-[var(--accent-2)] tabular-nums">
              {orderCount ?? 0} pesanan
            </span>
          </div>
        </Card>

        {/* Toko Kita Grouped Menu List */}
        <div className="menu-list space-y-1">
          <Link
            href="/pesanan"
            prefetch={true}
            className="item press"
          >
            <span className="w-7 h-7 rounded-[8px] bg-[var(--paper)] text-[var(--ink-soft)] flex items-center justify-center">
              <ShoppingBag size={15} />
            </span>
            <span className="flex-1 font-semibold text-xs text-[var(--ink)]">Pesanan Saya</span>
            <ChevronRight size={15} className="text-[var(--ink-soft)]" />
          </Link>

          <Link
            href="/kebijakan-privasi"
            prefetch={true}
            className="item press"
          >
            <span className="w-7 h-7 rounded-[8px] bg-[var(--paper)] text-[var(--ink-soft)] flex items-center justify-center">
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

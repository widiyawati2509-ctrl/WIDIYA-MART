// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import { User, ShoppingBag, ChevronRight, LogOut } from 'lucide-react'
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
    <div className="max-w-lg mx-auto pb-28">
      {/* Header Profile */}
      <div className="glass px-4 pt-8 pb-6 border-b border-border mb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full chip-3d chip-3d-accent shadow-fab">
            <User size={26} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-lg text-ink truncate">{profile?.nama || 'Pengguna'}</h1>
            <p className="text-xs text-muted truncate">{user.email}</p>
            {profile?.no_hp && <p className="text-xs text-muted-strong mt-0.5">{profile.no_hp}</p>}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-3.5">
        {/* Stat Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="chip-3d chip-3d-positive grid size-9 place-items-center rounded-full">
                <ShoppingBag size={18} />
              </span>
              <span className="text-sm font-medium text-muted-strong">Total Pesanan</span>
            </div>
            <span className="font-bold text-lg text-positive tabular-nums">{orderCount ?? 0} pesanan</span>
          </div>
        </Card>

        {/* Grouped Menu List */}
        <div className="glass divide-y divide-border overflow-hidden rounded-xl">
          <Link
            href="/pesanan"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-zinc-50/50 transition-colors press"
          >
            <div className="flex items-center gap-3">
              <span className="chip-3d chip-3d-neutral grid size-8 place-items-center rounded-full">
                <ShoppingBag size={16} />
              </span>
              <span className="text-sm font-semibold text-ink">Pesanan Saya</span>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </Link>
        </div>

        {/* Logout */}
        <form action={logout} className="pt-2">
          <Button
            type="submit"
            variant="secondary"
            className="w-full py-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut size={16} />
            Keluar dari Akun
          </Button>
        </form>
      </div>
    </div>
  )
}

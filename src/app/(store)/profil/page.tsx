// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import { User, ShoppingBag, MapPin, ChevronRight, LogOut } from 'lucide-react'
import Link from 'next/link'

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
    <div className="max-w-lg mx-auto">
      <div className="bg-green-600 text-white px-4 pt-10 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-bold text-lg">{profile?.nama || 'Pengguna'}</h1>
            <p className="text-green-100 text-sm">{user.email}</p>
            {profile?.no_hp && <p className="text-green-100 text-sm">{profile.no_hp}</p>}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Stats */}
        <div className="bg-white border rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-green-500" />
              <span className="font-medium">Total Pesanan</span>
            </div>
            <span className="font-bold text-green-600">{orderCount ?? 0} pesanan</span>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white border rounded-2xl divide-y overflow-hidden">
          <Link href="/pesanan" className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Pesanan Saya</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        </div>

        {/* Logout */}
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-100 rounded-2xl py-4 font-medium hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </form>
      </div>
    </div>
  )
}

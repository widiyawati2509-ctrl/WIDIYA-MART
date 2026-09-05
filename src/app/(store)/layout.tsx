// @ts-nocheck
import { createClient, getAuthUser } from '@/lib/supabase/server'
import BottomNav from '@/components/BottomNav'
import UserOrderNotifier from '@/components/UserOrderNotifier'
import Link from 'next/link'

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()

  let cartCount = 0
  let isAdmin = false

  if (user) {
    const supabase = await createClient()
    const [cartResult, profileResult] = await Promise.all([
      supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single(),
    ])

    isAdmin = profileResult.data?.role === 'admin'

    const cart = cartResult.data
    if (cart) {
      const { count } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('cart_id', cart.id)
      cartCount = count ?? 0
    }
  }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen pb-24 relative bg-[var(--paper)]">
      {isAdmin && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white px-4 py-2 text-xs font-sora font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">👑</span>
            <span>Mode Admin Aktif</span>
          </div>
          <Link
            href="/admin"
            prefetch={true}
            className="px-2.5 py-1 rounded-full bg-white text-orange-600 font-extrabold text-[11px] shadow-xs active:scale-95 transition-all"
          >
            Buka Panel Admin &rarr;
          </Link>
        </div>
      )}
      <UserOrderNotifier />
      <main className="animate-page-in">{children}</main>
      <BottomNav cartCount={cartCount} isLoggedIn={!!user} />
    </div>
  )
}

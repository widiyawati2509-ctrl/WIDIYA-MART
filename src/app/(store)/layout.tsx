// @ts-nocheck
import dynamic from 'next/dynamic'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import BottomNav from '@/components/BottomNav'
import AdminThemeColor from '@/components/AdminThemeColor'
import Link from 'next/link'
import type { Viewport } from 'next'

const UserOrderNotifier = dynamic(() => import('@/components/UserOrderNotifier'))

export async function generateViewport(): Promise<Viewport> {
  const user = await getAuthUser()
  let isAdmin = false

  if (user) {
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    isAdmin = profile?.role === 'admin'
  }

  return {
    themeColor: isAdmin ? '#FF6B35' : '#FAF0EB',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  }
}

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
    <div
      className="max-w-[480px] mx-auto min-h-screen pb-24 relative bg-[var(--paper)]"
      style={{ '--admin-bar-offset': isAdmin ? 'calc(34px + env(safe-area-inset-top, 0px))' : '0px' } as React.CSSProperties}
    >
      {/* Theme color manager: #FF6B35 for active admin mode, #FAF0EB (--paper) for regular visitors */}
      {isAdmin && <meta name="theme-color" content="#FF6B35" />}
      <AdminThemeColor isAdmin={isAdmin} />

      {isAdmin && (
        <div
          className="admin-bar-safe-top sticky top-0 z-50 text-white shadow-header bg-gradient-to-r from-[#FF6B35] via-[#E85521] to-[#FF6B35]"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="h-[34px] px-3.5 py-1 text-xs font-sora font-semibold flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">👑</span>
              <span>Mode Admin</span>
            </div>
            <Link
              href="/admin"
              prefetch={true}
              className="px-2.5 py-0.5 rounded-full bg-white font-sora font-extrabold text-[11px] shadow-xs active:scale-95 transition-all inline-flex items-center"
              style={{ color: '#E85521' }}
            >
              <span>Panel &rarr;</span>
            </Link>
          </div>
        </div>
      )}
      <UserOrderNotifier />
      <main className="animate-page-in">{children}</main>
      <BottomNav cartCount={cartCount} isLoggedIn={!!user} />
    </div>
  )
}

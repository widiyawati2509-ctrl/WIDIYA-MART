// @ts-nocheck
import { createClient, getAuthUser } from '@/lib/supabase/server'
import BottomNav from '@/components/BottomNav'

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()

  let cartCount = 0
  if (user) {
    const supabase = await createClient()
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single()

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
      <main className="animate-page-in">{children}</main>
      <BottomNav cartCount={cartCount} isLoggedIn={!!user} />
    </div>
  )
}

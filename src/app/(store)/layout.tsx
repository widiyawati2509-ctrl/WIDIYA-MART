// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/BottomNav'

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let cartCount = 0
  if (user) {
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
    <div className="min-h-screen pb-20">
      <main>{children}</main>
      <BottomNav cartCount={cartCount} isLoggedIn={!!user} />
    </div>
  )
}

// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UserOrdersList from '@/components/UserOrdersList'

export default async function PesananPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/masuk')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(id, nama_produk, qty, harga_saat_beli)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="w-full pb-28">
      <UserOrdersList initialOrders={orders || []} />
    </div>
  )
}

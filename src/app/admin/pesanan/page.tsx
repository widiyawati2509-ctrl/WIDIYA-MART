// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import AdminOrdersList from '@/components/admin/AdminOrdersList'

export default async function AdminPesananPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(id, nama_produk, qty, harga_saat_beli, subtotal)')
    .order('created_at', { ascending: false })

  return <AdminOrdersList initialOrders={orders || []} initialStatus={params?.status} />
}

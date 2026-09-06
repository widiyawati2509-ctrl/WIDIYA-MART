// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import AdminOrdersList from '@/components/admin/AdminOrdersList'
import { checkAndExpirePickupOrders } from '@/lib/actions/orders'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPesananPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>
}) {
  const params = await searchParams

  // Cek dan kedaluwarsakan pesanan siap_diambil yang telah melewati batas waktu (2x24 jam)
  try {
    await checkAndExpirePickupOrders()
  } catch (e) {
    console.warn('Auto check pickup deadline error:', e)
  }

  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(id, nama_produk, qty, harga_saat_beli, subtotal)')
    .order('created_at', { ascending: false })

  return <AdminOrdersList initialOrders={orders || []} initialStatus={params?.status} />
}

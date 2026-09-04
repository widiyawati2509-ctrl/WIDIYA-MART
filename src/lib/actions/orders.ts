// @ts-nocheck
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { checkoutSchema } from '@/lib/validations'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any

export async function createOrder(formData: FormData): Promise<{ error?: string } | void> {
  const supabase: SupabaseClient = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Silakan login terlebih dahulu' }

  const raw = {
    nama_pemesan: formData.get('nama_pemesan') as string,
    no_hp_pemesan: formData.get('no_hp_pemesan') as string,
    catatan: formData.get('catatan') as string,
  }

  const parsed = checkoutSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  // Get cart items
  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!cart) return { error: 'Keranjang kosong' }

  const { data: items } = await supabase
    .from('cart_items')
    .select('qty, products(id, nama, harga, stok)')
    .eq('cart_id', cart.id)

  if (!items || items.length === 0) return { error: 'Keranjang kosong' }

  // Validate stock
  for (const item of items) {
    const product = item.products as { id: string; nama: string; harga: number; stok: number } | null
    if (!product) return { error: 'Produk tidak ditemukan' }
    if (product.stok < item.qty) {
      return { error: `Stok ${product.nama} tidak cukup (tersisa ${product.stok})` }
    }
  }

  const subtotal = items.reduce((sum: number, item: { qty: number; products: unknown }) => {
    const product = item.products as { harga: number } | null
    return sum + (product?.harga ?? 0) * item.qty
  }, 0)

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      subtotal,
      total: subtotal,
      nama_pemesan: parsed.data.nama_pemesan,
      no_hp_pemesan: parsed.data.no_hp_pemesan,
      catatan: parsed.data.catatan,
    })
    .select('id')
    .single()

  if (orderError || !order) return { error: 'Gagal membuat pesanan' }

  // Create order items
  const orderItems = items.map((item: { qty: number; products: unknown }) => {
    const product = item.products as { id: string; nama: string; harga: number } | null
    return {
      order_id: order.id,
      product_id: product?.id ?? null,
      nama_produk: product?.nama ?? '',
      harga_saat_beli: product?.harga ?? 0,
      qty: item.qty,
      subtotal: (product?.harga ?? 0) * item.qty,
    }
  })

  await supabase.from('order_items').insert(orderItems)

  // Decrement stock
  for (const item of items) {
    const product = item.products as { id: string; stok: number } | null
    if (product) {
      await supabase
        .from('products')
        .update({ stok: product.stok - item.qty })
        .eq('id', product.id)
    }
  }

  // Clear cart
  await supabase.from('cart_items').delete().eq('cart_id', cart.id)

  revalidatePath('/pesanan')
  redirect(`/pesanan/${order.id}`)
}

export async function updateOrderStatus(orderId: string, status: string): Promise<{ error?: string; success?: boolean }> {
  const supabase: SupabaseClient = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) return { error: 'Gagal update status' }

  revalidatePath('/admin/pesanan')
  revalidatePath(`/admin/pesanan/${orderId}`)
  return { success: true }
}

export async function deleteOrders(orderIds: string[]): Promise<{ error?: string; success?: boolean; count?: number }> {
  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    return { error: 'Pilih minimal satu pesanan untuk dihapus' }
  }

  const supabase: SupabaseClient = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Silakan login terlebih dahulu' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  if (isAdmin) {
    // Admin can delete any orders
    await supabase.from('order_items').delete().in('order_id', orderIds)
    const { error } = await supabase.from('orders').delete().in('id', orderIds)
    if (error) return { error: 'Gagal menghapus transaksi: ' + error.message }
  } else {
    // Non-admin can only delete their own orders
    const { data: userOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user.id)
      .in('id', orderIds)

    const validIds = (userOrders || []).map((o: { id: string }) => o.id)
    if (validIds.length === 0) {
      return { error: 'Tidak ada transaksi yang dapat dihapus' }
    }

    await supabase.from('order_items').delete().in('order_id', validIds)
    const { error } = await supabase.from('orders').delete().in('id', validIds)
    if (error) return { error: 'Gagal menghapus riwayat: ' + error.message }
  }

  revalidatePath('/admin/pesanan')
  revalidatePath('/pesanan')
  revalidatePath('/admin')
  revalidatePath('/profil')
  return { success: true, count: orderIds.length }
}

export async function deleteAllOrders(scope: 'all' | 'mine' = 'all'): Promise<{ error?: string; success?: boolean }> {
  const supabase: SupabaseClient = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Silakan login terlebih dahulu' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  if (scope === 'all' && !isAdmin) {
    return { error: 'Akses ditolak. Hanya admin yang dapat menghapus seluruh transaksi toko.' }
  }

  if (isAdmin && scope === 'all') {
    // Hapus semua order_items dan orders
    await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    const { error } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) return { error: 'Gagal menghapus semua transaksi: ' + error.message }
  } else {
    const { data: userOrders } = await supabase.from('orders').select('id').eq('user_id', user.id)
    const orderIds = (userOrders || []).map((o: { id: string }) => o.id)
    if (orderIds.length > 0) {
      await supabase.from('order_items').delete().in('order_id', orderIds)
      const { error } = await supabase.from('orders').delete().eq('user_id', user.id)
      if (error) return { error: 'Gagal menghapus riwayat pesanan: ' + error.message }
    }
  }

  revalidatePath('/admin/pesanan')
  revalidatePath('/pesanan')
  revalidatePath('/admin')
  revalidatePath('/profil')
  return { success: true }
}

export async function deleteSingleOrder(orderId: string): Promise<{ error?: string; success?: boolean }> {
  return deleteOrders([orderId])
}

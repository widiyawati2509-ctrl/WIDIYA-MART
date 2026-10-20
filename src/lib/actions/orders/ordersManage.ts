// @ts-nocheck
"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { addToCart } from "@/lib/actions/cart"

type SupabaseClient = any

export async function reorderItems(orderId: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const supabase: SupabaseClient = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, count: 0, error: 'Silakan login terlebih dahulu' }

    const { data: orderItems, error: itemsErr } = await supabase
      .from('order_items')
      .select('product_id, qty, products(id, stok, is_active)')
      .eq('order_id', orderId)

    if (itemsErr || !orderItems || orderItems.length === 0) {
      return { success: false, count: 0, error: 'Item pesanan tidak ditemukan' }
    }

    let added = 0
    for (const item of orderItems) {
      if (item.product_id && item.products && item.products.is_active && item.products.stok > 0) {
        const qtyToAdd = Math.min(item.qty, item.products.stok)
        await addToCart(item.product_id, qtyToAdd)
        added++
      }
    }

    if (added === 0) {
      return { success: false, count: 0, error: 'Stok produk pesanan sebelumnya sedang habis' }
    }

    revalidatePath('/keranjang')
    return { success: true, count: added }
  } catch (err: any) {
    return { success: false, count: 0, error: err.message }
  }
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

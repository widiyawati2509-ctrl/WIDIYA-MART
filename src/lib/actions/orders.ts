// @ts-nocheck
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { checkoutSchema } from '@/lib/validations'

import { getLoyaltyConfig, getUserLoyaltySummary } from '@/lib/actions/loyalty'
import { addToCart } from '@/lib/actions/cart'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any

export async function createOrder(formData: FormData): Promise<{ error?: string; success?: boolean; orderId?: string }> {
  try {
    const supabase: SupabaseClient = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Silakan login terlebih dahulu' }

    const raw = {
      nama_pemesan: (formData.get('nama_pemesan') as string)?.trim() || '',
      no_hp_pemesan: (formData.get('no_hp_pemesan') as string)?.replace(/[\s\-\.]/g, '')?.trim() || '',
      catatan: (formData.get('catatan') as string)?.trim() || '',
    }

    const parsed = checkoutSchema.safeParse(raw)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || 'Data pemesan tidak lengkap / nomor HP tidak valid' }
    }

    // Get cart items
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!cart) return { error: 'Keranjang belanja kosong' }

    const { data: items } = await supabase
      .from('cart_items')
      .select('qty, products(id, nama, harga, stok)')
      .eq('cart_id', cart.id)

    if (!items || items.length === 0) return { error: 'Keranjang belanja kosong' }

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

    // Loyalty points deduction handling
    const poinToRedeem = Math.max(0, parseInt(formData.get('poin_digunakan') as string) || 0)
    let diskonPoin = 0

    if (poinToRedeem > 0) {
      try {
        const config = await getLoyaltyConfig()
        if (config?.is_active) {
          const summary = await getUserLoyaltySummary(user.id)
          const userMaxPoints = summary?.totalPoints ?? 0
          const validPoints = Math.min(poinToRedeem, userMaxPoints)

          if (validPoints > 0) {
            const maxDiscount = Math.floor(subtotal * (config.max_redeem_percentage / 100))
            diskonPoin = Math.min(validPoints * config.redeem_rate, maxDiscount)
          }
        }
      } catch (e) {
        console.warn('Loyalty points calculation error:', e)
      }
    }

    // Shipping & Delivery calculations (Radius / Haversine)
    const metodePengiriman = (formData.get('metode_pengiriman') as string) || 'ambil_di_toko'
    const alamatPengiriman = (formData.get('alamat_pengiriman') as string)?.trim() || null
    const jarakKmRaw = formData.get('jarak_km') as string
    const jarakKm = jarakKmRaw && !isNaN(parseFloat(jarakKmRaw)) ? parseFloat(jarakKmRaw) : null
    const ongkirRaw = formData.get('ongkir') as string
    const ongkir = metodePengiriman === 'antar_alamat' ? (parseInt(ongkirRaw, 10) || 0) : 0

    const finalTotal = Math.max(0, subtotal - diskonPoin + ongkir)

    // Create order with fallback for non-migrated schema
    let order = null

    // 1. Attempt with loyalty and shipping columns
    const fullPayload = {
      user_id: user.id,
      subtotal,
      total: finalTotal,
      poin_digunakan: diskonPoin > 0 ? poinToRedeem : 0,
      diskon_poin: diskonPoin,
      jarak_km: jarakKm,
      ongkir: ongkir,
      alamat_pengiriman: alamatPengiriman,
      metode_pengiriman: metodePengiriman,
      nama_pemesan: parsed.data.nama_pemesan,
      no_hp_pemesan: parsed.data.no_hp_pemesan,
      catatan: parsed.data.catatan || null,
    }

    const { data: orderFull, error: orderFullError } = await supabase
      .from('orders')
      .insert(fullPayload)
      .select('id')
      .single()

    if (orderFullError) {
      console.warn('Full order insert failed, falling back to basic schema:', orderFullError.message)
      const basicPayload = {
        user_id: user.id,
        subtotal,
        total: finalTotal,
        nama_pemesan: parsed.data.nama_pemesan,
        no_hp_pemesan: parsed.data.no_hp_pemesan,
        catatan: parsed.data.catatan || null,
      }

      const { data: orderBasic, error: orderBasicError } = await supabase
        .from('orders')
        .insert(basicPayload)
        .select('id')
        .single()

      if (orderBasicError || !orderBasic) {
        console.error('Basic order insert error:', orderBasicError)
        return { error: `Gagal membuat pesanan: ${orderBasicError?.message || 'Database error'}` }
      }
      order = orderBasic
    } else {
      order = orderFull
    }

    if (!order) return { error: 'Gagal membuat pesanan (ID tidak didapatkan)' }

    // Record points debit transaction if redeemed
    if (diskonPoin > 0 && poinToRedeem > 0) {
      try {
        await supabase.from('loyalty_transactions').insert({
          user_id: user.id,
          order_id: order.id,
          points: -poinToRedeem,
          type: 'redeemed',
          description: `Diskon Rp ${diskonPoin.toLocaleString('id-ID')} pada pesanan #${order.id.slice(0, 8)}`,
        })
      } catch (e) {
        console.warn('Failed to insert loyalty redemption record:', e)
      }
    }

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

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) {
      console.error('Failed to insert order items:', itemsError)
      return { error: `Gagal menyimpan rincian pesanan: ${itemsError.message}` }
    }

    // Decrement stock
    for (const item of items) {
      const product = item.products as { id: string; stok: number } | null
      if (product) {
        await supabase
          .from('products')
          .update({ stok: Math.max(0, product.stok - item.qty) })
          .eq('id', product.id)
      }
    }

    // Clear cart
    await supabase.from('cart_items').delete().eq('cart_id', cart.id)

    revalidatePath('/pesanan')
    revalidatePath('/keranjang')

    return { success: true, orderId: order.id }
  } catch (err: any) {
    console.error('createOrder unexpected error:', err)
    return { error: err?.message || 'Terjadi kesalahan sistem saat membuat pesanan' }
  }
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

  // Credit loyalty points if status changed to 'selesai'
  if (status === 'selesai') {
    try {
      const { data: existingAward } = await supabase
        .from('loyalty_transactions')
        .select('id')
        .eq('order_id', orderId)
        .eq('type', 'earned')
        .maybeSingle()

      if (!existingAward) {
        const { data: orderData } = await supabase
          .from('orders')
          .select('user_id, total')
          .eq('id', orderId)
          .single()

        if (orderData && orderData.user_id) {
          const config = await getLoyaltyConfig()
          if (config.is_active && orderData.total >= config.min_order_amount) {
            const earned = Math.floor(orderData.total / config.threshold_amount) * config.points_per_threshold
            if (earned > 0) {
              try {
                await supabase.from('loyalty_transactions').insert({
                  user_id: orderData.user_id,
                  order_id: orderId,
                  points: earned,
                  type: 'earned',
                  description: `Poin belanja pesanan COD #${orderId.slice(0, 8).toUpperCase()}`,
                })
              } catch (txErr) {
                console.warn('loyalty_transactions table not ready:', txErr)
              }

              try {
                await supabase.from('orders').update({ poin_didapat: earned }).eq('id', orderId)
              } catch {
                // Column might not exist before migration
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Loyalty points earning credit skipped/failed:', e)
    }
  }

  revalidatePath('/admin/pesanan')
  revalidatePath(`/admin/pesanan/${orderId}`)
  revalidatePath('/pesanan')
  revalidatePath(`/pesanan/${orderId}`)
  revalidatePath('/poin')
  revalidatePath('/profil')
  return { success: true }
}

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

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

// Fixed store coordinates: PENGENJEK MART (Pengenjek, Jonggat, Lombok Tengah)
const STORE_COORDS = {
  lat: -8.636636,
  lng: 116.244461,
}
const FREE_SHIPPING_MAX_KM = 7.0
const FLAT_SHIPPING_FEE = 15000

function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

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

    // Shipping & Delivery: Recalculate on server (NEVER trust client-submitted ongkir)
    const metodePengiriman = (formData.get('metode_pengiriman') as string) || 'ambil_di_toko'
    const alamatPengiriman = (formData.get('alamat_pengiriman') as string)?.trim() || null
    const userLatRaw = formData.get('user_lat') as string
    const userLngRaw = formData.get('user_lng') as string

    let verifiedJarakKm: number | null = null
    let serverOngkir = 0

    if (metodePengiriman === 'antar_alamat') {
      if (!alamatPengiriman) {
        return { error: 'Alamat pengiriman wajib diisi untuk opsi antar ke alamat' }
      }

      if (userLatRaw && userLngRaw) {
        const userLat = parseFloat(userLatRaw)
        const userLng = parseFloat(userLngRaw)
        if (!isNaN(userLat) && !isNaN(userLng)) {
          verifiedJarakKm = calculateHaversineDistance(
            STORE_COORDS.lat,
            STORE_COORDS.lng,
            userLat,
            userLng
          )
        }
      }

      // If coordinates verified distance is within free radius (<= 7 km), ongkir is 0, else flat fee Rp 15.000
      if (verifiedJarakKm !== null && verifiedJarakKm <= FREE_SHIPPING_MAX_KM) {
        serverOngkir = 0
      } else {
        serverOngkir = FLAT_SHIPPING_FEE
      }
    } else {
      // 'ambil_di_toko'
      serverOngkir = 0
      verifiedJarakKm = 0
    }

    const finalTotal = Math.max(0, subtotal - diskonPoin + serverOngkir)

    // Decrement stock atomically before creating order to prevent race conditions and overselling
    const decrementedItems: { id: string; qty: number; nama: string }[] = []
    let stockError: string | null = null

    for (const item of items) {
      const product = item.products as { id: string; nama: string; harga: number; stok: number } | null
      if (!product) continue

      // Attempt atomic decrement via RPC
      const { data: success, error: rpcError } = await supabase.rpc('decrement_stock', {
        p_product_id: product.id,
        p_qty: item.qty,
      })

      if (rpcError) {
        // If RPC is not available in database yet, fallback to conditional atomic query
        const { data: curProd } = await supabase
          .from('products')
          .select('stok')
          .eq('id', product.id)
          .single()

        if (!curProd || curProd.stok < item.qty) {
          stockError = `Stok ${product.nama} tidak mencukupi (tersisa ${curProd?.stok ?? 0})`
          break
        }

        const { error: updateErr } = await supabase
          .from('products')
          .update({ stok: curProd.stok - item.qty })
          .eq('id', product.id)
          .gte('stok', item.qty)

        if (updateErr) {
          stockError = `Gagal memperbarui stok ${product.nama}`
          break
        }
        decrementedItems.push({ id: product.id, qty: item.qty, nama: product.nama })
      } else if (!success) {
        // Atomic decrement returned false because stock < requested qty
        stockError = `Stok ${product.nama} baru saja habis atau tidak mencukupi saat checkout diproses`
        break
      } else {
        decrementedItems.push({ id: product.id, qty: item.qty, nama: product.nama })
      }
    }

    const rollbackStock = async () => {
      for (const dec of decrementedItems) {
        try {
          await supabase.rpc('increment_stock', { p_product_id: dec.id, p_qty: dec.qty })
        } catch {
          const { data: cur } = await supabase.from('products').select('stok').eq('id', dec.id).single()
          if (cur) {
            await supabase.from('products').update({ stok: cur.stok + dec.qty }).eq('id', dec.id)
          }
        }
      }
    }

    if (stockError) {
      await rollbackStock()
      return { error: stockError }
    }

    // Insert order with complete schema (No basic fallback to prevent silent data loss)
    const orderPayload = {
      user_id: user.id,
      subtotal,
      total: finalTotal,
      poin_digunakan: diskonPoin > 0 ? poinToRedeem : 0,
      diskon_poin: diskonPoin,
      jarak_km: verifiedJarakKm,
      ongkir: serverOngkir,
      alamat_pengiriman: alamatPengiriman,
      metode_pengiriman: metodePengiriman,
      nama_pemesan: parsed.data.nama_pemesan,
      no_hp_pemesan: parsed.data.no_hp_pemesan,
      catatan: parsed.data.catatan || null,
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select('id')
      .single()

    if (orderError || !order) {
      console.error('Order creation error:', orderError)
      await rollbackStock()
      return { error: `Gagal membuat pesanan: ${orderError?.message || 'Database error'}` }
    }

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
      await supabase.from('orders').delete().eq('id', order.id)
      await rollbackStock()
      return { error: `Gagal menyimpan rincian pesanan: ${itemsError.message}` }
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

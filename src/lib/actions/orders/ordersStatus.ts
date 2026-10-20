// @ts-nocheck
"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getUserLoyaltySummary } from "@/lib/actions/loyalty"

type SupabaseClient = any

export async function restoreOrderStock(supabase: SupabaseClient, orderId: string): Promise<void> {
  try {
    const { data: items, error } = await supabase
      .from('order_items')
      .select('product_id, qty')
      .eq('order_id', orderId)

    if (error || !items) return

    for (const item of items) {
      if (item.product_id && item.qty > 0) {
        const { error: rpcErr } = await supabase.rpc('increment_stock', {
          p_product_id: item.product_id,
          p_qty: item.qty,
        })

        if (rpcErr) {
          const { data: curProd } = await supabase
            .from('products')
            .select('stok')
            .eq('id', item.product_id)
            .single()

          if (curProd) {
            await supabase
              .from('products')
              .update({ stok: curProd.stok + item.qty })
              .eq('id', item.product_id)
          }
        }
      }
    }
  } catch (err) {
    console.error(`Gagal mengembalikan stok untuk pesanan ${orderId}:`, err)
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

  // Ambil data pesanan saat ini untuk mendeteksi status sebelumnya
  let currentOrder: { status?: string; batas_waktu_ambil?: string | null; metode_pengiriman?: string | null } | null = null
  const { data: orderData } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (orderData) {
    currentOrder = orderData
  }

  const prevStatus = currentOrder?.status

  const updatePayload: Record<string, any> = { status }

  // Jika status berubah ke 'siap_diambil' dan metode pesanan adalah 'ambil_di_toko', hitung batas_waktu_ambil jika belum ada
  if (status === 'siap_diambil' && currentOrder?.metode_pengiriman !== 'antar_alamat') {
    if (!currentOrder?.batas_waktu_ambil) {
      updatePayload.batas_waktu_ambil = new Date(
        Date.now() + ORDER_PICKUP_EXPIRATION_HOURS * 60 * 60 * 1000
      ).toISOString()
    }
  }

  let { error } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId)

  // Fallback: Jika kolom batas_waktu_ambil belum ada di database atau schema cache belum sinkron, update status saja
  if (error && updatePayload.batas_waktu_ambil) {
    const isColumnError =
      error.message?.includes('batas_waktu_ambil') ||
      error.message?.includes('column') ||
      error.message?.includes('schema cache') ||
      error.code === 'PGRST204'

    if (isColumnError) {
      console.warn('orders.batas_waktu_ambil column missing in database, updating status only:', error.message)
      const { error: retryError } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
      error = retryError
    }
  }

  // Fallback: Jika enum Postgres belum ditambahkan status 'tidak_diambil'
  if (error && error.message?.includes('enum') && status === 'tidak_diambil') {
    console.warn('Enum order_status missing tidak_diambil, falling back to dibatalkan:', error.message)
    const { error: retryCancelErr } = await supabase
      .from('orders')
      .update({ status: 'dibatalkan' })
      .eq('id', orderId)
    error = retryCancelErr
  }

  if (error) {
    console.error('Gagal update status:', error)
    return { error: 'Gagal update status: ' + error.message }
  }

  // Jika status diubah ke 'tidak_diambil' atau 'dibatalkan', kembalikan stok
  // Pastikan status sebelumnya bukan 'tidak_diambil' atau 'dibatalkan' agar tidak double-restore
  if (
    (status === 'tidak_diambil' || status === 'dibatalkan') &&
    prevStatus !== 'tidak_diambil' &&
    prevStatus !== 'dibatalkan'
  ) {
    await restoreOrderStock(supabase, orderId)
  }

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

  revalidatePath('/admin')
  revalidatePath('/admin/pesanan')
  revalidatePath(`/admin/pesanan/${orderId}`)
  revalidatePath('/admin/poin')
  revalidatePath('/pesanan')
  revalidatePath(`/pesanan/${orderId}`)
  revalidatePath('/poin')
  revalidatePath('/profil')
  revalidatePath('/checkout')
  return { success: true }
}

/**
 * Cek dan tandai pesanan siap_diambil yang sudah lewat batas_waktu_ambil menjadi tidak_diambil.
 * Mengembalikan stok produk yang sebelumnya dikurangi secara atomik.
 */

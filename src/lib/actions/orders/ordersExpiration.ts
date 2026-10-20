// @ts-nocheck
"use server"

import { createClient } from "@/lib/supabase/server"
import { restoreOrderStock } from "./ordersStatus"

type SupabaseClient = any

export async function checkAndExpirePickupOrders(): Promise<{
  success: boolean
  expiredCount: number
  error?: string
}> {
  try {
    const supabase: SupabaseClient = await createClient()

    const nowIso = new Date().toISOString()
    const { data: expiredOrders, error } = await supabase
      .from('orders')
      .select('id, status, batas_waktu_ambil')
      .eq('status', 'siap_diambil')
      .not('batas_waktu_ambil', 'is', null)
      .lt('batas_waktu_ambil', nowIso)

    if (error) {
      // Jika kolom batas_waktu_ambil belum dimigrasi di DB, jangan lempar fatal error
      console.warn('checkAndExpirePickupOrders query error:', error.message)
      return { success: false, expiredCount: 0, error: error.message }
    }

    if (!expiredOrders || expiredOrders.length === 0) {
      return { success: true, expiredCount: 0 }
    }

    let expiredCount = 0
    for (const order of expiredOrders) {
      const { error: updateErr } = await supabase
        .from('orders')
        .update({ status: 'tidak_diambil' })
        .eq('id', order.id)

      if (!updateErr) {
        await restoreOrderStock(supabase, order.id)
        expiredCount++
      }
    }

    if (expiredCount > 0) {
      revalidatePath('/admin/pesanan')
      revalidatePath('/pesanan')
    }

    return { success: true, expiredCount }
  } catch (err: any) {
    console.error('checkAndExpirePickupOrders error:', err)
    return { success: false, expiredCount: 0, error: err?.message || 'Gagal memeriksa batas ambil' }
  }
}


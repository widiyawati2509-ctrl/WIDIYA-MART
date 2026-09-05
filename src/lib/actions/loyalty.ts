// @ts-nocheck
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any

export interface LoyaltyConfig {
  id: number
  is_active: boolean
  threshold_amount: number
  points_per_threshold: number
  redeem_rate: number
  min_order_amount: number
  max_redeem_percentage: number
}

const DEFAULT_LOYALTY_CONFIG: LoyaltyConfig = {
  id: 1,
  is_active: true,
  threshold_amount: 10000,
  points_per_threshold: 1,
  redeem_rate: 100,
  min_order_amount: 10000,
  max_redeem_percentage: 50,
}

export async function getLoyaltyConfig(): Promise<LoyaltyConfig> {
  try {
    const supabase: SupabaseClient = await createClient()
    const { data, error } = await supabase
      .from('loyalty_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle()

    if (error || !data) {
      return DEFAULT_LOYALTY_CONFIG
    }

    return {
      id: 1,
      is_active: data.is_active ?? true,
      threshold_amount: Number(data.threshold_amount) || 10000,
      points_per_threshold: Number(data.points_per_threshold) || 1,
      redeem_rate: Number(data.redeem_rate) || 100,
      min_order_amount: Number(data.min_order_amount) || 10000,
      max_redeem_percentage: Number(data.max_redeem_percentage) || 50,
    }
  } catch {
    return DEFAULT_LOYALTY_CONFIG
  }
}

export async function updateLoyaltyConfig(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase: SupabaseClient = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') return { success: false, error: 'Unauthorized' }

    const is_active = formData.get('is_active') === 'true' || formData.get('is_active') === 'on'
    const threshold_amount = Number(formData.get('threshold_amount')) || 10000
    const points_per_threshold = Number(formData.get('points_per_threshold')) || 1
    const redeem_rate = Number(formData.get('redeem_rate')) || 100
    const min_order_amount = Number(formData.get('min_order_amount')) || 10000
    const max_redeem_percentage = Number(formData.get('max_redeem_percentage')) || 50

    const { error } = await supabase
      .from('loyalty_config')
      .upsert({
        id: 1,
        is_active,
        threshold_amount,
        points_per_threshold,
        redeem_rate,
        min_order_amount,
        max_redeem_percentage,
        updated_at: new Date().toISOString(),
      })

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/poin')
    revalidatePath('/poin')
    revalidatePath('/checkout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function getUserLoyaltySummary(targetUserId?: string) {
  try {
    const supabase: SupabaseClient = await createClient()
    let userId = targetUserId

    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      userId = user.id
    }

    const config = await getLoyaltyConfig()

    // 1. Fetch transactions from loyalty_transactions table if available
    const { data: txs, error: txsError } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    let transactions = Array.isArray(txs) ? [...txs] : []
    const creditedOrderIds = new Set(
      transactions
        .filter((t) => t.type === 'earned' && t.order_id)
        .map((t) => t.order_id)
    )

    // 2. Fetch completed orders to ensure all completed orders are awarded points
    const { data: completedOrders } = await supabase
      .from('orders')
      .select('id, total, created_at')
      .eq('user_id', userId)
      .eq('status', 'selesai')
      .order('created_at', { ascending: false })

    if (completedOrders && completedOrders.length > 0) {
      for (const ord of completedOrders) {
        if (!creditedOrderIds.has(ord.id)) {
          const ordTotal = Number(ord.total) || 0
          if (ordTotal >= config.min_order_amount) {
            const earned = Math.floor(ordTotal / config.threshold_amount) * config.points_per_threshold
            if (earned > 0) {
              const syntheticTx = {
                id: `order_${ord.id}`,
                user_id: userId,
                order_id: ord.id,
                points: earned,
                type: 'earned',
                description: `Poin belanja pesanan COD #${ord.id.slice(0, 8).toUpperCase()}`,
                created_at: ord.created_at,
              }
              transactions.push(syntheticTx)
              creditedOrderIds.add(ord.id)

              // If loyalty_transactions table exists, try persisting in background
              if (!txsError) {
                supabase
                  .from('loyalty_transactions')
                  .insert({
                    user_id: userId,
                    order_id: ord.id,
                    points: earned,
                    type: 'earned',
                    description: `Poin belanja pesanan COD #${ord.id.slice(0, 8).toUpperCase()}`,
                  })
                  .then(() => {})
                  .catch(() => {})
              }
            }
          }
        }
      }
    }

    // Sort transactions by date desc
    transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const totalPoints = transactions.reduce((sum: number, tx: any) => sum + (Number(tx.points) || 0), 0)
    const activePoints = Math.max(0, totalPoints)
    const redeemValue = activePoints * config.redeem_rate

    return {
      totalPoints: activePoints,
      redeemValue,
      transactions,
      config,
    }
  } catch {
    return null
  }
}

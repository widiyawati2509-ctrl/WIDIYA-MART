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

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        return {
          success: false,
          error: 'Tabel loyalitas belum dibuat di database Supabase. Jalankan file MASTER_MIGRATION_RUN_ONCE.sql di Supabase SQL Editor.',
        }
      }
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/poin')
    revalidatePath('/admin')
    revalidatePath('/poin')
    revalidatePath('/profil')
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

    const transactions = Array.isArray(txs) ? [...txs] : []
    const creditedOrderIds = new Set(
      transactions
        .filter((t) => t.type === 'earned' && t.order_id)
        .map((t) => t.order_id)
    )
    const debitedOrderIds = new Set(
      transactions
        .filter((t) => t.type === 'redeemed' && t.order_id)
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
                id: `order_earned_${ord.id}`,
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

    // 3. Fetch user orders where points were redeemed to ensure spent points are subtracted
    const { data: userOrders } = await supabase
      .from('orders')
      .select('id, total, catatan, poin_digunakan, status, created_at')
      .eq('user_id', userId)
      .neq('status', 'dibatalkan')
      .neq('status', 'tidak_diambil')
      .order('created_at', { ascending: false })

    if (userOrders && userOrders.length > 0) {
      for (const ord of userOrders) {
        if (!debitedOrderIds.has(ord.id)) {
          let redeemed = Number(ord.poin_digunakan) || 0
          if (redeemed <= 0 && ord.catatan) {
            const match = ord.catatan.match(/\[Poin Digunakan:\s*(\d+)/i)
            if (match && match[1]) {
              redeemed = parseInt(match[1], 10) || 0
            }
          }
          if (redeemed > 0) {
            const syntheticRedeemTx = {
              id: `order_redeemed_${ord.id}`,
              user_id: userId,
              order_id: ord.id,
              points: -redeemed,
              type: 'redeemed',
              description: `Tukar poin diskon pesanan #${ord.id.slice(0, 8).toUpperCase()}`,
              created_at: ord.created_at,
            }
            transactions.push(syntheticRedeemTx)
            debitedOrderIds.add(ord.id)
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

export async function getLoyaltySummaryAdmin() {
  try {
    const supabase: SupabaseClient = await createClient()
    const config = await getLoyaltyConfig()

    // 1. Fetch transactions from loyalty_transactions table if available
    const { data: txs } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    const transactions = Array.isArray(txs) ? [...txs] : []
    const creditedOrderIds = new Set(
      transactions
        .filter((t) => t.type === 'earned' && t.order_id)
        .map((t) => t.order_id)
    )
    const debitedOrderIds = new Set(
      transactions
        .filter((t) => t.type === 'redeemed' && t.order_id)
        .map((t) => t.order_id)
    )

    // 2. Fetch all orders to backfill any missing earned or redeemed transactions
    const { data: orders } = await supabase
      .from('orders')
      .select('id, user_id, total, status, catatan, poin_digunakan, created_at, profiles(nama)')
      .order('created_at', { ascending: false })
      .limit(100)

    if (orders && orders.length > 0) {
      for (const ord of orders) {
        // Earned points from completed orders
        if (ord.status === 'selesai' && !creditedOrderIds.has(ord.id)) {
          const ordTotal = Number(ord.total) || 0
          if (ordTotal >= config.min_order_amount) {
            const earned = Math.floor(ordTotal / config.threshold_amount) * config.points_per_threshold
            if (earned > 0) {
              transactions.push({
                id: `order_earned_${ord.id}`,
                user_id: ord.user_id,
                order_id: ord.id,
                points: earned,
                type: 'earned',
                description: `Poin belanja pesanan #${ord.id.slice(0, 8).toUpperCase()}${ord.profiles?.nama ? ` (${ord.profiles.nama})` : ''}`,
                created_at: ord.created_at,
              })
              creditedOrderIds.add(ord.id)
            }
          }
        }

        // Redeemed points from active/valid orders
        if (ord.status !== 'dibatalkan' && ord.status !== 'tidak_diambil' && !debitedOrderIds.has(ord.id)) {
          let redeemed = Number(ord.poin_digunakan) || 0
          if (redeemed <= 0 && ord.catatan) {
            const match = ord.catatan.match(/\[Poin Digunakan:\s*(\d+)/i)
            if (match && match[1]) {
              redeemed = parseInt(match[1], 10) || 0
            }
          }
          if (redeemed > 0) {
            transactions.push({
              id: `order_redeemed_${ord.id}`,
              user_id: ord.user_id,
              order_id: ord.id,
              points: -redeemed,
              type: 'redeemed',
              description: `Tukar poin belanja pesanan #${ord.id.slice(0, 8).toUpperCase()}${ord.profiles?.nama ? ` (${ord.profiles.nama})` : ''}`,
              created_at: ord.created_at,
            })
            debitedOrderIds.add(ord.id)
          }
        }
      }
    }

    transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return {
      config,
      transactions,
    }
  } catch (err) {
    console.error('getLoyaltySummaryAdmin error:', err)
    const config = await getLoyaltyConfig()
    return {
      config,
      transactions: [],
    }
  }
}


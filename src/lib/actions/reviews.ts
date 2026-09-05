// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface SubmitReviewInput {
  productId: string
  orderId?: string
  rating: number
  ulasan?: string
}

export async function submitProductReview(input: SubmitReviewInput) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Silakan login terlebih dahulu untuk memberikan ulasan' }
    }

    if (!input.productId) {
      return { error: 'ID produk tidak valid' }
    }

    if (!input.rating || input.rating < 1 || input.rating > 5) {
      return { error: 'Rating harus antara 1 sampai 5 bintang' }
    }

    // Get user profile for reviewer name
    const { data: profile } = await supabase
      .from('profiles')
      .select('nama')
      .eq('id', user.id)
      .single()

    const reviewerName = profile?.nama || user.email?.split('@')[0] || 'Pembeli'

    // Verify proof of purchase: user must have completed an order containing this product
    let verifiedOrderId: string | null = null

    if (input.orderId) {
      const { data: orderItem } = await supabase
        .from('order_items')
        .select('order_id, orders!inner(id, user_id, status)')
        .eq('order_id', input.orderId)
        .eq('product_id', input.productId)
        .eq('orders.user_id', user.id)
        .eq('orders.status', 'selesai')
        .maybeSingle()

      if (orderItem) {
        verifiedOrderId = input.orderId
      }
    }

    // If orderId was not provided or not verified, check if user has any completed order for this product
    if (!verifiedOrderId) {
      const { data: matchingItem } = await supabase
        .from('order_items')
        .select('order_id, orders!inner(id, user_id, status)')
        .eq('product_id', input.productId)
        .eq('orders.user_id', user.id)
        .eq('orders.status', 'selesai')
        .limit(1)
        .maybeSingle()

      if (matchingItem) {
        verifiedOrderId = matchingItem.order_id
      }
    }

    if (!verifiedOrderId) {
      return {
        error: 'Ulasan hanya dapat diberikan jika Anda sudah pernah membeli produk ini dan status pesanan telah selesai.',
      }
    }

    // Upsert review (one review per user per product)
    const { error: insertError } = await supabase
      .from('product_reviews')
      .upsert(
        {
          user_id: user.id,
          product_id: input.productId,
          order_id: verifiedOrderId,
          rating: input.rating,
          ulasan: input.ulasan?.trim() || null,
          nama_reviewer: reviewerName,
        },
        { onConflict: 'user_id,product_id' }
      )

    if (insertError) {
      console.error('Error submitting product review:', insertError)
      return { error: `Gagal menyimpan ulasan: ${insertError.message}` }
    }

    // Revalidate paths
    revalidatePath(`/pesanan/${input.orderId || ''}`)
    revalidatePath('/produk', 'layout')

    return { success: true }
  } catch (err: any) {
    console.error('submitProductReview exception:', err)
    return { error: err?.message || 'Terjadi kesalahan sistem' }
  }
}

export async function getProductReviews(productId: string) {
  try {
    const supabase = await createClient()
    const { data: reviews, error } = await supabase
      .from('product_reviews')
      .select('id, rating, ulasan, nama_reviewer, created_at, order_id')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (error || !reviews) {
      return { reviews: [], averageRating: 0, totalReviews: 0 }
    }

    const totalReviews = reviews.length
    const averageRating =
      totalReviews > 0
        ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews) * 10) / 10
        : 0

    return { reviews, averageRating, totalReviews }
  } catch {
    return { reviews: [], averageRating: 0, totalReviews: 0 }
  }
}

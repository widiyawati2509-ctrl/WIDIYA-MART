// @ts-nocheck
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any

export async function addToCart(productId: string, qty: number = 1): Promise<{ error?: string; success?: boolean }> {
  const supabase: SupabaseClient = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Silakan login terlebih dahulu' }

  // Get or create cart
  let cartId: string
  const { data: existingCart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existingCart) {
    cartId = existingCart.id
  } else {
    const { data: newCart, error: cartError } = await supabase
      .from('carts')
      .insert({ user_id: user.id })
      .select('id')
      .single()

    if (cartError || !newCart) return { error: 'Gagal membuat keranjang' }
    cartId = newCart.id
  }

  // Upsert cart item
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('id, qty')
    .eq('cart_id', cartId)
    .eq('product_id', productId)
    .single()

  if (existingItem) {
    await supabase
      .from('cart_items')
      .update({ qty: existingItem.qty + qty })
      .eq('id', existingItem.id)
  } else {
    const { error } = await supabase
      .from('cart_items')
      .insert({ cart_id: cartId, product_id: productId, qty })

    if (error) return { error: 'Gagal menambah ke keranjang' }
  }

  revalidatePath('/')
  return { success: true }
}

export async function updateCartQty(cartItemId: string, qty: number): Promise<{ error?: string; success?: boolean }> {
  const supabase: SupabaseClient = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Silakan login terlebih dahulu' }

  if (qty <= 0) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
    if (error) return { error: 'Gagal menghapus item' }
  } else {
    const { error } = await supabase
      .from('cart_items')
      .update({ qty })
      .eq('id', cartItemId)
    if (error) return { error: 'Gagal mengupdate qty' }
  }

  revalidatePath('/keranjang')
  return { success: true }
}

export async function removeFromCart(cartItemId: string): Promise<{ error?: string; success?: boolean }> {
  const supabase: SupabaseClient = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Silakan login terlebih dahulu' }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)

  if (error) return { error: 'Gagal menghapus item' }

  revalidatePath('/keranjang')
  return { success: true }
}

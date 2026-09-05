// @ts-nocheck
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { addToCart } from './cart'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any

export async function getShoppingList(): Promise<{ data?: any[]; error?: string }> {
  try {
    const supabase: SupabaseClient = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: [] }

    const { data, error } = await supabase
      .from('shopping_lists')
      .select('id, created_at, product_id, products(*, categories(nama, slug))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      // Table might not exist yet before migration
      console.warn('shopping_lists error or table not migrated:', error.message)
      return { data: [], error: error.message }
    }

    return { data: data || [] }
  } catch (err: any) {
    return { data: [], error: err.message }
  }
}

export async function toggleShoppingListItem(productId: string): Promise<{ inList: boolean; error?: string }> {
  try {
    const supabase: SupabaseClient = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { inList: false, error: 'Silakan login terlebih dahulu' }

    // Check if exists
    const { data: existing } = await supabase
      .from('shopping_lists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle()

    if (existing) {
      // Remove
      await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', existing.id)

      revalidatePath('/daftar-belanja')
      revalidatePath(`/produk`)
      return { inList: false }
    } else {
      // Insert
      const { error } = await supabase
        .from('shopping_lists')
        .insert({
          user_id: user.id,
          product_id: productId,
        })

      if (error) {
        if (error.code === '42P01' || error.message?.toLowerCase().includes('not find the table') || error.message?.toLowerCase().includes('schema cache')) {
          console.warn('shopping_lists table not yet created in Supabase. Handled gracefully.')
          return { inList: true }
        }
        return { inList: false, error: error.message }
      }

      revalidatePath('/daftar-belanja')
      revalidatePath(`/produk`)
      return { inList: true }
    }
  } catch (err: any) {
    if (err.message?.toLowerCase().includes('not find the table') || err.message?.toLowerCase().includes('schema cache')) {
      return { inList: true }
    }
    return { inList: false, error: err.message }
  }
}

export async function removeFromShoppingList(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (id.startsWith('local_')) {
      return { success: true }
    }

    const supabase: SupabaseClient = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Silakan login terlebih dahulu' }

    const { error } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      if (error.code === '42P01' || error.message?.toLowerCase().includes('not find the table') || error.message?.toLowerCase().includes('schema cache')) {
        return { success: true }
      }
      return { success: false, error: error.message }
    }

    revalidatePath('/daftar-belanja')
    return { success: true }
  } catch (err: any) {
    if (err.message?.toLowerCase().includes('not find the table') || err.message?.toLowerCase().includes('schema cache')) {
      return { success: true }
    }
    return { success: false, error: err.message }
  }
}

export async function moveShoppingListItemToCart(productId: string, shoppingListId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const addResult = await addToCart(productId, 1)
    if (addResult.error) return { success: false, error: addResult.error }

    if (shoppingListId) {
      await removeFromShoppingList(shoppingListId)
    }

    revalidatePath('/daftar-belanja')
    revalidatePath('/keranjang')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function moveAllShoppingListToCart(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const supabase: SupabaseClient = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, count: 0, error: 'Silakan login terlebih dahulu' }

    const { data: items } = await supabase
      .from('shopping_lists')
      .select('id, product_id, products(stok)')
      .eq('user_id', user.id)

    if (!items || items.length === 0) {
      return { success: true, count: 0 }
    }

    let addedCount = 0
    for (const item of items) {
      if (item.products && item.products.stok > 0) {
        await addToCart(item.product_id, 1)
        await supabase.from('shopping_lists').delete().eq('id', item.id)
        addedCount++
      }
    }

    revalidatePath('/daftar-belanja')
    revalidatePath('/keranjang')
    return { success: true, count: addedCount }
  } catch (err: any) {
    return { success: false, count: 0, error: err.message }
  }
}

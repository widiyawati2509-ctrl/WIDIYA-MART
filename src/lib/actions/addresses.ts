// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { UserAddress } from '@/types/database'

export interface AddressInput {
  label: string
  alamat_lengkap: string
  lat?: number | null
  long?: number | null
  is_default?: boolean
}

export async function getUserAddresses(): Promise<{ data: UserAddress[]; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { data: [] }
    }

    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
        // Fallback otomatis ke tabel addresses yang sudah ada
        const { data: fbData, error: fbError } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false })

        if (!fbError) {
          return { data: fbData || [] }
        }
      }
      console.error('Error fetching user addresses:', error)
      return { data: [], error: error.message }
    }

    return { data: data || [] }
  } catch (err: any) {
    console.error('getUserAddresses exception:', err)
    return { data: [], error: err?.message || 'Gagal memuat alamat' }
  }
}

export async function addAddress(input: AddressInput): Promise<{ success?: boolean; error?: string; address?: UserAddress }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Silakan login terlebih dahulu' }
    }

    const label = input.label?.trim()
    const alamat_lengkap = input.alamat_lengkap?.trim()

    if (!label) {
      return { error: 'Label alamat (misal: Rumah, Kantor) wajib diisi' }
    }

    if (!alamat_lengkap) {
      return { error: 'Alamat lengkap wajib diisi' }
    }

    // Check if user currently has any addresses; if none, make this default
    let count = 0
    const { count: uCount, error: countErr } = await supabase
      .from('user_addresses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countErr) {
      const { count: aCount } = await supabase
        .from('addresses')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
      count = aCount || 0
    } else {
      count = uCount || 0
    }

    const shouldBeDefault = Boolean(input.is_default || count === 0)

    if (shouldBeDefault) {
      // Unset previous defaults
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)

      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
    }

    const payload = {
      user_id: user.id,
      label,
      alamat_lengkap,
      lat: input.lat ?? null,
      long: input.long ?? null,
      is_default: shouldBeDefault,
    }

    let { data, error } = await supabase
      .from('user_addresses')
      .insert(payload)
      .select('*')
      .single()

    if (error && (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('does not exist'))) {
      // Fallback ke tabel addresses
      const compatPayload = {
        user_id: user.id,
        label,
        alamat_lengkap,
        kota: 'Lombok Tengah',
        is_default: shouldBeDefault,
      }
      const { data: aData, error: aError } = await supabase
        .from('addresses')
        .insert(compatPayload)
        .select('*')
        .single()

      if (!aError && aData) {
        data = aData
        error = null
      } else {
        error = aError
      }
    }

    if (error) {
      console.error('Error inserting user address:', error)
      return { error: `Gagal menyimpan alamat: ${error.message}` }
    }

    revalidatePath('/profil')
    revalidatePath('/checkout')

    return { success: true, address: data }
  } catch (err: any) {
    console.error('addAddress exception:', err)
    return { error: err?.message || 'Terjadi kesalahan sistem' }
  }
}

export async function updateAddress(
  id: string,
  input: AddressInput
): Promise<{ success?: boolean; error?: string; address?: UserAddress }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Silakan login terlebih dahulu' }
    }

    const label = input.label?.trim()
    const alamat_lengkap = input.alamat_lengkap?.trim()

    if (!label) {
      return { error: 'Label alamat wajib diisi' }
    }

    if (!alamat_lengkap) {
      return { error: 'Alamat lengkap wajib diisi' }
    }

    if (input.is_default) {
      // Unset previous defaults
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
    }

    const payload = {
      label,
      alamat_lengkap,
      lat: input.lat !== undefined ? input.lat : null,
      long: input.long !== undefined ? input.long : null,
      is_default: Boolean(input.is_default),
      updated_at: new Date().toISOString(),
    }

    let { data, error } = await supabase
      .from('user_addresses')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error && (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('does not exist'))) {
      const compatPayload = {
        label,
        alamat_lengkap,
        is_default: Boolean(input.is_default),
      }
      const { data: aData, error: aError } = await supabase
        .from('addresses')
        .update(compatPayload)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single()

      if (!aError && aData) {
        data = aData
        error = null
      } else {
        error = aError
      }
    }

    if (error) {
      console.error('Error updating user address:', error)
      return { error: `Gagal memperbarui alamat: ${error.message}` }
    }

    revalidatePath('/profil')
    revalidatePath('/checkout')

    return { success: true, address: data }
  } catch (err: any) {
    console.error('updateAddress exception:', err)
    return { error: err?.message || 'Terjadi kesalahan sistem' }
  }
}

export async function deleteAddress(id: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Silakan login terlebih dahulu' }
    }

    let { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error && (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('does not exist'))) {
      const { error: aError } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      error = aError
    }

    if (error) {
      console.error('Error deleting user address:', error)
      return { error: `Gagal menghapus alamat: ${error.message}` }
    }

    revalidatePath('/profil')
    revalidatePath('/checkout')

    return { success: true }
  } catch (err: any) {
    console.error('deleteAddress exception:', err)
    return { error: err?.message || 'Terjadi kesalahan sistem' }
  }
}

export async function setDefaultAddress(id: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Silakan login terlebih dahulu' }
    }

    // Unset all
    await supabase
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)

    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)

    // Set selected
    let { error } = await supabase
      .from('user_addresses')
      .update({ is_default: true })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error && (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('does not exist'))) {
      const { error: aError } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id)
      error = aError
    }

    if (error) {
      console.error('Error setting default address:', error)
      return { error: `Gagal menyetel alamat utama: ${error.message}` }
    }

    revalidatePath('/profil')
    revalidatePath('/checkout')

    return { success: true }
  } catch (err: any) {
    console.error('setDefaultAddress exception:', err)
    return { error: err?.message || 'Terjadi kesalahan sistem' }
  }
}

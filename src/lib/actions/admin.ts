// @ts-nocheck
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'
import { z } from 'zod'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any

const categorySchema = z.object({
  nama: z.string().min(2).max(50),
})

export async function createCategory(formData: FormData): Promise<void> {
  const supabase: SupabaseClient = await createClient()
  const nama = formData.get('nama') as string
  const parsed = categorySchema.safeParse({ nama })
  if (!parsed.success) return

  const slug = slugify(parsed.data.nama)
  await supabase.from('categories').insert({ nama: parsed.data.nama, slug })
  revalidatePath('/admin/kategori')
}

export async function updateCategory(id: string, formData: FormData): Promise<void> {
  const supabase: SupabaseClient = await createClient()
  const nama = formData.get('nama') as string
  const parsed = categorySchema.safeParse({ nama })
  if (!parsed.success) return

  await supabase
    .from('categories')
    .update({ nama: parsed.data.nama, slug: slugify(parsed.data.nama) })
    .eq('id', id)

  revalidatePath('/admin/kategori')
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase: SupabaseClient = await createClient()
  await supabase.from('categories').delete().eq('id', id)
  revalidatePath('/admin/kategori')
}

export async function updateStoreInfo(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase: SupabaseClient = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized: Silakan login terlebih dahulu' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') return { success: false, error: 'Unauthorized: Akses khusus admin' }

    const nama_toko = (formData.get('nama_toko') as string)?.trim() || 'PENGENJEK MART'
    const alamat_toko = (formData.get('alamat_toko') as string)?.trim() || ''
    const kota = (formData.get('kota') as string)?.trim() || ''
    let jam_buka = (formData.get('jam_buka') as string)?.trim() || '07:00'
    let jam_tutup = (formData.get('jam_tutup') as string)?.trim() || '21:00'
    let jam_operasional = (formData.get('jam_operasional') as string)?.trim()

    // Normalisasi jam: dukung format 07.00 maupun 07:00
    jam_buka = jam_buka.replace('.', ':')
    jam_tutup = jam_tutup.replace('.', ':')

    if (!jam_operasional) {
      jam_operasional = `Setiap Hari, ${jam_buka} – ${jam_tutup} WITA`
    }

    const no_hp_toko = (formData.get('no_hp_toko') as string)?.trim() || null
    const whatsapp = (formData.get('whatsapp') as string)?.trim() || null
    const maps_url = (formData.get('maps_url') as string)?.trim() || null

    const fullPayload = {
      nama_toko,
      alamat_toko,
      kota,
      jam_operasional,
      jam_buka,
      jam_tutup,
      no_hp_toko,
      whatsapp,
      maps_url,
      updated_at: new Date().toISOString(),
    }

    // Coba update penuh dengan jam_buka & jam_tutup
    const { error: fullError } = await supabase
      .from('store_info')
      .update(fullPayload)
      .eq('id', 1)

    if (fullError) {
      console.warn('Full store_info update fallback:', fullError.message)
      // Fallback kompatibel jika kolom jam_buka/jam_tutup belum dibuat di DB Supabase
      const compatPayload = {
        nama_toko,
        alamat_toko,
        kota,
        jam_operasional,
        no_hp_toko,
        whatsapp,
        maps_url,
        updated_at: new Date().toISOString(),
      }
      const { error: compatError } = await supabase
        .from('store_info')
        .update(compatPayload)
        .eq('id', 1)

      if (compatError) {
        return { success: false, error: 'Gagal update database: ' + compatError.message }
      }
    }

    revalidatePath('/')
    revalidatePath('/checkout')
    revalidatePath('/tentang')
    revalidatePath('/admin/pengaturan')

    return { success: true }
  } catch (err: any) {
    console.error('updateStoreInfo error:', err)
    return { success: false, error: err?.message || 'Terjadi kesalahan sistem' }
  }
}

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

export async function updateStoreInfo(formData: FormData): Promise<void> {
  const supabase: SupabaseClient = await createClient()
  await supabase
    .from('store_info')
    .update({
      nama_toko: formData.get('nama_toko') as string,
      alamat_toko: formData.get('alamat_toko') as string,
      kota: formData.get('kota') as string,
      jam_operasional: formData.get('jam_operasional') as string,
      no_hp_toko: (formData.get('no_hp_toko') as string) || null,
      whatsapp: (formData.get('whatsapp') as string) || null,
      maps_url: (formData.get('maps_url') as string) || null,
    })
    .eq('id', 1)

  revalidatePath('/')
  revalidatePath('/checkout')
}

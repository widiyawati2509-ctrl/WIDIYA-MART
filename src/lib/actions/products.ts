// @ts-nocheck
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { productSchema } from '@/lib/validations'
import { slugify } from '@/lib/utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any

export async function createProduct(formData: FormData): Promise<void> {
  const supabase: SupabaseClient = await createClient()

  const raw = {
    nama: formData.get('nama') as string,
    deskripsi: formData.get('deskripsi') as string,
    harga: Number(formData.get('harga')),
    stok: Number(formData.get('stok')),
    category_id: (formData.get('category_id') as string) || null,
    is_active: formData.get('is_active') === 'true',
  }

  const parsed = productSchema.safeParse(raw)
  if (!parsed.success) return

  const slug = slugify(parsed.data.nama) + '-' + Date.now()

  let image_url: string | null = null
  const imageFile = formData.get('image') as File | null
  const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  if (imageFile && imageFile.size > 0) {
    if (imageFile.size <= MAX_FILE_SIZE && ALLOWED_MIME.includes(imageFile.type)) {
      const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${slug}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(path, imageFile, { upsert: true })

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(path)
        image_url = urlData.publicUrl
      }
    }
  }

  await supabase.from('products').insert({
    nama: parsed.data.nama,
    slug,
    deskripsi: parsed.data.deskripsi,
    harga: parsed.data.harga,
    stok: parsed.data.stok,
    category_id: parsed.data.category_id ?? null,
    is_active: parsed.data.is_active,
    image_url,
  })

  revalidatePath('/admin/produk')
  revalidatePath('/')
}

export async function updateProduct(id: string, formData: FormData): Promise<void> {
  const supabase: SupabaseClient = await createClient()

  const raw = {
    nama: formData.get('nama') as string,
    deskripsi: formData.get('deskripsi') as string,
    harga: Number(formData.get('harga')),
    stok: Number(formData.get('stok')),
    category_id: (formData.get('category_id') as string) || null,
    is_active: formData.get('is_active') === 'true',
  }

  const parsed = productSchema.safeParse(raw)
  if (!parsed.success) return

  let image_url: string | undefined
  const imageFile = formData.get('image') as File | null
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()
    const path = `${id}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(path, imageFile, { upsert: true })

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(path)
      image_url = urlData.publicUrl
    }
  }

  const updateData: Record<string, unknown> = {
    nama: parsed.data.nama,
    deskripsi: parsed.data.deskripsi,
    harga: parsed.data.harga,
    stok: parsed.data.stok,
    category_id: parsed.data.category_id ?? null,
    is_active: parsed.data.is_active,
  }
  if (image_url) updateData.image_url = image_url

  await supabase.from('products').update(updateData).eq('id', id)

  revalidatePath('/admin/produk')
  revalidatePath('/')
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase: SupabaseClient = await createClient()
  await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id)

  revalidatePath('/admin/produk')
  revalidatePath('/')
}

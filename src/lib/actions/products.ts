// @ts-nocheck
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { productSchema } from '@/lib/validations'
import { slugify, serializeProductVariants } from '@/lib/utils'

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

  const variantsJson = formData.get('variants') as string | null
  let finalDeskripsi = parsed.data.deskripsi ?? ''
  if (variantsJson) {
    try {
      const parsedVariants = JSON.parse(variantsJson)
      if (Array.isArray(parsedVariants)) {
        for (let i = 0; i < parsedVariants.length; i++) {
          const vFile = formData.get(`variant_image_${i}`) as File | null
          if (vFile && vFile.size > 0 && vFile.size <= MAX_FILE_SIZE && ALLOWED_MIME.includes(vFile.type)) {
            const vExt = vFile.name.split('.').pop()?.toLowerCase() || 'jpg'
            const vPath = `variants/${slug}-var-${i}-${Date.now()}.${vExt}`
            const { error: vUploadError } = await supabase.storage
              .from('products')
              .upload(vPath, vFile, { upsert: true })

            if (!vUploadError) {
              const { data: vUrlData } = supabase.storage
                .from('products')
                .getPublicUrl(vPath)
              parsedVariants[i].image_url = vUrlData.publicUrl
            }
          }
        }
        finalDeskripsi = serializeProductVariants(finalDeskripsi, parsedVariants)
      }
    } catch {
      // fallback
    }
  }

  await supabase.from('products').insert({
    nama: parsed.data.nama,
    slug,
    deskripsi: finalDeskripsi,
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

  const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  const variantsJson = formData.get('variants') as string | null
  let finalDeskripsi = parsed.data.deskripsi ?? ''
  if (variantsJson) {
    try {
      const parsedVariants = JSON.parse(variantsJson)
      if (Array.isArray(parsedVariants)) {
        for (let i = 0; i < parsedVariants.length; i++) {
          const vFile = formData.get(`variant_image_${i}`) as File | null
          if (vFile && vFile.size > 0 && vFile.size <= MAX_FILE_SIZE && ALLOWED_MIME.includes(vFile.type)) {
            const vExt = vFile.name.split('.').pop()?.toLowerCase() || 'jpg'
            const vPath = `variants/${id}-var-${i}-${Date.now()}.${vExt}`
            const { error: vUploadError } = await supabase.storage
              .from('products')
              .upload(vPath, vFile, { upsert: true })

            if (!vUploadError) {
              const { data: vUrlData } = supabase.storage
                .from('products')
                .getPublicUrl(vPath)
              parsedVariants[i].image_url = vUrlData.publicUrl
            }
          }
        }
        finalDeskripsi = serializeProductVariants(finalDeskripsi, parsedVariants)
      }
    } catch {
      // fallback
    }
  }

  const updateData: Record<string, unknown> = {
    nama: parsed.data.nama,
    deskripsi: finalDeskripsi,
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

export async function fetchMoreCatalogProducts(params: {
  offset: number
  limit?: number
  kategori?: string
  q?: string
}): Promise<{ products: any[]; hasMore: boolean }> {
  try {
    const limit = params.limit ?? 12
    const supabase: SupabaseClient = await createClient()

    let query = supabase
      .from('products')
      .select('id, nama, slug, harga, stok, image_url, diskon_persen, badge_text, category_id, categories(nama, slug)')
      .eq('is_active', true)
      .gt('stok', 0)

    if (params.q) {
      query = query.ilike('nama', `%${params.q}%`)
    }

    if (params.kategori) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', params.kategori)
        .maybeSingle()

      if (cat) {
        query = query.eq('category_id', cat.id)
      }
    }

    const { data: products, error } = await query
      .order('nama')
      .range(params.offset, params.offset + limit - 1)

    if (error || !products) {
      return { products: [], hasMore: false }
    }

    return {
      products,
      hasMore: products.length === limit,
    }
  } catch (e) {
    console.error('fetchMoreCatalogProducts error:', e)
    return { products: [], hasMore: false }
  }
}

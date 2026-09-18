// @ts-nocheck
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { productSchema } from '@/lib/validations'
import { slugify, serializeProductVariants } from '@/lib/utils'
import { processProductImage } from '@/lib/imageProcessing'
import { getActivePromoProductIds } from '@/lib/actions/promos'

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

  if (imageFile && imageFile.size > 0) {
    try {
      const processed = await processProductImage(imageFile)
      const path = `catalog/${slug}.${processed.ext}`
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(path, processed.buffer, {
          contentType: processed.contentType,
          upsert: true,
        })

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(path)
        image_url = urlData.publicUrl
      }
    } catch (err) {
      console.error('Error processing product image:', err)
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
          if (vFile && vFile.size > 0) {
            try {
              const processedV = await processProductImage(vFile)
              const vPath = `variants/${slug}-var-${i}-${Date.now()}.${processedV.ext}`
              const { error: vUploadError } = await supabase.storage
                .from('products')
                .upload(vPath, processedV.buffer, {
                  contentType: processedV.contentType,
                  upsert: true,
                })

              if (!vUploadError) {
                const { data: vUrlData } = supabase.storage
                  .from('products')
                  .getPublicUrl(vPath)
                parsedVariants[i].image_url = vUrlData.publicUrl
              }
            } catch (err) {
              console.error(`Error processing variant image ${i}:`, err)
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
  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath('/kategori')
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
    try {
      const processed = await processProductImage(imageFile)
      const path = `catalog/${id}-${Date.now()}.${processed.ext}`
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(path, processed.buffer, {
          contentType: processed.contentType,
          upsert: true,
        })

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(path)
        image_url = urlData.publicUrl
      }
    } catch (err) {
      console.error('Error processing update product image:', err)
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
          if (vFile && vFile.size > 0) {
            try {
              const processedV = await processProductImage(vFile)
              const vPath = `variants/${id}-var-${i}-${Date.now()}.${processedV.ext}`
              const { error: vUploadError } = await supabase.storage
                .from('products')
                .upload(vPath, processedV.buffer, {
                  contentType: processedV.contentType,
                  upsert: true,
                })

              if (!vUploadError) {
                const { data: vUrlData } = supabase.storage
                  .from('products')
                  .getPublicUrl(vPath)
                parsedVariants[i].image_url = vUrlData.publicUrl
              }
            } catch (err) {
              console.error(`Error processing variant image ${i}:`, err)
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
  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath('/kategori')
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase: SupabaseClient = await createClient()
  await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id)

  revalidatePath('/admin/produk')
  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath('/kategori')
}

export async function fetchMoreCatalogProducts(params: {
  offset: number
  limit?: number
  kategori?: string
  q?: string
  urutan?: string
  filter?: string
}): Promise<{ products: any[]; hasMore: boolean }> {
  try {
    const limit = params.limit ?? 12
    const supabase: SupabaseClient = await createClient()

    let query = supabase
      .from('products')
      .select('id, nama, slug, harga, stok, image_url, category_id, categories(nama, slug)')
      .eq('is_active', true)

    if (params.filter === 'promo') {
      const promoIds = await getActivePromoProductIds()
      if (promoIds.length > 0) {
        query = query.in('id', promoIds)
      } else {
        query = query.eq('id', '00000000-0000-0000-0000-000000000000')
      }
    } else if (params.filter === 'ready' || !params.filter) {
      query = query.gt('stok', 0)
    }

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

    if (params.urutan === 'termurah') {
      query = query.order('harga', { ascending: true })
    } else if (params.urutan === 'termahal') {
      query = query.order('harga', { ascending: false })
    } else if (params.urutan === 'terbaru') {
      query = query.order('created_at', { ascending: false })
    } else {
      query = query.order('nama', { ascending: true })
    }

    const { data: products, error } = await query
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

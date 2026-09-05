// @ts-nocheck
'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createPublicClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any

export interface PromoItem {
  id: string
  judul: string
  subjudul?: string | null
  tipe: 'banner' | 'diskon_produk'
  product_id?: string | null
  badge_text?: string | null
  diskon_persen?: number | null
  image_url?: string | null
  banner_bg?: string | null
  link_url?: string | null
  is_active: boolean
  urutan: number
  start_date?: string | null
  end_date?: string | null
  products?: {
    id: string
    nama: string
    slug: string
    harga: number
    image_url?: string | null
  } | null
}

const FALLBACK_BANNERS = [
  {
    id: 'f1',
    judul: 'Mama Lemon Jeruk Nipis',
    subjudul: 'Sabun cuci piring refill 650g cuma Rp 10.000',
    tipe: 'banner',
    badge_text: 'PROMO SPESIAL',
    image_url: '/products/1788105463290-z57uce.jpeg',
    banner_bg: 'linear-gradient(135deg, #FF6B35 0%, #E85521 100%)',
    link_url: '/produk/mama-lemon-sabun-cuci-piring-jeruk-nipis-refill-650-g',
    is_active: true,
    urutan: 1,
  },
  {
    id: 'f2',
    judul: 'Frisian Flag UHT Cokelat',
    subjudul: 'Susu UHT Nutribrain 6 x 110 ml cuma Rp 24.000',
    tipe: 'banner',
    badge_text: 'NUTRISI ANAK',
    image_url: '/products/1788105762288-zi1d3s.jpeg',
    banner_bg: 'linear-gradient(145deg, #2B1810 0%, #452419 100%)',
    link_url: '/produk/frisian-flag-nutribrain-susu-uht-cair-cokelat-kotak-6-x-110-ml',
    is_active: true,
    urutan: 2,
  },
  {
    id: 'f3',
    judul: 'Glow & Lovely Foam',
    subjudul: 'Pembersih wajah multivitamin 100g cerahkan kulit',
    tipe: 'banner',
    badge_text: 'SKINCARE HARIAN',
    image_url: '/products/1788105042968-b41tnf.jpeg',
    banner_bg: 'linear-gradient(135deg, #FF7E47 0%, #D84315 100%)',
    link_url: '/produk/glow-lovely-pembersih-wajah-foam-untuk-kulit-kusam-multivitamin-100-g',
    is_active: true,
    urutan: 3,
  },
]

export async function getPublicPromos(): Promise<PromoItem[]> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('promos')
      .select('*, products(id, nama, slug, harga, image_url)')
      .eq('is_active', true)
      .order('urutan', { ascending: true })

    if (error || !data || data.length === 0) {
      return FALLBACK_BANNERS
    }

    return data
  } catch {
    return FALLBACK_BANNERS
  }
}

export async function getAllPromosAdmin(): Promise<PromoItem[]> {
  try {
    const supabase: SupabaseClient = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('promos')
      .select('*, products(id, nama, slug, harga, image_url)')
      .order('urutan', { ascending: true })

    if (error) {
      console.warn('getAllPromosAdmin error:', error.message)
      return []
    }

    return data || []
  } catch {
    return []
  }
}

export async function createPromo(formData: FormData): Promise<{ success: boolean; error?: string }> {
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

    const judul = formData.get('judul') as string
    const subjudul = (formData.get('subjudul') as string) || null
    const tipe = (formData.get('tipe') as string) || 'banner'
    const product_id = (formData.get('product_id') as string) || null
    const badge_text = (formData.get('badge_text') as string) || 'PROMO'
    const diskon_persen = formData.get('diskon_persen') ? Number(formData.get('diskon_persen')) : null
    let image_url = (formData.get('image_url') as string) || null
    const banner_bg = (formData.get('banner_bg') as string) || 'linear-gradient(135deg, #FF6B35 0%, #E85521 100%)'
    let link_url = (formData.get('link_url') as string) || null
    const is_active = formData.get('is_active') === 'true' || formData.get('is_active') === 'on'
    const urutan = Number(formData.get('urutan')) || 0

    // Handle image upload if provided
    const imageFile = formData.get('image_file') as File | null
    if (imageFile && imageFile.size > 0) {
      const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
      const storagePath = `promos/promo-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('products')
        .upload(storagePath, imageFile, { upsert: true })

      if (!upErr) {
        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(storagePath)
        image_url = publicUrlData.publicUrl
      }
    }

    // Auto-fill link and image from product if selected and empty
    if (product_id && (!link_url || !image_url)) {
      const { data: prod } = await supabase
        .from('products')
        .select('slug, image_url')
        .eq('id', product_id)
        .single()

      if (prod) {
        if (!link_url) link_url = `/produk/${prod.slug}`
        if (!image_url && prod.image_url) image_url = prod.image_url
      }
    }

    const { error } = await supabase
      .from('promos')
      .insert({
        judul,
        subjudul,
        tipe,
        product_id,
        badge_text,
        diskon_persen,
        image_url,
        banner_bg,
        link_url,
        is_active,
        urutan,
      })

    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    revalidatePath('/admin/promo')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updatePromo(id: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
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

    const judul = formData.get('judul') as string
    const subjudul = (formData.get('subjudul') as string) || null
    const tipe = (formData.get('tipe') as string) || 'banner'
    const product_id = (formData.get('product_id') as string) || null
    const badge_text = (formData.get('badge_text') as string) || 'PROMO'
    const diskon_persen = formData.get('diskon_persen') ? Number(formData.get('diskon_persen')) : null
    let image_url = (formData.get('image_url') as string) || null
    const banner_bg = (formData.get('banner_bg') as string) || 'linear-gradient(135deg, #FF6B35 0%, #E85521 100%)'
    const link_url = (formData.get('link_url') as string) || null
    const is_active = formData.get('is_active') === 'true' || formData.get('is_active') === 'on'
    const urutan = Number(formData.get('urutan')) || 0

    const imageFile = formData.get('image_file') as File | null
    if (imageFile && imageFile.size > 0) {
      const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
      const storagePath = `promos/promo-${id}-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('products')
        .upload(storagePath, imageFile, { upsert: true })

      if (!upErr) {
        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(storagePath)
        image_url = publicUrlData.publicUrl
      }
    }

    const { error } = await supabase
      .from('promos')
      .update({
        judul,
        subjudul,
        tipe,
        product_id,
        badge_text,
        diskon_persen,
        ...(image_url ? { image_url } : {}),
        banner_bg,
        link_url,
        is_active,
        urutan,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    revalidatePath('/admin/promo')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deletePromo(id: string): Promise<{ success: boolean; error?: string }> {
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

    const { error } = await supabase
      .from('promos')
      .delete()
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    revalidatePath('/admin/promo')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

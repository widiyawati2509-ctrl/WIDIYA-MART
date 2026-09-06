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

const FALLBACK_BANNERS: PromoItem[] = [
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

/**
 * Membaca data promo dari kolom `store_info.logo_url` yang dipakai sebagai media penyimpanan
 * JSON persisten bawaan ketika tabel terpisah `promos` belum dibuat di Supabase.
 */
async function getPromosFromStoreInfo(supabase: SupabaseClient): Promise<PromoItem[] | null> {
  try {
    const { data, error } = await supabase
      .from('store_info')
      .select('logo_url')
      .eq('id', 1)
      .single()

    if (error || !data?.logo_url) {
      return null
    }

    const trimmed = data.logo_url.trim()
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      const parsed = JSON.parse(trimmed)
      const list = Array.isArray(parsed) ? parsed : parsed.promos || []
      return list.length > 0 ? list : null
    }
    return null
  } catch (err) {
    console.warn('getPromosFromStoreInfo parse error:', err)
    return null
  }
}

/**
 * Menyimpan array promo ke kolom `store_info.logo_url`
 */
async function savePromosToStoreInfo(supabase: SupabaseClient, promos: PromoItem[]): Promise<{ success: boolean; error?: string }> {
  try {
    const jsonStr = JSON.stringify(promos)
    const { error } = await supabase
      .from('store_info')
      .update({ logo_url: jsonStr, updated_at: new Date().toISOString() })
      .eq('id', 1)

    if (error) {
      console.error('savePromosToStoreInfo error:', error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err: any) {
    console.error('savePromosToStoreInfo exception:', err)
    return { success: false, error: err.message }
  }
}

export async function getPublicPromos(): Promise<PromoItem[]> {
  try {
    const supabase = createPublicClient()

    // 1. Coba query ke tabel promos jika ada
    const { data, error } = await supabase
      .from('promos')
      .select('*, products(id, nama, slug, harga, image_url)')
      .eq('is_active', true)
      .order('urutan', { ascending: true })

    if (!error && data && data.length > 0) {
      return data
    }

    // 2. Cek penyimpanan persisten di store_info.logo_url
    const storedPromos = await getPromosFromStoreInfo(supabase)
    if (storedPromos && storedPromos.length > 0) {
      const activeList = storedPromos
        .filter((p) => p.is_active !== false)
        .sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0))
      if (activeList.length > 0) {
        return activeList
      }
    }

    // 3. Fallback banner bawaan toko
    return FALLBACK_BANNERS
  } catch (err) {
    console.warn('getPublicPromos fallback error:', err)
    return FALLBACK_BANNERS
  }
}

export async function getAllPromosAdmin(): Promise<PromoItem[]> {
  try {
    const supabase: SupabaseClient = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // 1. Coba query ke tabel promos jika ada
    const { data, error } = await supabase
      .from('promos')
      .select('*, products(id, nama, slug, harga, image_url)')
      .order('urutan', { ascending: true })

    if (!error && data && data.length > 0) {
      return data
    }

    // 2. Cek penyimpanan persisten di store_info.logo_url
    const storedPromos = await getPromosFromStoreInfo(supabase)
    if (storedPromos && storedPromos.length > 0) {
      return storedPromos.sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0))
    }

    // 3. Kembalikan banner default toko agar admin dapat melihat dan mengeditnya
    return FALLBACK_BANNERS
  } catch (err) {
    console.warn('getAllPromosAdmin error:', err)
    return FALLBACK_BANNERS
  }
}

export async function createPromo(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase: SupabaseClient = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized: Silakan login terlebih dahulu' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') return { success: false, error: 'Unauthorized: Hanya admin yang dapat menambah promo' }

    const judul = (formData.get('judul') as string)?.trim()
    if (!judul) return { success: false, error: 'Judul promo wajib diisi' }

    const subjudul = (formData.get('subjudul') as string)?.trim() || null
    const tipe = ((formData.get('tipe') as string) || 'banner') as 'banner' | 'diskon_produk'
    const product_id = (formData.get('product_id') as string)?.trim() || null
    const badge_text = (formData.get('badge_text') as string)?.trim() || 'PROMO'
    const diskon_persen = formData.get('diskon_persen') ? Number(formData.get('diskon_persen')) : null
    let image_url = (formData.get('image_url') as string)?.trim() || null
    const banner_bg = (formData.get('banner_bg') as string)?.trim() || 'linear-gradient(135deg, #FF6B35 0%, #E85521 100%)'
    let link_url = (formData.get('link_url') as string)?.trim() || null
    const is_active = formData.get('is_active') === 'true' || formData.get('is_active') === 'on'
    const urutan = Number(formData.get('urutan')) || 0

    // Hubungkan info produk jika dipilih
    let productInfo: PromoItem['products'] = null
    if (product_id) {
      const { data: prod } = await supabase
        .from('products')
        .select('id, nama, slug, harga, image_url')
        .eq('id', product_id)
        .single()

      if (prod) {
        productInfo = prod
        if (!link_url) link_url = `/produk/${prod.slug}`
        if (!image_url && prod.image_url) image_url = prod.image_url
      }
    }

    // Handle image upload jika ada file yang diunggah
    const imageFile = formData.get('image_file') as File | null
    if (imageFile && imageFile.size > 0) {
      try {
        const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
        const filename = `promo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}.${ext}`

        // Coba simpan ke Supabase Storage terlebih dahulu
        const { error: upErr } = await supabase.storage
          .from('products')
          .upload(`promos/${filename}`, imageFile, { upsert: true })

        if (!upErr) {
          const { data: publicUrlData } = supabase.storage
            .from('products')
            .getPublicUrl(`promos/${filename}`)
          if (publicUrlData?.publicUrl) {
            image_url = publicUrlData.publicUrl
          }
        } else {
          // Fallback lokal public/uploads/promos jika Storage gagal
          const bytes = await imageFile.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const fs = await import('fs/promises')
          const path = await import('path')
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'promos')
          await fs.mkdir(uploadDir, { recursive: true })
          await fs.writeFile(path.join(uploadDir, filename), buffer)
          image_url = `/uploads/promos/${filename}`
        }
      } catch (uploadErr) {
        console.warn('Image upload fallback warning:', uploadErr)
      }
    }

    // 1. Coba insert ke tabel 'promos'
    const { error: insertErr } = await supabase
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

    if (!insertErr) {
      revalidatePath('/')
      revalidatePath('/admin/promo')
      return { success: true }
    }

    // 2. Jika tabel 'promos' belum ada (PGRST205 dsb), simpan ke store_info.logo_url
    console.info('Using store_info JSON storage fallback for promo:', insertErr.message)
    const existingPromos = (await getPromosFromStoreInfo(supabase)) || [...FALLBACK_BANNERS]
    const newPromoItem: PromoItem = {
      id: 'promo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
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
      products: productInfo,
    }

    const updatedPromos = [newPromoItem, ...existingPromos]
    const saveRes = await savePromosToStoreInfo(supabase, updatedPromos)
    if (!saveRes.success) {
      return { success: false, error: 'Gagal menyimpan promo: ' + saveRes.error }
    }

    revalidatePath('/')
    revalidatePath('/admin/promo')
    return { success: true }
  } catch (err: any) {
    console.error('createPromo error:', err)
    return { success: false, error: err.message || 'Terjadi kesalahan saat membuat promo' }
  }
}

export async function updatePromo(id: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase: SupabaseClient = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized: Silakan login terlebih dahulu' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') return { success: false, error: 'Unauthorized: Hanya admin yang dapat mengubah promo' }

    const judul = (formData.get('judul') as string)?.trim()
    if (!judul) return { success: false, error: 'Judul promo wajib diisi' }

    const subjudul = (formData.get('subjudul') as string)?.trim() || null
    const tipe = ((formData.get('tipe') as string) || 'banner') as 'banner' | 'diskon_produk'
    const product_id = (formData.get('product_id') as string)?.trim() || null
    const badge_text = (formData.get('badge_text') as string)?.trim() || 'PROMO'
    const diskon_persen = formData.get('diskon_persen') ? Number(formData.get('diskon_persen')) : null
    let image_url = (formData.get('image_url') as string)?.trim() || null
    const banner_bg = (formData.get('banner_bg') as string)?.trim() || 'linear-gradient(135deg, #FF6B35 0%, #E85521 100%)'
    let link_url = (formData.get('link_url') as string)?.trim() || null
    const is_active = formData.get('is_active') === 'true' || formData.get('is_active') === 'on'
    const urutan = Number(formData.get('urutan')) || 0

    // Hubungkan info produk jika dipilih
    let productInfo: PromoItem['products'] = null
    if (product_id) {
      const { data: prod } = await supabase
        .from('products')
        .select('id, nama, slug, harga, image_url')
        .eq('id', product_id)
        .single()

      if (prod) {
        productInfo = prod
        if (!link_url) link_url = `/produk/${prod.slug}`
        if (!image_url && prod.image_url) image_url = prod.image_url
      }
    }

    // Handle image upload jika ada file baru
    const imageFile = formData.get('image_file') as File | null
    if (imageFile && imageFile.size > 0) {
      try {
        const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
        const filename = `promo-${id}-${Date.now()}.${ext}`

        const { error: upErr } = await supabase.storage
          .from('products')
          .upload(`promos/${filename}`, imageFile, { upsert: true })

        if (!upErr) {
          const { data: publicUrlData } = supabase.storage
            .from('products')
            .getPublicUrl(`promos/${filename}`)
          if (publicUrlData?.publicUrl) {
            image_url = publicUrlData.publicUrl
          }
        } else {
          const bytes = await imageFile.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const fs = await import('fs/promises')
          const path = await import('path')
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'promos')
          await fs.mkdir(uploadDir, { recursive: true })
          await fs.writeFile(path.join(uploadDir, filename), buffer)
          image_url = `/uploads/promos/${filename}`
        }
      } catch (uploadErr) {
        console.warn('Image upload fallback warning:', uploadErr)
      }
    }

    // 1. Coba update di tabel 'promos' jika id UUID
    const isStandardUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    if (isStandardUuid) {
      const { error: updateErr } = await supabase
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

      if (!updateErr) {
        revalidatePath('/')
        revalidatePath('/admin/promo')
        return { success: true }
      }
    }

    // 2. Simpan update ke store_info.logo_url
    const currentList = (await getPromosFromStoreInfo(supabase)) || [...FALLBACK_BANNERS]
    const idx = currentList.findIndex((p) => String(p.id) === String(id))

    const updatedItem: PromoItem = {
      id,
      judul,
      subjudul,
      tipe,
      product_id,
      badge_text,
      diskon_persen,
      image_url: image_url || (idx >= 0 ? currentList[idx].image_url : null),
      banner_bg,
      link_url: link_url || (idx >= 0 ? currentList[idx].link_url : null),
      is_active,
      urutan,
      products: productInfo || (idx >= 0 ? currentList[idx].products : null),
    }

    let nextList: PromoItem[]
    if (idx >= 0) {
      nextList = [...currentList]
      nextList[idx] = updatedItem
    } else {
      nextList = [updatedItem, ...currentList]
    }

    const saveRes = await savePromosToStoreInfo(supabase, nextList)
    if (!saveRes.success) {
      return { success: false, error: 'Gagal memperbarui promo: ' + saveRes.error }
    }

    revalidatePath('/')
    revalidatePath('/admin/promo')
    return { success: true }
  } catch (err: any) {
    console.error('updatePromo error:', err)
    return { success: false, error: err.message || 'Terjadi kesalahan saat mengupdate promo' }
  }
}

export async function deletePromo(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase: SupabaseClient = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized: Silakan login terlebih dahulu' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') return { success: false, error: 'Unauthorized: Hanya admin yang dapat menghapus promo' }

    // 1. Coba hapus dari tabel 'promos' jika UUID
    const isStandardUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    if (isStandardUuid) {
      await supabase.from('promos').delete().eq('id', id)
    }

    // 2. Hapus dari store_info.logo_url
    const currentList = (await getPromosFromStoreInfo(supabase)) || [...FALLBACK_BANNERS]
    const filtered = currentList.filter((p) => String(p.id) !== String(id))
    await savePromosToStoreInfo(supabase, filtered)

    revalidatePath('/')
    revalidatePath('/admin/promo')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menghapus promo' }
  }
}

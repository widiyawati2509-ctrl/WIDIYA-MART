// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'
import type { Coupon } from '@/types/database'

// Built-in fallback coupons if database table is not yet migrated or empty
const FALLBACK_COUPONS: Coupon[] = [
  {
    id: 'coupon-pengenjek5k',
    kode: 'PENGENJEK5K',
    judul: 'Diskon Warga Pengenjek',
    deskripsi: 'Potongan Rp 5.000 dengan minimal belanja Rp 30.000',
    tipe: 'flat',
    nilai: 5000,
    min_belanja: 30000,
    max_potongan: null,
    kuota: 100,
    terpakai: 0,
    start_date: new Date().toISOString(),
    end_date: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'coupon-hemat10',
    kode: 'HEMAT10',
    judul: 'Diskon Hemat 10%',
    deskripsi: 'Potongan 10% (maksimal Rp 10.000) dengan minimal belanja Rp 25.000',
    tipe: 'persen',
    nilai: 10,
    min_belanja: 25000,
    max_potongan: 10000,
    kuota: 200,
    terpakai: 0,
    start_date: new Date().toISOString(),
    end_date: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'coupon-wargahemat',
    kode: 'WARGAHEMAT',
    judul: 'Voucher Warga Baru',
    deskripsi: 'Potongan Rp 3.000 untuk belanja apa saja minimal Rp 15.000',
    tipe: 'flat',
    nilai: 3000,
    min_belanja: 15000,
    max_potongan: null,
    kuota: 500,
    terpakai: 0,
    start_date: new Date().toISOString(),
    end_date: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export interface ValidateCouponResult {
  valid: boolean
  coupon?: Coupon
  discountAmount?: number
  error?: string
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<ValidateCouponResult> {
  const cleanCode = code?.trim().toUpperCase()
  if (!cleanCode) {
    return { valid: false, error: 'Masukkan kode voucher / promo' }
  }

  let coupon: Coupon | null = null

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .ilike('kode', cleanCode)
      .eq('is_active', true)
      .maybeSingle()

    if (!error && data) {
      coupon = data as Coupon
    }
  } catch (err) {
    console.warn('Coupons table query error, checking fallback:', err)
  }

  // Fallback to built-in list if DB lookup returned nothing
  if (!coupon) {
    coupon = FALLBACK_COUPONS.find((c) => c.kode.toUpperCase() === cleanCode && c.is_active) || null
  }

  if (!coupon) {
    return { valid: false, error: `Kode kupon "${cleanCode}" tidak ditemukan atau sudah tidak aktif` }
  }

  const now = new Date()
  if (coupon.start_date && new Date(coupon.start_date) > now) {
    return { valid: false, error: 'Kupon ini belum mulai berlaku' }
  }

  if (coupon.end_date && new Date(coupon.end_date) < now) {
    return { valid: false, error: 'Masa berlaku kupon ini telah berakhir' }
  }

  if (coupon.kuota !== null && coupon.kuota !== undefined && coupon.terpakai >= coupon.kuota) {
    return { valid: false, error: 'Kuota penggunaan kupon ini telah habis' }
  }

  if (subtotal < coupon.min_belanja) {
    const sisa = coupon.min_belanja - subtotal
    return {
      valid: false,
      error: `Minimal belanja Rp ${coupon.min_belanja.toLocaleString('id-ID')} untuk menggunakan kupon ini (kurang Rp ${sisa.toLocaleString('id-ID')})`,
    }
  }

  let discountAmount = 0
  if (coupon.tipe === 'flat') {
    discountAmount = Math.min(Number(coupon.nilai), subtotal)
  } else if (coupon.tipe === 'persen') {
    const rawDisc = Math.floor(subtotal * (Number(coupon.nilai) / 100))
    discountAmount = coupon.max_potongan ? Math.min(rawDisc, Number(coupon.max_potongan)) : rawDisc
    discountAmount = Math.min(discountAmount, subtotal)
  }

  return {
    valid: true,
    coupon,
    discountAmount,
  }
}

export async function getAvailableCoupons(): Promise<Coupon[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      return data as Coupon[]
    }
  } catch (err) {
    console.warn('Error fetching available coupons from DB:', err)
  }

  return FALLBACK_COUPONS
}

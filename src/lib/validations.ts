// @ts-nocheck
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const registerSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  email: z.string().email('Email tidak valid'),
  no_hp: z
    .string()
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, 'Nomor HP tidak valid')
    .optional()
    .or(z.literal('')),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Password tidak cocok',
  path: ['confirm_password'],
})

export const checkoutSchema = z.object({
  nama_pemesan: z.string().min(2, 'Nama pemesan minimal 2 karakter'),
  no_hp_pemesan: z
    .string()
    .min(9, 'Nomor WhatsApp minimal 9 digit')
    .max(16, 'Nomor WhatsApp maksimal 16 digit')
    .regex(/^(\+62|62|0)[0-9]{8,13}$/, 'Format nomor WhatsApp tidak valid (contoh: 081234567890)'),
  catatan: z.string().max(500).optional(),
})

export const productSchema = z.object({
  nama: z.string().min(2, 'Nama produk minimal 2 karakter').max(200),
  deskripsi: z.string().max(2000).optional(),
  harga: z.number().min(0, 'Harga tidak boleh negatif'),
  stok: z.number().int().min(0, 'Stok tidak boleh negatif'),
  category_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().default(true),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type ProductInput = z.infer<typeof productSchema>

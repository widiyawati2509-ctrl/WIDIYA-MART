// @ts-nocheck
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema } from '@/lib/validations'

export async function login(prevOrFormData: unknown, maybeFormData?: FormData): Promise<{ error?: string } | void> {
  const formData = (maybeFormData instanceof FormData ? maybeFormData : prevOrFormData) as FormData

  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { error: 'Email atau password salah' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function register(prevOrFormData: unknown, maybeFormData?: FormData): Promise<{ error?: string } | void> {
  const formData = (maybeFormData instanceof FormData ? maybeFormData : prevOrFormData) as FormData

  const raw = {
    nama: formData.get('nama') as string,
    email: formData.get('email') as string,
    no_hp: formData.get('no_hp') as string,
    password: formData.get('password') as string,
    confirm_password: formData.get('confirm_password') as string,
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        nama: parsed.data.nama,
        no_hp: parsed.data.no_hp || null,
      },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Email sudah terdaftar' }
    }
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/masuk')
}

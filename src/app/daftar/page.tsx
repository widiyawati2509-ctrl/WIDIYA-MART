// @ts-nocheck
'use client'

import { register } from '@/lib/actions/auth'
import { useActionState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, Field, Input, Button } from '@/components/ui'
import AlertBanner from '@/components/AlertBanner'

export default function DaftarPage() {
  const [state, formAction, isPending] = useActionState(register, null)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--paper)] py-8">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center mx-auto mb-3 shadow-[0_6px_14px_-2px_rgba(255,107,53,.45),inset_0_1px_0_rgba(255,255,255,.4)]">
            <Image
              src="/logo.png"
              alt="PENGENJEK MART Logo"
              width={46}
              height={46}
              className="rounded-[var(--radius-sm)] object-cover"
              priority
            />
          </div>
          <h1 className="text-xl font-sora font-bold text-[var(--ink)]">Daftar Akun</h1>
          <p className="text-[var(--ink-soft)] text-xs mt-0.5 font-medium">Buat akun PENGENJEK MART baru</p>
        </div>

        <Card className="p-5 border border-[rgba(232,214,205,0.9)]">
          <form action={formAction} className="space-y-3.5">
            {state?.error && (
              <AlertBanner type="error" message={state.error} className="mb-4" />
            )}

            <Field label="Nama Lengkap" htmlFor="nama">
              <Input
                id="nama"
                type="text"
                name="nama"
                required
                placeholder="Nama lengkap kamu"
              />
            </Field>

            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                name="email"
                required
                placeholder="email@contoh.com"
              />
            </Field>

            <Field label="Nomor WhatsApp (opsional)" htmlFor="no_hp">
              <Input
                id="no_hp"
                type="tel"
                name="no_hp"
                placeholder="08xxxxxxxxxx"
              />
            </Field>

            <Field label="Password" htmlFor="password">
              <Input
                id="password"
                type="password"
                name="password"
                required
                placeholder="Minimal 6 karakter"
              />
            </Field>

            <Field label="Konfirmasi Password" htmlFor="confirm_password">
              <Input
                id="confirm_password"
                type="password"
                name="confirm_password"
                required
                placeholder="Ulangi password"
              />
            </Field>

            <Button
              type="submit"
              variant="primary"
              disabled={isPending}
              className="w-full py-3.5 text-sm font-sora font-bold mt-2"
            >
              {isPending ? 'Mendaftar...' : 'Daftar Sekarang'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-[var(--ink-soft)] mt-6 font-medium">
          Sudah punya akun?{' '}
          <Link href="/masuk" className="text-[var(--accent-2)] font-bold hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}

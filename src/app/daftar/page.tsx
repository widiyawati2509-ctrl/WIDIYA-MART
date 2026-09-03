// @ts-nocheck
'use client'

import { register } from '@/lib/actions/auth'
import { useActionState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, Field, Input, Button } from '@/components/ui'

export default function DaftarPage() {
  const [state, formAction, isPending] = useActionState(register, null)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-surface py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Image
            src="/logo.png"
            alt="Widiya Mart Logo"
            width={64}
            height={64}
            className="rounded-2xl mx-auto mb-4 shadow-card border border-white/50"
            priority
          />
          <h1 className="text-2xl font-bold text-ink">Daftar Akun</h1>
          <p className="text-muted text-sm mt-1">Buat akun Widiya Mart baru</p>
        </div>

        <Card className="p-6">
          <form action={formAction} className="space-y-3.5">
            {state?.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm px-3.5 py-2.5">
                {state.error}
              </div>
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
              className="w-full py-3 text-base mt-2"
            >
              {isPending ? 'Mendaftar...' : 'Daftar Sekarang'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-muted mt-6">
          Sudah punya akun?{' '}
          <Link href="/masuk" className="text-accent-press font-semibold hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}

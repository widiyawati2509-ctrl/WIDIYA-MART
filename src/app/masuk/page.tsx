// @ts-nocheck
'use client'

import { login } from '@/lib/actions/auth'
import { useActionState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, Field, Input, Button } from '@/components/ui'

export default function MasukPage() {
  const [state, formAction, isPending] = useActionState(login, null)

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
          <h1 className="text-2xl font-bold text-ink">Masuk</h1>
          <p className="text-muted text-sm mt-1">Masuk ke akun Widiya Mart kamu</p>
        </div>

        <Card className="p-6">
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm px-3.5 py-2.5">
                {state.error}
              </div>
            )}

            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                name="email"
                required
                placeholder="email@contoh.com"
              />
            </Field>

            <Field label="Password" htmlFor="password">
              <Input
                id="password"
                type="password"
                name="password"
                required
                placeholder="••••••••"
              />
            </Field>

            <Button
              type="submit"
              variant="primary"
              disabled={isPending}
              className="w-full py-3 text-base mt-2"
            >
              {isPending ? 'Masuk...' : 'Masuk'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-muted mt-6">
          Belum punya akun?{' '}
          <Link href="/daftar" className="text-accent-press font-semibold hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  )
}

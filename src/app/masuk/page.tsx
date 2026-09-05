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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--paper)] py-8">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center mx-auto mb-3 shadow-[0_6px_14px_-2px_rgba(255,107,53,.45),inset_0_1px_0_rgba(255,255,255,.4)]">
            <Image
              src="/logo.png"
              alt="PENGENJEK MART Logo"
              width={46}
              height={46}
              className="rounded-[12px] object-cover"
              priority
            />
          </div>
          <h1 className="text-xl font-sora font-bold text-[var(--ink)]">Masuk</h1>
          <p className="text-[var(--ink-soft)] text-xs mt-0.5 font-medium">Masuk ke akun PENGENJEK MART kamu</p>
        </div>

        <Card className="p-5 border border-[rgba(232,214,205,0.9)]">
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="rounded-[12px] bg-red-50 border border-red-200 text-[var(--danger)] text-xs font-semibold px-3.5 py-2.5">
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
              className="w-full py-3.5 text-sm font-sora font-bold mt-2"
            >
              {isPending ? 'Masuk...' : 'Masuk ke Akun'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-[var(--ink-soft)] mt-6 font-medium">
          Belum punya akun?{' '}
          <Link href="/daftar" className="text-[var(--accent-2)] font-bold hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  )
}

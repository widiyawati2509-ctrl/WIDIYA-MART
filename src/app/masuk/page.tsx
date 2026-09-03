// @ts-nocheck
'use client'

import { login } from '@/lib/actions/auth'
import { useActionState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function MasukPage() {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Image
            src="/logo.png"
            alt="Widiya Mart Logo"
            width={64}
            height={64}
            className="rounded-2xl mx-auto mb-4 shadow-sm border border-gray-100"
            priority
          />
          <h1 className="text-2xl font-bold">Masuk</h1>
          <p className="text-gray-500 text-sm mt-1">Masuk ke akun Widiya Mart kamu</p>
        </div>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {state.error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              placeholder="email@contoh.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-3d btn-3d-green w-full py-3.5 rounded-xl font-semibold disabled:opacity-50"
          >
            {isPending ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Belum punya akun?{' '}
          <Link href="/daftar" className="text-green-600 font-medium hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  )
}

// @ts-nocheck
'use client'

import { register } from '@/lib/actions/auth'
import { useActionState } from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export default function DaftarPage() {
  const [state, formAction, isPending] = useActionState(register, null)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Daftar</h1>
          <p className="text-gray-500 text-sm mt-1">Buat akun Widiya Mart baru</p>
        </div>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {state.error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Nama Lengkap</label>
            <input
              type="text"
              name="nama"
              required
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nama lengkap kamu"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="email@contoh.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Nomor HP <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <input
              type="tel"
              name="no_hp"
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Konfirmasi Password</label>
            <input
              type="password"
              name="confirm_password"
              required
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ulangi password"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah punya akun?{' '}
          <Link href="/masuk" className="text-green-600 font-medium hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}

// @ts-nocheck
'use client'

import { login } from '@/lib/actions/auth'
import { useActionState, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, ShieldCheck } from 'lucide-react'

export default function MasukPage() {
  const [state, formAction, isPending] = useActionState(login, null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const fillAdminCredentials = () => {
    setEmail('admin@widiyamart.com')
    setPassword('admin123456')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Masuk</h1>
          <p className="text-gray-500 text-sm mt-1">Masuk ke akun Widiya Mart kamu</p>
        </div>

        {/* Quick Admin Access Card */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-900">Akses Pemilik Toko (Admin)</span>
          </div>
          <p className="text-xs text-amber-700 mb-2.5">
            Klik tombol di bawah untuk mengisi akun admin secara otomatis:
          </p>
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="w-full text-xs font-semibold py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors shadow-sm"
          >
            Gunakan Akun Admin (1-Klik)
          </button>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm"
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

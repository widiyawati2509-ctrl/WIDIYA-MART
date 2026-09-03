// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut } from 'lucide-react'
import { logout } from '@/lib/actions/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/masuk')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, nama')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const navLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/produk', label: 'Produk' },
    { href: '/admin/kategori', label: 'Kategori' },
    { href: '/admin/pesanan', label: 'Pesanan' },
    { href: '/admin/pengaturan', label: 'Pengaturan' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin header */}
      <header className="bg-green-700 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Widiya Mart Logo"
            width={32}
            height={32}
            className="rounded-lg shadow-xs border border-white/20"
          />
          <div>
            <p className="font-bold text-sm leading-tight">Admin Panel</p>
            <p className="text-green-200 text-xs">Widiya Mart</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-green-200 font-medium">{profile?.nama}</span>
          <form action={logout}>
            <button
              type="submit"
              className="btn-3d btn-3d-red p-1.5 rounded-lg text-white"
              title="Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </header>

      {/* Tab nav */}
      <nav className="bg-white border-b overflow-x-auto">
        <div className="flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex-shrink-0 px-4 py-3 text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-gray-50 border-b-2 border-transparent transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4">{children}</main>
    </div>
  )
}

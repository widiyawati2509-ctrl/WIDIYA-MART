// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
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
      <header className="bg-green-700 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div>
          <p className="font-bold text-sm">Admin Panel</p>
          <p className="text-green-200 text-xs">Widiya Mart</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-green-200">{profile?.nama}</span>
          <form action={logout}>
            <button type="submit" className="p-1.5 hover:bg-green-600 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
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

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
    <div className="min-h-screen bg-surface">
      {/* Admin header */}
      <header className="glass sticky top-0 z-50 px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Widiya Mart Logo"
            width={32}
            height={32}
            className="rounded-lg shadow-card border border-white/50 shrink-0"
          />
          <div>
            <p className="font-bold text-sm text-ink leading-tight">Admin Panel</p>
            <p className="text-xs text-muted">Widiya Mart</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-strong font-medium hidden sm:inline">
            {profile?.nama}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="press inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              title="Keluar"
            >
              <LogOut size={14} />
              <span>Keluar</span>
            </button>
          </form>
        </div>
      </header>

      {/* Tab nav */}
      <nav className="glass border-b border-border overflow-x-auto scrollbar-hide py-1.5 px-3">
        <div className="flex gap-1.5 max-w-5xl mx-auto">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="press flex-shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-full text-muted-strong hover:bg-zinc-100 hover:text-ink transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4 pb-20">{children}</main>
    </div>
  )
}

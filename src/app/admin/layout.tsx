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
    <div className="min-h-screen bg-[var(--paper)]">
      {/* Admin header */}
      <header className="top-header sticky top-0 z-50 px-4 py-3 border-b border-[rgba(232,214,205,0.8)] bg-[rgba(250,240,235,0.92)] backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(43,24,16,0.06)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="logo-box flex items-center justify-center p-1 overflow-hidden shrink-0">
            <Image
              src="/logo.png"
              alt="Widiya Mart Logo"
              width={28}
              height={28}
              className="rounded-[8px] object-cover"
            />
          </div>
          <div>
            <p className="font-sora font-bold text-sm text-[var(--ink)] leading-tight">Admin Panel</p>
            <p className="text-xs text-[var(--ink-soft)] font-medium">Widiya Mart</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--ink-soft)] font-semibold hidden sm:inline">
            {profile?.nama}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="press inline-flex items-center gap-1.5 rounded-[12px] bg-[var(--danger)] px-3 py-1.5 text-xs font-sora font-bold text-white shadow-xs"
              title="Keluar"
            >
              <LogOut size={13} />
              <span>Keluar</span>
            </button>
          </form>
        </div>
      </header>

      {/* Tab nav */}
      <nav className="border-b border-[rgba(232,214,205,0.8)] bg-white/70 overflow-x-auto scrollbar-hide py-2 px-3">
        <div className="flex gap-2 max-w-[480px] mx-auto">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              prefetch={true}
              className="cat-chip flex-shrink-0 text-xs font-semibold"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="max-w-[480px] mx-auto p-4 pb-24">{children}</main>
    </div>
  )
}

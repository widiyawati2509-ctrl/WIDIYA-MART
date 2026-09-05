// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut, ShoppingBag } from 'lucide-react'
import { logout } from '@/lib/actions/auth'
import AdminOrderNotifier from '@/components/admin/AdminOrderNotifier'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Panel | PENGENJEK MART',
  applicationName: 'PENGENJEK MART Admin',
  manifest: '/admin-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PENGENJEK MART Admin',
  },
  icons: {
    icon: [
      { url: '/admin-icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/admin-icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/admin-apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

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
    { href: '/admin/promo', label: 'Promo' },
    { href: '/admin/poin', label: 'Poin' },
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
              alt="PENGENJEK MART Logo"
              width={28}
              height={28}
              className="rounded-[8px] object-cover"
            />
          </div>
          <div>
            <p className="font-sora font-bold text-sm text-[var(--ink)] leading-tight">Admin Panel</p>
            <p className="text-xs text-[var(--ink-soft)] font-medium">PENGENJEK MART</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            prefetch={true}
            className="press inline-flex items-center gap-1.5 rounded-[12px] bg-white border border-[rgba(232,214,205,0.9)] px-2.5 py-1.5 text-xs font-sora font-bold text-[var(--ink)] shadow-xs hover:bg-[var(--accent-bg)] active:scale-95 transition-all"
            title="Lihat Tampilan Toko"
          >
            <ShoppingBag size={13} className="text-[var(--accent)]" />
            <span className="hidden xs:inline">Lihat Toko</span>
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="press inline-flex items-center gap-1.5 rounded-[12px] bg-[var(--danger)] px-2.5 py-1.5 text-xs font-sora font-bold text-white shadow-xs"
              title="Keluar"
            >
              <LogOut size={13} />
              <span className="hidden xs:inline">Keluar</span>
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

      <AdminOrderNotifier />
      <main className="max-w-[480px] mx-auto p-4 pb-24">{children}</main>
    </div>
  )
}

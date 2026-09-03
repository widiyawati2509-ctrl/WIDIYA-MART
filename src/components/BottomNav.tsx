// @ts-nocheck
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Grid3X3, ShoppingCart, Package, User } from 'lucide-react'

interface BottomNavProps {
  cartCount: number
  isLoggedIn: boolean
}

const navItems = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/kategori', label: 'Kategori', icon: Grid3X3 },
  { href: '/keranjang', label: 'Keranjang', icon: ShoppingCart },
  { href: '/pesanan', label: 'Pesanan', icon: Package },
  { href: '/profil', label: 'Akun', icon: User },
]

export default function BottomNav({ cartCount, isLoggedIn }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className="fixed left-1/2 -translate-x-1/2 bottom-4 max-w-[calc(480px-32px)] w-[calc(100%-32px)] rounded-[24px] p-1.5 flex items-center justify-between z-50 border border-white/12 shadow-[0_16px_35px_-6px_rgba(43,24,16,.5),inset_0_1px_1px_rgba(255,255,255,.18)]"
      style={{ background: 'linear-gradient(145deg, #2B1810, #1E0F0A)' }}
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
        const isCart = href === '/keranjang'
        const isProfil = href === '/profil'
        const resolvedHref = isProfil && !isLoggedIn ? '/masuk' : href

        return (
          <Link
            key={href}
            href={resolvedHref}
            prefetch={true}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-[18px] transition-all relative press ${
              isActive
                ? 'text-white border border-[rgba(255,107,53,0.4)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_14px_rgba(255,107,53,0.35)]'
                : 'text-[#A8928B] hover:text-white/80'
            }`}
            style={
              isActive
                ? {
                    background:
                      'linear-gradient(135deg, rgba(255,107,53,0.45), rgba(232,85,33,0.25))',
                  }
                : undefined
            }
          >
            <div className="relative">
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
              {isCart && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-3 bg-[var(--accent)] text-white text-[9.5px] font-extrabold rounded-full px-1.5 min-w-[16px] h-4 flex items-center justify-center shadow-sm">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] mt-1 font-inter ${
                isActive ? 'font-bold text-white' : 'font-medium text-[#A8928B]'
              }`}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

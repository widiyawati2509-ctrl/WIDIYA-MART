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
    <nav className="fixed inset-x-3 bottom-3 max-w-lg mx-auto rounded-full glass z-50 py-1.5 px-1 shadow-card">
      <div className="flex items-center justify-around">
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
              className="flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95"
            >
              <div className="relative">
                <div
                  className={`w-10 h-8 rounded-xl chip-3d transition-all ${
                    isActive
                      ? 'chip-3d-accent text-white -translate-y-1'
                      : 'chip-3d-neutral text-muted-strong'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                {isCart && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent-subtle text-accent-press ring-1 ring-inset ring-accent/20 text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 ${
                  isActive ? 'font-semibold text-accent-press' : 'font-medium text-muted'
                }`}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

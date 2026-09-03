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
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 py-1">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
          const isCart = href === '/keranjang'
          const isProfil = href === '/profil'

          const resolvedHref = isProfil && !isLoggedIn ? '/masuk' : href

          return (
            <Link
              key={href}
              href={resolvedHref}
              className="flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95"
            >
              <div className="relative">
                <div
                  className={`w-10 h-8 rounded-xl chip-3d transition-all ${
                    isActive
                      ? 'chip-3d-accent text-white scale-105'
                      : 'chip-3d-neutral text-gray-500'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                {isCart && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 chip-3d chip-3d-negative text-white text-[10px] w-4.5 h-4.5 font-bold shadow-xs">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 ${
                  isActive ? 'font-bold text-green-700' : 'font-medium text-gray-500'
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

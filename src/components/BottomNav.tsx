// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, ShoppingCart, ShoppingBag, User } from 'lucide-react'

interface BottomNavProps {
  cartCount: number
  isLoggedIn: boolean
}

const navItems = [
  { href: '/', label: 'Beranda', IconComponent: Home },
  { href: '/kategori', label: 'Kategori', IconComponent: LayoutGrid },
  { href: '/keranjang', label: 'Keranjang', IconComponent: ShoppingCart },
  { href: '/pesanan', label: 'Pesanan', IconComponent: ShoppingBag },
  { href: '/profil', label: 'Akun', IconComponent: User },
]

export default function BottomNav({ cartCount, isLoggedIn }: BottomNavProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    let lastScrollY = window.scrollY
    let timeoutId: NodeJS.Timeout | null = null

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const diff = currentScrollY - lastScrollY

      // Hanya trigger jika scroll melewati threshold 8px
      if (Math.abs(diff) > 8) {
        if (diff > 0 && currentScrollY > 60) {
          // Scroll ke BAWAH -> nav mengecil & fade sedikit
          setIsCollapsed(true)
        } else if (diff < 0) {
          // Scroll ke ATAS -> nav kembali muncul penuh
          setIsCollapsed(false)
        }
        lastScrollY = currentScrollY
      }

      // Saat user berhenti scroll selama 800ms, kembalikan ke tampilan penuh
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setIsCollapsed(false)
      }, 800)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  const activeNavIndex = navItems.findIndex(
    ({ href }) => pathname === href || (href !== '/' && pathname.startsWith(href))
  )

  return (
    <nav
      aria-label="Navigasi Utama"
      className={`fixed left-1/2 -translate-x-1/2 bottom-3.5 max-w-[calc(480px-32px)] w-[calc(100%-32px)] rounded-[var(--radius-xl)] p-1 grid grid-cols-5 items-center z-50 border border-white/15 shadow-nav backdrop-blur-xl transition-[transform,opacity] duration-300 ease-[var(--ease-spring)] hover:opacity-100 hover:translate-y-0 hover:scale-100 ${
        isCollapsed
          ? 'opacity-45 translate-y-2 scale-[0.97]'
          : 'opacity-100 translate-y-0 scale-100'
      }`}
      style={{
        background: 'linear-gradient(145deg, rgba(43, 24, 16, 0.92), rgba(30, 15, 10, 0.94))',
      }}
    >
      {/* mickadesign/fluid-functionalism: Shared sliding spring highlight pill */}
      {activeNavIndex >= 0 && (
        <div
          aria-hidden="true"
          className="absolute top-1 bottom-1 left-1 w-[calc((100%-8px)/5)] rounded-[var(--radius-lg)] border border-[rgba(255,107,53,0.42)] shadow-chip-active pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,107,53,0.48), rgba(232,85,33,0.26))',
            transform: `translateX(${activeNavIndex * 100}%)`,
            transition: 'transform 280ms var(--ease-spring)',
          }}
        />
      )}

      {navItems.map(({ href, label, IconComponent }) => {
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
        const isCart = href === '/keranjang'
        const isProfil = href === '/profil'
        const isPesanan = href === '/pesanan'
        const resolvedHref = (isProfil || isPesanan) && !isLoggedIn ? '/masuk' : href

        return (
          <Link
            key={href}
            href={resolvedHref}
            prefetch={true}
            aria-current={isActive ? 'page' : undefined}
            className={`relative z-10 flex flex-col items-center justify-center py-1.5 px-1 min-h-[42px] min-w-[42px] rounded-[var(--radius-lg)] transition-colors press ${
              isActive
                ? 'text-white'
                : 'text-[#A8928B] hover:text-white/80'
            }`}
          >
            <div className="relative">
              <IconComponent
                aria-hidden="true"
                className={`size-[18px] transition-transform ${
                  isActive ? 'scale-110 text-white' : 'text-[#A8928B]'
                }`}
                strokeWidth={isActive ? 2.3 : 1.8}
              />
              {isCart && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-[var(--accent)] text-white text-[9px] font-extrabold rounded-full px-1 min-w-[15px] h-3.5 flex items-center justify-center shadow-xs tabular-nums">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] mt-0.5 font-inter leading-none ${
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


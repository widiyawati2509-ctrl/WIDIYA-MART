// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import AddressSelector from '@/components/AddressSelector'
import SearchBar from '@/components/SearchBar'
import type { StoreInfo } from '@/types/database'

interface HomeHeaderProps {
  storeInfo?: StoreInfo | null
}

export default function HomeHeader({ storeInfo }: HomeHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY
          setIsScrolled((prev) => {
            if (!prev && y > 30) return true
            if (prev && y < 15) return false
            return prev
          })
          ticking = false
        })
        ticking = true
      }
    }

    // Check initial scroll position on mount
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className="top-header sticky top-[var(--admin-bar-offset,0px)] z-40 px-4 py-2.5 border-b border-[rgba(232,214,205,0.8)] shadow-header bg-[rgba(250,240,235,0.94)] backdrop-blur-md mb-3">
      {/* Collapsible Section: Store Name, Tagline, Favorite & Address Bar */}
      <div
        className="grid transition-[grid-template-rows,opacity,margin-bottom] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[grid-template-rows,opacity]"
        style={{
          gridTemplateRows: isScrolled ? '0fr' : '1fr',
          opacity: isScrolled ? 0 : 1,
          marginBottom: isScrolled ? '0px' : '8px',
          pointerEvents: isScrolled ? 'none' : 'auto',
        }}
      >
        <div className="overflow-hidden min-h-0">
          <div
            className="flex flex-col gap-2 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              transform: isScrolled ? 'translateY(-6px)' : 'translateY(0)',
            }}
          >
            {/* Baris 1: Logo, Nama Toko, Tagline & Tombol Favorit */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="logo-box flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-badge">
                  <Image
                    src="/logo.png"
                    alt="PENGENJEK MART Logo"
                    width={34}
                    height={34}
                    className="rounded-[var(--radius-sm)] object-cover"
                    priority
                  />
                </div>
                <div>
                  <h1 className="font-sora font-bold text-[var(--text-subtitle)] leading-tight text-[var(--ink)]">
                    {storeInfo?.nama_toko ?? 'PENGENJEK MART'}
                  </h1>
                  <p className="text-[var(--text-caption)] text-[var(--ink-soft)] leading-tight font-medium">
                    Pesan online, ambil di toko (COD)
                  </p>
                </div>
              </div>

              {/* Quick Link to Daftar Belanja (Favorit) */}
              <Link
                href="/daftar-belanja"
                prefetch={true}
                className="press flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[rgba(232,214,205,0.9)] shadow-xs hover:border-rose-300 text-[var(--ink)] text-xs font-sora font-semibold transition-all active:scale-95"
                title="Daftar Produk Disukai / Favorit"
              >
                <Heart size={14} className="text-rose-500 fill-rose-500/20" />
                <span>Favorit</span>
              </Link>
            </div>

            {/* Baris 2: SATU Baris Ringkas Alamat & Jam Buka */}
            <AddressSelector storeInfo={storeInfo} />
          </div>
        </div>
      </div>

      {/* Tab Pencarian: Selalu terlihat & sticky di header */}
      <div className="w-full">
        <SearchBar />
      </div>
    </header>
  )
}

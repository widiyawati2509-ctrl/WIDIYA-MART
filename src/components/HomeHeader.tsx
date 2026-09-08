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
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY)
          ticking = false
        })
        ticking = true
      }
    }

    // Set initial scroll position
    setScrollY(window.scrollY)

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 1-to-1 scroll-linked interpolation (No layout shifts, pure 120fps GPU compositing)
  const progress = Math.min(1, Math.max(0, scrollY / 60))
  const opacity = 1 - progress
  const translateY = progress * 12
  const isStuck = scrollY > 55

  return (
    <div className="w-full mb-3">
      {/* 1. Bagian Atas: Nama Toko, Tagline, Favorit, Alamat & Jam Buka */}
      <div
        className="px-4 pt-3 pb-1 flex flex-col gap-2 will-change-[opacity,transform]"
        style={{
          opacity,
          transform: `translateY(-${translateY}px)`,
          pointerEvents: opacity < 0.1 ? 'none' : 'auto',
          visibility: opacity <= 0 ? 'hidden' : 'visible',
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

      {/* 2. Tab Pencarian (Sticky Paling Atas Layar, Selalu Terlihat) */}
      <div
        className={`sticky top-[var(--admin-bar-offset,0px)] z-40 px-4 py-2 transition-all duration-200 ${
          isStuck
            ? 'bg-[rgba(250,240,235,0.96)] backdrop-blur-md border-b border-[rgba(232,214,205,0.8)] shadow-header'
            : 'bg-transparent'
        }`}
      >
        <SearchBar />
      </div>
    </div>
  )
}

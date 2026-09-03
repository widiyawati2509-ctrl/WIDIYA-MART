// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, ShoppingBag, Clock, ChevronRight, ChevronLeft } from 'lucide-react'

const banners = [
  {
    id: 1,
    badge: 'PROMO SPESIAL',
    title: 'Diskon Sembako Hemat',
    subtitle: 'Beras, Minyak Goreng & Gula diskon s/d 15%',
    icon: Sparkles,
    gradient: 'from-green-600 to-emerald-700',
    link: '/kategori?kategori=sembako',
    cta: 'Belanja Sembako',
    tag: 'Stok Terbatas',
  },
  {
    id: 2,
    badge: 'PRAKTIS & CEPAT',
    title: 'Pesan & Ambil di Toko',
    subtitle: 'Siap dalam 15 menit, bayar tunai (COD) di kasir',
    icon: Clock,
    gradient: 'from-emerald-600 to-teal-800',
    link: '/kategori',
    cta: 'Pesan Sekarang',
    tag: 'Bebas Antre',
  },
  {
    id: 3,
    badge: 'KESEGARAN SETIAP HARI',
    title: 'Minuman & Snack Segar',
    subtitle: 'Pilihan lengkap untuk menemani santai dan kerja',
    icon: ShoppingBag,
    gradient: 'from-teal-700 to-green-800',
    link: '/kategori?kategori=minuman',
    cta: 'Lihat Pilihan',
    tag: 'Harga Terbaik',
  },
]

export default function PromoBannerCarousel() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [isPaused])

  const nextSlide = () => setCurrent((prev) => (prev + 1) % banners.length)
  const prevSlide = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)

  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-sm group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((b) => {
          const Icon = b.icon
          return (
            <div
              key={b.id}
              className={`w-full shrink-0 bg-gradient-to-r ${b.gradient} text-white p-5 rounded-2xl flex flex-col justify-between relative min-h-[140px]`}
            >
              <div className="relative z-10 pr-12">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase border border-white/20">
                    {b.badge}
                  </span>
                  <span className="text-[11px] text-green-100 font-medium">
                    {b.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold leading-tight mb-1">
                  {b.title}
                </h3>
                <p className="text-xs text-green-100 line-clamp-1 mb-3">
                  {b.subtitle}
                </p>
                <Link
                  href={b.link}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white text-green-700 hover:bg-green-50 px-3.5 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
                >
                  {b.cta}
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Decorative Icon Background */}
              <div className="absolute right-3 bottom-2 text-white/10 pointer-events-none">
                <Icon className="w-24 h-24 stroke-[1]" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Manual Navigation Controls */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-2.5 right-4 flex items-center gap-1.5 z-10">
        {banners.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full h-1.5 ${
              i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

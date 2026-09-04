// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronLeft } from 'lucide-react'

import Image from 'next/image'

const banners = [
  {
    id: 1,
    badge: 'PROMO SPESIAL',
    title: 'Mama Lemon Jeruk Nipis',
    subtitle: 'Sabun cuci piring refill 650g cuma Rp 10.000',
    productImage: '/products/1788105463290-z57uce.jpeg',
    backgroundStyle: 'linear-gradient(135deg, #FF6B35 0%, #E85521 100%)',
    boxShadow: '0 10px 25px -5px rgba(232,85,33,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
    link: '/produk/mama-lemon-sabun-cuci-piring-jeruk-nipis-refill-650-g',
    cta: 'Beli Sekarang',
    tag: 'Hemat Banget',
  },
  {
    id: 2,
    badge: 'NUTRISI ANAK',
    title: 'Frisian Flag UHT Cokelat',
    subtitle: 'Susu UHT Nutribrain 6 x 110 ml cuma Rp 24.000',
    productImage: '/products/1788105762288-zi1d3s.jpeg',
    backgroundStyle: 'linear-gradient(145deg, #2B1810 0%, #452419 100%)',
    boxShadow: '0 10px 25px -5px rgba(43,24,16,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
    link: '/produk/frisian-flag-nutribrain-susu-uht-cair-cokelat-kotak-6-x-110-ml',
    cta: 'Pesan Sekarang',
    tag: 'Terlaris',
  },
  {
    id: 3,
    badge: 'SKINCARE HARIAN',
    title: 'Glow & Lovely Foam',
    subtitle: 'Pembersih wajah multivitamin 100g cerahkan kulit',
    productImage: '/products/1788105042968-b41tnf.jpeg',
    backgroundStyle: 'linear-gradient(135deg, #FF7E47 0%, #D84315 100%)',
    boxShadow: '0 10px 25px -5px rgba(216,67,21,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
    link: '/produk/glow-lovely-pembersih-wajah-foam-untuk-kulit-kusam-multivitamin-100-g',
    cta: 'Lihat Produk',
    tag: 'Best Seller',
  },
  {
    id: 4,
    badge: 'KEBUTUHAN BAYI',
    title: 'Merries Good Skin Popok',
    subtitle: 'Popok lembut & berpori ekstra kering isi 28 pcs',
    productImage: '/products/1788105290195-w22rcy.jpeg',
    backgroundStyle: 'linear-gradient(135deg, #FF8F50 0%, #E64A19 100%)',
    boxShadow: '0 10px 25px -5px rgba(230,74,25,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
    link: '/produk/merries-good-skin-popok-celana-bayi-l-28-pcs',
    cta: 'Cek Promo',
    tag: 'Pilihan Ibu',
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
      className="relative overflow-hidden rounded-[20px] shadow-3d group"
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
        {banners.map((b) => (
          <div
            key={b.id}
            className="w-full shrink-0 text-white p-5 rounded-[20px] flex flex-col justify-between relative min-h-[154px]"
            style={{
              background: b.backgroundStyle,
              boxShadow: b.boxShadow,
            }}
          >
            <div className="relative z-10 pr-28">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-sora font-bold tracking-wider px-2.5 py-0.5 rounded-full uppercase border border-white/30">
                  {b.badge}
                </span>
                <span className="text-[11px] text-white/90 font-semibold">
                  {b.tag}
                </span>
              </div>
              <h3 className="text-lg font-sora font-bold leading-tight mb-1">
                {b.title}
              </h3>
              <p className="text-xs text-white/90 line-clamp-1 mb-3 font-medium">
                {b.subtitle}
              </p>
              <Link
                href={b.link}
                className="inline-flex items-center gap-1.5 bg-white text-[var(--accent-2)] font-sora font-bold text-xs px-3.5 py-2 rounded-[12px] shadow-[0_4px_12px_rgba(43,24,16,0.18),inset_0_1px_0_#ffffff] press"
              >
                <span>{b.cta}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Real Product Image with 3D Puffy Pedestal Frame */}
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-hover:scale-105 duration-300">
              <div className="w-[88px] h-[88px] sm:w-[96px] sm:h-[96px] rounded-[20px] bg-white/95 backdrop-blur-md p-1.5 shadow-[0_12px_24px_-4px_rgba(0,0,0,0.28),inset_0_2px_4px_rgba(255,255,255,0.9)] border border-white/70 flex items-center justify-center relative overflow-hidden">
                <Image
                  src={b.productImage}
                  alt={b.title}
                  fill
                  className="object-contain p-1.5"
                  sizes="96px"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Navigation Controls */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
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
              i === current ? 'w-5 bg-white shadow-xs' : 'w-1.5 bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

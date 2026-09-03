// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronLeft } from 'lucide-react'

// Realistic 3D Icon Illustrations
function Sembako3DIcon() {
  return (
    <svg viewBox="0 0 120 120" className="w-24 h-24 drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]" fill="none">
      <defs>
        <linearGradient id="sackGrad" x1="20" y1="30" x2="90" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE0B2" />
          <stop offset="0.5" stopColor="#FFB74D" />
          <stop offset="1" stopColor="#E65100" />
        </linearGradient>
        <linearGradient id="riceGrad" x1="40" y1="20" x2="80" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFF3E0" />
        </linearGradient>
        <linearGradient id="oilGrad" x1="70" y1="40" x2="105" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF176" />
          <stop offset="0.6" stopColor="#FBC02D" />
          <stop offset="1" stopColor="#F57F17" />
        </linearGradient>
        <filter id="glow3d" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.25" />
        </filter>
      </defs>
      {/* 3D Rice Sack */}
      <path
        d="M25 50 C25 40, 35 32, 50 32 C65 32, 75 40, 75 50 C75 75, 78 95, 70 102 C62 108, 38 108, 30 102 C22 95, 25 75, 25 50 Z"
        fill="url(#sackGrad)"
        filter="url(#glow3d)"
      />
      {/* Rice Sack tied neck & ears */}
      <path d="M35 34 C30 24, 40 20, 50 22 C60 20, 70 24, 65 34 Z" fill="url(#riceGrad)" />
      <ellipse cx="50" cy="33" rx="14" ry="4" fill="#D84315" opacity="0.6" />
      {/* Rice sack ribbon */}
      <rect x="37" y="32" width="26" height="4" rx="2" fill="#D84315" />
      {/* Highlight sheen */}
      <path d="M33 50 Q30 75 35 90" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      <text x="50" y="70" textAnchor="middle" fill="#FFFFFF" fontWeight="800" fontSize="13" fontFamily="Sora">BERAS</text>
      <text x="50" y="82" textAnchor="middle" fill="#FFE0B2" fontWeight="700" fontSize="9" fontFamily="Sora">PREMIUM</text>

      {/* 3D Cooking Oil Bottle */}
      <rect x="75" y="48" width="26" height="52" rx="8" fill="url(#oilGrad)" filter="url(#glow3d)" />
      {/* Cap & neck */}
      <rect x="83" y="38" width="10" height="10" rx="3" fill="#C2185B" />
      <rect x="85" y="44" width="6" height="5" fill="#AD1457" />
      {/* Oil highlight */}
      <path d="M78 56 L78 92" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <ellipse cx="88" cy="74" rx="7" ry="9" fill="#FFFDE7" opacity="0.85" />
      <path d="M88 68 C84 72, 84 77, 88 80 C92 77, 92 72, 88 68 Z" fill="#F57F17" />
    </svg>
  )
}

function Pickup3DIcon() {
  return (
    <svg viewBox="0 0 120 120" className="w-24 h-24 drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)]" fill="none">
      <defs>
        <linearGradient id="shopBag" x1="25" y1="35" x2="85" y2="105" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF8A65" />
          <stop offset="0.5" stopColor="#FF7043" />
          <stop offset="1" stopColor="#D84315" />
        </linearGradient>
        <linearGradient id="clockGrad" x1="60" y1="50" x2="105" y2="95" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#ECEFF1" />
        </linearGradient>
      </defs>
      {/* 3D Shopping Bag */}
      <rect x="22" y="42" width="60" height="60" rx="14" fill="url(#shopBag)" />
      {/* Bag Handles */}
      <path d="M38 42 V28 C38 18, 66 18, 66 28 V42" stroke="#FFCCBC" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* Bag sheen */}
      <path d="M28 50 L28 92" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      {/* Bag Emblem */}
      <circle cx="52" cy="72" r="12" fill="#FFFFFF" opacity="0.25" />
      <path d="M46 72 L50 76 L58 68" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {/* 3D Express Clock Badge */}
      <circle cx="82" cy="76" r="24" fill="url(#clockGrad)" stroke="#FF6B35" strokeWidth="4" />
      <circle cx="82" cy="76" r="20" fill="#FFF3E0" />
      <path d="M82 64 V76 L90 80" stroke="#E85521" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="82" cy="76" r="3" fill="#2B1810" />
      {/* Lightning Speed bolt */}
      <path d="M96 50 L88 62 H94 L86 74 L98 60 H92 Z" fill="#FFD600" stroke="#FF6F00" strokeWidth="1" />
    </svg>
  )
}

function Snack3DIcon() {
  return (
    <svg viewBox="0 0 120 120" className="w-24 h-24 drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]" fill="none">
      <defs>
        <linearGradient id="canGrad" x1="25" y1="35" x2="60" y2="105" gradientUnits="userSpaceOnUse">
          <stop stopColor="#29B6F6" />
          <stop offset="0.4" stopColor="#0288D1" />
          <stop offset="1" stopColor="#01579B" />
        </linearGradient>
        <linearGradient id="snackBag" x1="50" y1="30" x2="100" y2="105" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFCA28" />
          <stop offset="0.6" stopColor="#FFA000" />
          <stop offset="1" stopColor="#E65100" />
        </linearGradient>
      </defs>
      {/* 3D Cold Drink Can */}
      <rect x="22" y="44" width="34" height="60" rx="10" fill="url(#canGrad)" />
      <ellipse cx="39" cy="44" rx="17" ry="5" fill="#E1F5FE" />
      <ellipse cx="39" cy="104" rx="17" ry="5" fill="#01579B" />
      <rect x="34" y="39" width="10" height="5" rx="2" fill="#B0BEC5" />
      {/* Can highlight */}
      <rect x="26" y="48" width="4" height="52" rx="2" fill="#FFFFFF" opacity="0.5" />

      {/* 3D Snack Chip Pack */}
      <path
        d="M58 35 L96 40 L90 102 L52 97 Z"
        fill="url(#snackBag)"
      />
      {/* Zigzag edges */}
      <path d="M58 35 L61 38 L65 35 L69 38 L73 35 L77 38 L81 35 L85 38 L89 35 L93 38 L96 40" stroke="#FFE082" strokeWidth="2" />
      <path d="M52 97 L56 100 L60 97 L64 100 L68 97 L72 100 L76 97 L80 100 L84 97 L88 100 L90 102" stroke="#FFE082" strokeWidth="2" />
      {/* Snack sheen */}
      <path d="M62 45 L58 90" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      {/* Golden cookie in front */}
      <circle cx="86" cy="86" r="14" fill="#D7CCC8" stroke="#8D6E63" strokeWidth="2" />
      <circle cx="86" cy="86" r="12" fill="#FFB74D" />
      {/* Choco chips */}
      <circle cx="82" cy="82" r="2" fill="#4E342E" />
      <circle cx="90" cy="83" r="2.5" fill="#4E342E" />
      <circle cx="84" cy="89" r="2" fill="#4E342E" />
      <circle cx="89" cy="90" r="1.5" fill="#4E342E" />
    </svg>
  )
}

const banners = [
  {
    id: 1,
    badge: 'PROMO SPESIAL',
    title: 'Diskon Sembako Hemat',
    subtitle: 'Beras, Minyak Goreng & Gula diskon s/d 15%',
    IconComponent: Sembako3DIcon,
    backgroundStyle: 'linear-gradient(135deg, #FF6B35 0%, #E85521 100%)',
    boxShadow: '0 10px 25px -5px rgba(232,85,33,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
    link: '/kategori?kategori=sembako',
    cta: 'Belanja Sembako',
    tag: 'Stok Terbatas',
  },
  {
    id: 2,
    badge: 'PRAKTIS & CEPAT',
    title: 'Pesan & Ambil di Toko',
    subtitle: 'Siap dalam 15 menit, bayar tunai (COD) di kasir',
    IconComponent: Pickup3DIcon,
    backgroundStyle: 'linear-gradient(145deg, #2B1810 0%, #452419 100%)',
    boxShadow: '0 10px 25px -5px rgba(43,24,16,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
    link: '/kategori',
    cta: 'Pesan Sekarang',
    tag: 'Bebas Antre',
  },
  {
    id: 3,
    badge: 'KESEGARAN TIAP HARI',
    title: 'Minuman & Snack Segar',
    subtitle: 'Pilihan lengkap untuk menemani santai dan kerja',
    IconComponent: Snack3DIcon,
    backgroundStyle: 'linear-gradient(135deg, #FF7E47 0%, #D84315 100%)',
    boxShadow: '0 10px 25px -5px rgba(216,67,21,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
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
        {banners.map((b) => {
          const IconComp = b.IconComponent
          return (
            <div
              key={b.id}
              className="w-full shrink-0 text-white p-5 rounded-[20px] flex flex-col justify-between relative min-h-[148px]"
              style={{
                background: b.backgroundStyle,
                boxShadow: b.boxShadow,
              }}
            >
              <div className="relative z-10 pr-20">
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

              {/* Realistic 3D Icon Graphic */}
              <div className="absolute right-2 bottom-2 pointer-events-none transition-transform group-hover:scale-105 duration-300">
                <IconComp />
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

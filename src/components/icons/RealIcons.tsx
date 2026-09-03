// @ts-nocheck
import React from 'react'

/**
 * High-fidelity 3D Realistic Icons with specular highlights, radial depth,
 * multi-stop gradients, and ambient shadows.
 */

// 1. Sembako (Kantung Beras 3D + Minyak Goreng Emas)
export function SembakoRealIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <defs>
        <radialGradient id="riceBag" cx="35%" cy="30%" r="70%">
          <stop stopColor="#FFF8E1" />
          <stop offset="0.45" stopColor="#FFE082" />
          <stop offset="0.85" stopColor="#FFB300" />
          <stop offset="1" stopColor="#E65100" />
        </radialGradient>
        <linearGradient id="oilGold" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FFF59D" />
          <stop offset="0.5" stopColor="#FBC02D" />
          <stop offset="1" stopColor="#E65100" />
        </linearGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="32" cy="56" rx="22" ry="5" fill="#2B1810" opacity="0.16" />
      {/* Rice Sack Body */}
      <path
        d="M14 26 C14 20, 20 18, 30 18 C40 18, 46 20, 46 26 C46 38, 48 50, 42 54 C36 57, 24 57, 18 54 C12 50, 14 38, 14 26 Z"
        fill="url(#riceBag)"
      />
      {/* Tied Top */}
      <path d="M20 18 C17 12, 23 10, 30 11 C37 10, 43 12, 40 18 Z" fill="#FFF9C4" />
      <rect x="22" y="17" width="16" height="3" rx="1.5" fill="#D84315" />
      {/* Wheat Stalk */}
      <path d="M24 33 Q30 38 36 33 M24 38 Q30 43 36 38 M30 28 V46" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      {/* Cooking Oil Bottle */}
      <rect x="40" y="24" width="16" height="30" rx="5" fill="url(#oilGold)" />
      <rect x="45" y="19" width="6" height="6" rx="2" fill="#E53935" />
      <rect x="42" y="27" width="2.5" height="22" rx="1" fill="#FFFFFF" opacity="0.6" />
      <circle cx="48" cy="38" r="4" fill="#FFFFFF" opacity="0.8" />
    </svg>
  )
}

// 2. Minuman (Kaleng Soda Segar & Es Krim Minuman 3D)
export function MinumanRealIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <defs>
        <linearGradient id="sodaCan" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#4FC3F7" />
          <stop offset="0.4" stopColor="#0288D1" />
          <stop offset="1" stopColor="#01579B" />
        </linearGradient>
        <radialGradient id="bobaCup" cx="30%" cy="30%" r="70%">
          <stop stopColor="#FFCCBC" />
          <stop offset="0.6" stopColor="#FF7043" />
          <stop offset="1" stopColor="#BF360C" />
        </radialGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="32" cy="56" rx="20" ry="5" fill="#2B1810" opacity="0.16" />
      {/* Soda Can */}
      <rect x="12" y="22" width="20" height="32" rx="6" fill="url(#sodaCan)" />
      <ellipse cx="22" cy="22" rx="10" ry="3.5" fill="#E1F5FE" />
      <rect x="14" y="25" width="2" height="25" rx="1" fill="#FFFFFF" opacity="0.5" />
      <rect x="19" y="19" width="6" height="3" rx="1.5" fill="#90A4AE" />

      {/* Fresh Drink Cup with Straw */}
      <path d="M30 20 L33 52 C33 55, 49 55, 49 52 L52 20 Z" fill="url(#bobaCup)" />
      <ellipse cx="41" cy="20" rx="11" ry="3" fill="#FFFFFF" opacity="0.8" />
      {/* Straw */}
      <path d="M42 22 L45 8" stroke="#FFEB3B" strokeWidth="3" strokeLinecap="round" />
      {/* Cup reflection */}
      <path d="M34 24 L36 48" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      {/* Boba pearls */}
      <circle cx="38" cy="46" r="2.5" fill="#3E2723" />
      <circle cx="44" cy="47" r="2.5" fill="#3E2723" />
      <circle cx="41" cy="40" r="2.5" fill="#3E2723" />
    </svg>
  )
}

// 3. Snack (Keripik Kentang & Biskuit Coklat 3D)
export function SnackRealIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <defs>
        <linearGradient id="chipPack" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FFD54F" />
          <stop offset="0.5" stopColor="#FF9800" />
          <stop offset="1" stopColor="#E65100" />
        </linearGradient>
        <radialGradient id="cookieFace" cx="35%" cy="35%" r="65%">
          <stop stopColor="#FFE0B2" />
          <stop offset="0.6" stopColor="#FFB74D" />
          <stop offset="1" stopColor="#8D6E63" />
        </radialGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="32" cy="56" rx="22" ry="5" fill="#2B1810" opacity="0.16" />
      {/* Chip Bag */}
      <path d="M14 16 L42 20 L38 52 L10 48 Z" fill="url(#chipPack)" />
      <path d="M14 16 L42 20" stroke="#FFE082" strokeWidth="2" strokeDasharray="3 2" />
      <path d="M10 48 L38 52" stroke="#FFE082" strokeWidth="2" strokeDasharray="3 2" />
      <rect x="18" y="24" width="3" height="20" rx="1.5" fill="#FFFFFF" opacity="0.4" />

      {/* 3D Crispy Cookie in foreground */}
      <circle cx="42" cy="42" r="14" fill="url(#cookieFace)" />
      <circle cx="42" cy="42" r="13" stroke="#5D4037" strokeWidth="1" strokeDasharray="2 2" />
      {/* Choco chips */}
      <circle cx="37" cy="38" r="2.5" fill="#3E2723" />
      <circle cx="46" cy="37" r="2.8" fill="#3E2723" />
      <circle cx="41" cy="46" r="2.2" fill="#3E2723" />
      <circle cx="47" cy="46" r="2.5" fill="#3E2723" />
    </svg>
  )
}

// 4. Kebersihan (Botol Spray Pembersih & Busa Sabun 3D)
export function KebersihanRealIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <defs>
        <linearGradient id="sprayBody" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#80DEEA" />
          <stop offset="0.5" stopColor="#00ACC1" />
          <stop offset="1" stopColor="#006064" />
        </linearGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="32" cy="56" rx="20" ry="5" fill="#2B1810" opacity="0.16" />
      {/* Spray Bottle */}
      <path d="M22 28 C22 24, 26 22, 34 22 C42 22, 46 24, 46 28 L48 52 C48 55, 20 55, 20 52 Z" fill="url(#sprayBody)" />
      {/* Spray Neck & Trigger */}
      <rect x="30" y="16" width="8" height="7" fill="#FFFFFF" />
      <path d="M26 12 H42 L40 18 H26 Z" fill="#FF7043" />
      <path d="M26 14 L20 18 L24 22 L28 17" fill="#FF5722" />
      {/* Bottle sheen */}
      <path d="M24 28 L23 50" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      {/* Soap Bubbles */}
      <circle cx="48" cy="24" r="5" fill="#E0F7FA" stroke="#80DEEA" strokeWidth="1.5" opacity="0.9" />
      <circle cx="53" cy="34" r="4" fill="#E0F7FA" stroke="#80DEEA" strokeWidth="1.2" opacity="0.8" />
      <circle cx="45" cy="14" r="3" fill="#E0F7FA" stroke="#80DEEA" strokeWidth="1" opacity="0.85" />
    </svg>
  )
}

// 5. Perawatan (Botol Pump Lotion Skincare Estetik 3D)
export function PerawatanRealIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <defs>
        <linearGradient id="lotionGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#F8BBD0" />
          <stop offset="0.5" stopColor="#EC407A" />
          <stop offset="1" stopColor="#AD1457" />
        </linearGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="32" cy="56" rx="18" ry="5" fill="#2B1810" opacity="0.16" />
      {/* Lotion Bottle */}
      <rect x="20" y="24" width="24" height="30" rx="8" fill="url(#lotionGrad)" />
      {/* Pump Neck */}
      <rect x="29" y="18" width="6" height="6" fill="#CFD8DC" />
      <path d="M24 15 H40 L38 18 H26 Z" fill="#ECEFF1" />
      <path d="M24 15 L20 18" stroke="#ECEFF1" strokeWidth="2" strokeLinecap="round" />
      {/* Gold Ring */}
      <rect x="28" y="23" width="8" height="2" rx="1" fill="#FFD700" />
      {/* Highlight */}
      <rect x="23" y="28" width="2.5" height="22" rx="1" fill="#FFFFFF" opacity="0.5" />
      {/* Lotus / Sparkle emblem */}
      <circle cx="32" cy="38" r="4" fill="#FFFFFF" opacity="0.8" />
      <path d="M32 32 V44 M26 38 H38" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

// 6. Lainnya (Kotak Paket Belanja 3D dengan Pita)
export function LainnyaRealIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <defs>
        <linearGradient id="boxTop" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FFCC80" />
          <stop offset="1" stopColor="#FFA726" />
        </linearGradient>
        <linearGradient id="boxLeft" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FB8C00" />
          <stop offset="1" stopColor="#E65100" />
        </linearGradient>
        <linearGradient id="boxRight" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#F57C00" />
          <stop offset="1" stopColor="#BF360C" />
        </linearGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="32" cy="56" rx="22" ry="5" fill="#2B1810" opacity="0.16" />
      {/* Isometric 3D Box Top */}
      <polygon points="32,16 52,25 32,34 12,25" fill="url(#boxTop)" />
      {/* Left Face */}
      <polygon points="12,25 32,34 32,54 12,45" fill="url(#boxLeft)" />
      {/* Right Face */}
      <polygon points="32,34 52,25 52,45 32,54" fill="url(#boxRight)" />
      {/* Tape & Ribbon */}
      <polygon points="30,17 34,19 34,35 30,33" fill="#FFE082" />
      <polygon points="20,21 24,23 44,14 40,12" fill="#FFE082" />
      {/* Parcel Label */}
      <polygon points="36,36 46,31 46,39 36,44" fill="#FFFFFF" opacity="0.9" />
      <line x1="38" y1="36" x2="44" y2="33" stroke="#2B1810" strokeWidth="1" />
      <line x1="38" y1="39" x2="44" y2="36" stroke="#2B1810" strokeWidth="1" />
    </svg>
  )
}

// Map helper
export const REAL_CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  sembako: SembakoRealIcon,
  minuman: MinumanRealIcon,
  snack: SnackRealIcon,
  kebersihan: KebersihanRealIcon,
  perawatan: PerawatanRealIcon,
  lainnya: LainnyaRealIcon,
}

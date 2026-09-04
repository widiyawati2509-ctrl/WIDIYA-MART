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

// 6. Skincare (Botol Pipet Serum Glowing 3D)
export function SkincareRealIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <defs>
        <radialGradient id="serumBottle" cx="35%" cy="35%" r="70%">
          <stop stopColor="#FCE4EC" />
          <stop offset="0.4" stopColor="#F48FB1" />
          <stop offset="0.8" stopColor="#EC407A" />
          <stop offset="1" stopColor="#AD1457" />
        </radialGradient>
        <linearGradient id="dropperCap" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FFE082" />
          <stop offset="0.6" stopColor="#FFB300" />
          <stop offset="1" stopColor="#FF8F00" />
        </linearGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="32" cy="56" rx="18" ry="5" fill="#2B1810" opacity="0.16" />
      {/* Dropper Pipette Top Rubber */}
      <path d="M28 14 C28 10, 36 10, 36 14 L36 18 H28 Z" fill="#FFFFFF" />
      {/* Rose Gold Collar */}
      <rect x="25" y="18" width="14" height="6" rx="2" fill="url(#dropperCap)" />
      {/* Glass Bottle Body */}
      <rect x="20" y="24" width="24" height="30" rx="8" fill="url(#serumBottle)" />
      {/* Glossy Sheen */}
      <path d="M24 28 L24 50" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      {/* Glass Glow Drop */}
      <circle cx="48" cy="20" r="4.5" fill="#F8BBD0" stroke="#FFFFFF" strokeWidth="1.5" />
      <path d="M48 13 L45 19 H51 Z" fill="#F8BBD0" />
      <circle cx="47" cy="18" r="1.5" fill="#FFFFFF" />
      {/* Sparkle */}
      <path d="M40 38 L42 42 L46 44 L42 46 L40 50 L38 46 L34 44 L38 42 Z" fill="#FFFFFF" opacity="0.9" />
    </svg>
  )
}

// 7. Peralatan Dapur (Panci Memasak 3D + Spatula)
export function PeralatanDapurRealIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <defs>
        <linearGradient id="potGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FF8A65" />
          <stop offset="0.5" stopColor="#E64A19" />
          <stop offset="1" stopColor="#BF360C" />
        </linearGradient>
        <linearGradient id="spatulaGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FFE082" />
          <stop offset="1" stopColor="#FFA000" />
        </linearGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="32" cy="56" rx="22" ry="5" fill="#2B1810" opacity="0.16" />
      {/* Cooking Pot Base */}
      <path d="M12 28 C12 28, 14 52, 32 52 C50 52, 52 28, 52 28 Z" fill="url(#potGrad)" />
      {/* Pot Rim */}
      <ellipse cx="32" cy="28" rx="20" ry="5" fill="#FFAB91" />
      <ellipse cx="32" cy="28" rx="18" ry="4" fill="#D84315" />
      {/* Handles */}
      <path d="M8 29 C5 29, 5 35, 12 36" stroke="#BF360C" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M56 29 C59 29, 59 35, 52 36" stroke="#BF360C" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Pot highlight sheen */}
      <path d="M18 34 C20 46, 26 50, 32 50" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      {/* Wooden Spatula tilted */}
      <path d="M42 10 L48 14 L36 32 L32 29 Z" fill="url(#spatulaGrad)" />
      <rect x="42" y="9" width="10" height="7" rx="2" transform="rotate(35 42 9)" fill="#FFB74D" />
      {/* Delicious steam vapors */}
      <path d="M26 22 Q24 16 28 12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M33 20 Q36 14 32 10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

// 8. Peralatan Mandi (Dispenser Sabun & Spons Busa 3D)
export function PeralatanMandiRealIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <defs>
        <linearGradient id="bathGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#4DD0E1" />
          <stop offset="0.5" stopColor="#00ACC1" />
          <stop offset="1" stopColor="#006064" />
        </linearGradient>
        <radialGradient id="bathPuff" cx="35%" cy="35%" r="65%">
          <stop stopColor="#E1F5FE" />
          <stop offset="0.6" stopColor="#81D4FA" />
          <stop offset="1" stopColor="#0288D1" />
        </radialGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="32" cy="56" rx="20" ry="5" fill="#2B1810" opacity="0.16" />
      {/* Dispenser Body */}
      <rect x="14" y="24" width="22" height="30" rx="7" fill="url(#bathGrad)" />
      {/* Pump Cap */}
      <rect x="22" y="19" width="6" height="5" fill="#CFD8DC" />
      <path d="M18 16 H30 L28 19 H20 Z" fill="#ECEFF1" />
      <path d="M18 16 L14 18" stroke="#ECEFF1" strokeWidth="2.5" strokeLinecap="round" />
      {/* Dispenser Sheen */}
      <rect x="17" y="28" width="2" height="22" rx="1" fill="#FFFFFF" opacity="0.5" />
      {/* Fluffy Bath Sponge / Loofah in front */}
      <circle cx="44" cy="42" r="13" fill="url(#bathPuff)" />
      <circle cx="44" cy="42" r="10" fill="#B3E5FC" opacity="0.7" />
      {/* Floating Bubbles */}
      <circle cx="46" cy="22" r="5" fill="#E0F7FA" stroke="#4DD0E1" strokeWidth="1.5" />
      <circle cx="53" cy="30" r="3.5" fill="#E0F7FA" stroke="#4DD0E1" strokeWidth="1" />
      <circle cx="39" cy="16" r="2.5" fill="#E0F7FA" stroke="#4DD0E1" strokeWidth="1" />
    </svg>
  )
}

// 9. Peralatan Bayi (Botol Susu Bayi Lucu 3D)
export function PeralatanBayiRealIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <defs>
        <linearGradient id="bottleGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FFF9C4" />
          <stop offset="0.4" stopColor="#FFF176" />
          <stop offset="0.8" stopColor="#FFD54F" />
          <stop offset="1" stopColor="#FFB300" />
        </linearGradient>
        <linearGradient id="nippleGrad" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FFE0B2" />
          <stop offset="1" stopColor="#FFB74D" />
        </linearGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="32" cy="56" rx="18" ry="5" fill="#2B1810" opacity="0.16" />
      {/* Soft Silicone Nipple */}
      <path d="M28 17 C28 11, 36 11, 36 17 Z" fill="url(#nippleGrad)" />
      <rect x="29" y="16" width="6" height="2" rx="1" fill="#FFA726" />
      {/* Ring Cap */}
      <rect x="22" y="18" width="20" height="6" rx="3" fill="#81D4FA" />
      {/* Baby Milk Bottle Body */}
      <rect x="20" y="24" width="24" height="30" rx="8" fill="#FFFFFF" stroke="#E1F5FE" strokeWidth="1" />
      {/* Milk Content inside */}
      <path d="M21 34 C21 34, 26 36, 32 36 C38 36, 43 34, 43 34 L43 46 C43 50, 40 53, 36 53 L28 53 C24 53, 21 50, 21 46 Z" fill="url(#bottleGrad)" />
      {/* Measurement lines */}
      <line x1="24" y1="36" x2="28" y2="36" stroke="#90CAF9" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="41" x2="28" y2="41" stroke="#90CAF9" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="46" x2="28" y2="46" stroke="#90CAF9" strokeWidth="1.5" strokeLinecap="round" />
      {/* Little Cute Heart */}
      <path d="M34 43 C33 41, 31 42, 31 43.5 C31 45, 34 47, 34 47 C34 47, 37 45, 37 43.5 C37 42, 35 41, 34 43 Z" fill="#F06292" />
      {/* Bottle shine */}
      <rect x="22" y="26" width="2" height="24" rx="1" fill="#FFFFFF" opacity="0.8" />
    </svg>
  )
}

// 10. Aksesoris (Jepit Pita Rambut Cantik 3D)
export function AksesorisRealIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <defs>
        <radialGradient id="ribbonGrad" cx="40%" cy="30%" r="70%">
          <stop stopColor="#FF8A80" />
          <stop offset="0.5" stopColor="#FF5252" />
          <stop offset="1" stopColor="#D50000" />
        </radialGradient>
        <radialGradient id="pearlCenter" cx="35%" cy="35%" r="65%">
          <stop stopColor="#FFFFFF" />
          <stop offset="0.6" stopColor="#FFF9C4" />
          <stop offset="1" stopColor="#FFD54F" />
        </radialGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="32" cy="54" rx="22" ry="5" fill="#2B1810" opacity="0.16" />
      {/* Left Bow Loop */}
      <path d="M32 30 C20 18, 10 24, 12 36 C14 46, 26 38, 32 34 Z" fill="url(#ribbonGrad)" />
      <path d="M16 26 C14 32, 20 36, 26 33" stroke="#FFCDD2" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      {/* Right Bow Loop */}
      <path d="M32 30 C44 18, 54 24, 52 36 C50 46, 38 38, 32 34 Z" fill="url(#ribbonGrad)" />
      <path d="M48 26 C50 32, 44 36, 38 33" stroke="#FFCDD2" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      {/* Ribbon Tails */}
      <path d="M29 34 L18 52 L26 50 L31 36 Z" fill="#D50000" />
      <path d="M35 34 L46 52 L38 50 L33 36 Z" fill="#D50000" />
      {/* Center Sparkling Pearl Knot */}
      <circle cx="32" cy="32" r="7" fill="url(#pearlCenter)" />
      <circle cx="30" cy="30" r="2" fill="#FFFFFF" />
      {/* Glistening Stars */}
      <path d="M50 16 L51.5 20 L55.5 21.5 L51.5 23 L50 27 L48.5 23 L44.5 21.5 L48.5 20 Z" fill="#FFD700" />
      <circle cx="14" cy="18" r="1.5" fill="#FFD700" />
    </svg>
  )
}

// 11. Dekorasi (Pot Tanaman Hias Estetik 3D)
export function DekorasiRealIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <defs>
        <linearGradient id="potClay" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FFAB91" />
          <stop offset="0.6" stopColor="#FF7043" />
          <stop offset="1" stopColor="#D84315" />
        </linearGradient>
        <radialGradient id="leafGreen" cx="35%" cy="30%" r="70%">
          <stop stopColor="#A5D6A7" />
          <stop offset="0.5" stopColor="#66BB6A" />
          <stop offset="1" stopColor="#2E7D32" />
        </radialGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="32" cy="56" rx="18" ry="5" fill="#2B1810" opacity="0.16" />
      {/* Plant Pot */}
      <polygon points="20,36 44,36 41,54 23,54" fill="url(#potClay)" />
      <ellipse cx="32" cy="36" rx="12" ry="3.5" fill="#FFCCBC" />
      {/* Pot Sheen */}
      <path d="M24 38 L25 52" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      {/* Lush Green Succulent / Plant Leaves */}
      <path d="M32 36 C32 20, 24 12, 18 16 C16 26, 26 34, 32 36 Z" fill="url(#leafGreen)" />
      <path d="M32 36 C32 20, 40 12, 46 16 C48 26, 38 34, 32 36 Z" fill="url(#leafGreen)" />
      <path d="M32 36 C28 22, 32 10, 32 10 C32 10, 36 22, 32 36 Z" fill="#81C784" />
      {/* Little Blossom */}
      <circle cx="32" cy="18" r="3" fill="#F48FB1" />
      <circle cx="32" cy="18" r="1.5" fill="#FFF59D" />
    </svg>
  )
}

// 12. Lainnya (Tas Belanja Toko Hangat 3D)
export function LainnyaRealIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <defs>
        <linearGradient id="toteBag" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FFAB91" />
          <stop offset="0.5" stopColor="#FF7043" />
          <stop offset="1" stopColor="#E64A19" />
        </linearGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="32" cy="56" rx="20" ry="5" fill="#2B1810" opacity="0.16" />
      {/* Shopping Bag Body */}
      <path d="M16 24 L20 53 C20 55, 44 55, 44 53 L48 24 Z" fill="url(#toteBag)" />
      {/* Bag handles */}
      <path d="M25 24 V16 C25 10, 39 10, 39 16 V24" stroke="#FFE0B2" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Front emblem / smile */}
      <circle cx="32" cy="38" r="7" fill="#FFFFFF" opacity="0.25" />
      <path d="M28 37 Q32 42 36 37" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Bag sheen */}
      <path d="M20 28 L23 49" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      {/* Little items peeking out */}
      <circle cx="28" cy="22" r="3.5" fill="#81C784" />
      <rect x="33" y="19" width="5" height="6" rx="1.5" fill="#FFD54F" />
    </svg>
  )
}

// Comprehensive Category Icons Map covering all slugs and variations
export const REAL_CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  sembako: SembakoRealIcon,
  minuman: MinumanRealIcon,
  susu: MinumanRealIcon,
  snack: SnackRealIcon,
  camilan: SnackRealIcon,
  kebersihan: KebersihanRealIcon,
  pembersih: KebersihanRealIcon,
  perawatan: PerawatanRealIcon,
  skincare: SkincareRealIcon,
  'peralatan-dapur': PeralatanDapurRealIcon,
  dapur: PeralatanDapurRealIcon,
  'peralatan-mandi': PeralatanMandiRealIcon,
  'peraltan-mandi': PeralatanMandiRealIcon,
  mandi: PeralatanMandiRealIcon,
  'peralatan-bayi': PeralatanBayiRealIcon,
  bayi: PeralatanBayiRealIcon,
  aksesoris: AksesorisRealIcon,
  dekorasi: DekorasiRealIcon,
  lainnya: LainnyaRealIcon,
}


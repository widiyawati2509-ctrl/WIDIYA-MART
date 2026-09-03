// @ts-nocheck
import React from 'react'

export function Home3DIcon({ active = false, className = 'w-5 h-5' }: { active?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <defs>
        <linearGradient id="roofGrad" x1="4" y1="4" x2="28" y2="18">
          <stop stopColor={active ? '#FFFFFF' : '#FF8A65'} />
          <stop offset="1" stopColor={active ? '#FFD0B0' : '#E64A19'} />
        </linearGradient>
        <linearGradient id="wallGrad" x1="6" y1="14" x2="26" y2="28">
          <stop stopColor={active ? '#FFF3E0' : '#BCAAA4'} />
          <stop offset="1" stopColor={active ? '#FFCC80' : '#6D4C41'} />
        </linearGradient>
      </defs>
      {/* House Body */}
      <rect x="7" y="14" width="18" height="13" rx="3" fill="url(#wallGrad)" />
      {/* 3D Roof */}
      <path d="M16 3 L3 14 L6 16 L16 7 L26 16 L29 14 Z" fill="url(#roofGrad)" />
      {/* Chimney */}
      <rect x="22" y="6" width="3" height="6" rx="1" fill={active ? '#FFAB91' : '#D84315'} />
      {/* Door */}
      <rect x="13" y="18" width="6" height="9" rx="2" fill={active ? '#FF6B35' : '#3E2723'} />
      <circle cx="17.5" cy="22.5" r="0.7" fill="#FFFFFF" />
    </svg>
  )
}

export function Category3DIcon({ active = false, className = 'w-5 h-5' }: { active?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <defs>
        <linearGradient id="cubeTop" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={active ? '#FFFFFF' : '#FFB74D'} />
          <stop offset="1" stopColor={active ? '#FFD180' : '#FF9800'} />
        </linearGradient>
        <linearGradient id="cubeLeft" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={active ? '#FFAB91' : '#FF7043'} />
          <stop offset="1" stopColor={active ? '#FF7043' : '#D84315'} />
        </linearGradient>
        <linearGradient id="cubeRight" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={active ? '#80DEEA' : '#26C6DA'} />
          <stop offset="1" stopColor={active ? '#00ACC1' : '#00838F'} />
        </linearGradient>
      </defs>
      {/* 4 3D Cubes Grid */}
      <rect x="5" y="5" width="9" height="9" rx="2.5" fill="url(#cubeTop)" />
      <rect x="18" y="5" width="9" height="9" rx="2.5" fill="url(#cubeLeft)" />
      <rect x="5" y="18" width="9" height="9" rx="2.5" fill="url(#cubeRight)" />
      <rect x="18" y="18" width="9" height="9" rx="2.5" fill={active ? '#FFE082' : '#8D6E63'} />
      {/* Highlights */}
      <circle cx="9.5" cy="9.5" r="1.5" fill="#FFFFFF" opacity="0.6" />
      <circle cx="22.5" cy="9.5" r="1.5" fill="#FFFFFF" opacity="0.6" />
      <circle cx="9.5" cy="22.5" r="1.5" fill="#FFFFFF" opacity="0.6" />
      <circle cx="22.5" cy="22.5" r="1.5" fill="#FFFFFF" opacity="0.6" />
    </svg>
  )
}

export function Cart3DIcon({ active = false, className = 'w-5 h-5' }: { active?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <defs>
        <linearGradient id="cartBasket" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={active ? '#FFFFFF' : '#FF8A65'} />
          <stop offset="1" stopColor={active ? '#FFCCBC' : '#E64A19'} />
        </linearGradient>
      </defs>
      {/* Handle */}
      <path d="M4 6 H7 L10 20 H24 L27 9 H9" stroke={active ? '#FFFFFF' : '#D7CCC8'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Basket filling */}
      <path d="M10 10 H26 L23.5 18.5 H11.5 Z" fill="url(#cartBasket)" opacity={active ? 0.9 : 0.75} />
      {/* 3D Wheels */}
      <circle cx="12" cy="25" r="2.8" fill={active ? '#FFFFFF' : '#FF7043'} />
      <circle cx="12" cy="25" r="1.2" fill="#2B1810" />
      <circle cx="22" cy="25" r="2.8" fill={active ? '#FFFFFF' : '#FF7043'} />
      <circle cx="22" cy="25" r="1.2" fill="#2B1810" />
    </svg>
  )
}

export function Orders3DIcon({ active = false, className = 'w-5 h-5' }: { active?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <defs>
        <linearGradient id="orderBox" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={active ? '#FFFFFF' : '#FFB74D'} />
          <stop offset="1" stopColor={active ? '#FFE0B2' : '#F57C00'} />
        </linearGradient>
      </defs>
      {/* 3D Package */}
      <path d="M16 4 L28 10 L16 16 L4 10 Z" fill={active ? '#FFFFFF' : '#FFA726'} />
      <path d="M4 10 L16 16 V27 L4 21 Z" fill="url(#orderBox)" />
      <path d="M28 10 L16 16 V27 L28 21 Z" fill={active ? '#FFCC80' : '#E65100'} />
      {/* Tape */}
      <path d="M14 6 L18 8 L18 20 L14 18 Z" fill="#FFE082" opacity="0.8" />
    </svg>
  )
}

export function User3DIcon({ active = false, className = 'w-5 h-5' }: { active?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <defs>
        <radialGradient id="userHead" cx="35%" cy="30%" r="70%">
          <stop stopColor={active ? '#FFFFFF' : '#FFCCBC'} />
          <stop offset="0.6" stopColor={active ? '#FFD0B0' : '#FF8A65'} />
          <stop offset="1" stopColor={active ? '#FFAB91' : '#D84315'} />
        </radialGradient>
      </defs>
      {/* Head */}
      <circle cx="16" cy="11" r="5.5" fill="url(#userHead)" />
      {/* Shoulders */}
      <path d="M6 26 C6 20, 10 18, 16 18 C22 18, 26 20, 26 26 Z" fill={active ? '#FFFFFF' : '#A1887F'} />
      {/* Tie/Badge */}
      <path d="M16 18 L18 22 L16 26 L14 22 Z" fill={active ? '#FF6B35' : '#D84315'} />
    </svg>
  )
}

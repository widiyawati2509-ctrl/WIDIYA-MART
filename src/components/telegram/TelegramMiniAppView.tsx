// @ts-nocheck
'use client'

import React, { useState, useMemo, useTransition, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search,
  MessageCircle,
  CheckSquare,
  Square,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  Store,
  X,
  Check,
  Zap,
  TicketPercent,
  LayoutGrid,
  List,
} from 'lucide-react'
import { formatRupiah, isStoreOpen, formatWhatsAppUrl } from '@/lib/utils'
import { addToCart } from '@/lib/actions/cart'

interface TelegramMiniAppViewProps {
  categories: any[]
  products: any[]
  storeInfo: any
  promos: any[]
}

export function getCategoryIconEmoji(name: string = ''): string {
  const n = name.toLowerCase()
  if (n.includes('sembako') || n.includes('beras') || n.includes('gula') || n.includes('tepung') || n.includes('telur')) return '🌾'
  if (n.includes('minyak') || n.includes('bumbu') || n.includes('dapur') || n.includes('masak') || n.includes('kecap') || n.includes('garam')) return '🌻'
  if (n.includes('mie') || n.includes('instan') || n.includes('makanan') || n.includes('roti') || n.includes('sarden')) return '🍜'
  if (n.includes('minuman') || n.includes('susu') || n.includes('kopi') || n.includes('teh') || n.includes('air') || n.includes('segar')) return '🧃'
  if (n.includes('jajanan') || n.includes('snack') || n.includes('biskuit') || n.includes('cokelat') || n.includes('permen') || n.includes('cemilan')) return '🍪'
  if (n.includes('sabun') || n.includes('cuci') || n.includes('deterjen') || n.includes('pewangi') || n.includes('pembersih') || n.includes('rumah') || n.includes('tisu')) return '🧼'
  if (n.includes('mandi') || n.includes('shampoo') || n.includes('sampo') || n.includes('odol') || n.includes('gigi') || n.includes('skincare') || n.includes('wajah') || n.includes('kecantikan')) return '✨'
  if (n.includes('bayi') || n.includes('popok') || n.includes('anak') || n.includes('telon')) return '🍼'
  if (n.includes('alat tulis') || n.includes('atk') || n.includes('pulpen') || n.includes('buku') || n.includes('pensil') || n.includes('sekolah') || n.includes('kertas')) return '✏️'
  if (n.includes('obat') || n.includes('kesehatan') || n.includes('vitamin') || n.includes('herbal')) return '💊'
  return '📦'
}

export function TelegramMiniAppView({
  categories = [],
  products = [],
  storeInfo = null,
  promos = [],
}: TelegramMiniAppViewProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'katalog' | 'checklist' | 'promo'>('katalog')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({})
  const [isHydrated, setIsHydrated] = useState(false)
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<string | null>(null)

  // kemiljk/design-for-repetition: Hydrate & persist shopper progress (checklist, quick-cart, view mode) across refreshes & WhatsApp switches
  useEffect(() => {
    try {
      const saved = localStorage.getItem('widiya_store_state_v1')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.viewMode === 'grid' || parsed.viewMode === 'list') {
          setViewMode(parsed.viewMode)
        }
        if (Array.isArray(parsed.checkedIds)) {
          setCheckedIds(new Set(parsed.checkedIds))
        }
        if (parsed.cartQuantities && typeof parsed.cartQuantities === 'object') {
          setCartQuantities(parsed.cartQuantities)
        }
      }
    } catch {
      // ignore storage errors safely
    } finally {
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(
        'widiya_store_state_v1',
        JSON.stringify({
          viewMode,
          checkedIds: Array.from(checkedIds),
          cartQuantities,
        })
      )
    } catch {
      // ignore storage quota errors safely
    }
  }, [isHydrated, viewMode, checkedIds, cartQuantities])

  // Status Buka/Tutup Toko (WITA)
  const storeStatus = useMemo(() => {
    return isStoreOpen(
      storeInfo?.jam_buka,
      storeInfo?.jam_tutup,
      storeInfo?.jam_operasional || '07.00 - 21.00'
    )
  }, [storeInfo])

  // Nomor WA Admin
  const adminWa = storeInfo?.no_telepon || '087765432100'

  // Filter produk berdasarkan kategori dan pencarian
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchSearch =
        !searchQuery.trim() ||
        prod.nama.toLowerCase().includes(searchQuery.toLowerCase().trim())
      const matchCat =
        selectedCategory === 'all' ||
        prod.category_id === selectedCategory ||
        prod.categories?.slug === selectedCategory
      return matchSearch && matchCat
    })
  }, [products, searchQuery, selectedCategory])

  // Active category metadata for header
  const activeCategoryMeta = useMemo(() => {
    if (selectedCategory === 'all') {
      return { nama: 'Semua Produk', icon: '🏪' }
    }
    const found = categories.find(
      (c) => c.id === selectedCategory || c.slug === selectedCategory
    )
    return {
      nama: found?.nama || 'Kategori Pilihan',
      icon: getCategoryIconEmoji(found?.nama || ''),
    }
  }, [selectedCategory, categories])

  // Hitung total dari item checklist
  const checklistSummary = useMemo(() => {
    const selectedProds = products.filter((p) => checkedIds.has(p.id))
    const total = selectedProds.reduce((sum, p) => sum + (p.harga || 0), 0)
    return {
      count: selectedProds.length,
      total,
      items: selectedProds,
    }
  }, [products, checkedIds])

  // Total lokal item yang ditambah lewat stepper
  const totalLocalCart = useMemo(() => {
    let count = 0
    let total = 0
    for (const [id, qty] of Object.entries(cartQuantities)) {
      if (qty > 0) {
        const prod = products.find((p) => p.id === id)
        if (prod) {
          count += qty
          total += (prod.harga || 0) * qty
        }
      }
    }
    return { count, total }
  }, [cartQuantities, products])

  // Apple Design §13: Causal & harmonious haptic pulse on meaningful interactions
  const triggerHaptic = (ms = 8) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms)
      } catch {}
    }
  }

  // Handler Checklist Toggle
  const toggleCheck = (id: string) => {
    triggerHaptic(8)
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Handler Stepper Kuantitas
  const updateQty = (productId: string, delta: number) => {
    triggerHaptic(10)
    const current = cartQuantities[productId] || 0
    const next = Math.max(0, current + delta)

    setCartQuantities((prev) => ({
      ...prev,
      [productId]: next,
    }))

    // Kirim sinkronisasi ke server action di background
    startTransition(async () => {
      if (delta > 0) {
        await addToCart(productId, 1)
        showToast('Item berhasil dimasukkan ke keranjang')
      }
    })
  }

  // Masukkan semua item checklist ke keranjang
  const handleAddAllChecklist = () => {
    if (checklistSummary.count === 0) return
    triggerHaptic(12)

    startTransition(async () => {
      for (const prod of checklistSummary.items) {
        await addToCart(prod.id, 1)
      }
      showToast(`${checklistSummary.count} item dimasukkan ke keranjang!`)
      router.push('/keranjang')
    })
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const activeTabIndex = activeTab === 'katalog' ? 0 : activeTab === 'checklist' ? 1 : 2

  return (
    <div className="min-h-dvh bg-[var(--paper)] text-[var(--ink)] pb-32">
      {/* 1. HEADER KHAS TOKO WIDIYA MART (WARM CORAL BRANDING + APPLE TRANSLUCENT CHROME) */}
      <header className="sticky top-0 z-40 apple-material-header px-3.5 pt-2.5 pb-2.5">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Logo Asli Widiya Mart */}
            <div className="relative size-9 rounded-2xl overflow-hidden shadow-xs shrink-0 border border-[var(--line)] bg-white">
              <Image
                src={storeInfo?.logo_url || '/logo.png'}
                alt={storeInfo?.nama_toko || 'Widiya Mart'}
                fill
                className="object-cover"
                sizes="36px"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-sora font-extrabold text-sm truncate text-[var(--ink)]">
                  {storeInfo?.nama_toko || 'WIDIYA MART'}
                </h1>
                <span
                  aria-label="Toko Terverifikasi"
                  className="inline-flex items-center justify-center size-4 rounded-full bg-[var(--accent)] text-white text-[9px] font-bold"
                >
                  ✓
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--ink-soft)]">
                <span
                  aria-hidden="true"
                  className={`size-2 rounded-full ${storeStatus.isOpen ? 'bg-emerald-600' : 'bg-rose-600'}`}
                />
                <span className="font-medium tabular-nums">
                  {storeStatus.isOpen ? `Buka s/d ${storeStatus.jamTutupFormatted}` : 'Tutup Sementara'}
                </span>
                <span aria-hidden="true">•</span>
                <span className="truncate">Pengenjek</span>
              </div>
            </div>
          </div>

          {/* Tombol Chat Kasir WhatsApp */}
          <a
            href={formatWhatsAppUrl(adminWa, 'Halo Admin Widiya Mart, saya mau tanya ketersediaan stok')}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat Kasir via WhatsApp"
            className="press flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--accent-bg)] text-[var(--accent-2)] hover:bg-[var(--accent)] hover:text-white transition-colors text-xs font-bold shrink-0 shadow-card-sm"
          >
            <MessageCircle size={14} aria-hidden="true" />
            <span className="hidden xs:inline">Chat Kasir</span>
          </a>
        </div>

        {/* Input Pencarian Cepat Terintegrasi (jakubkrehel/better-typography: text-[16px] sm:text-xs prevents iOS Safari auto-zoom) */}
        <div className="mt-2 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[var(--ink-soft)]">
            <Search size={15} aria-hidden="true" />
          </div>
          <input
            type="search"
            aria-label="Cari produk di katalog"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari beras, minyak, sabun, alat tulis..."
            className="w-full pl-9 pr-8 py-2 bg-white border border-[var(--line)] focus:border-[var(--accent)] rounded-xl text-[16px] sm:text-xs font-medium text-[var(--ink)] placeholder-[var(--ink-soft)]/60 outline-none shadow-input transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Bersihkan pencarian"
              onClick={() => setSearchQuery('')}
              className="press hit-area-expand absolute inset-y-0 right-2.5 flex items-center text-[var(--ink-soft)] hover:text-[var(--ink)]"
            >
              <X size={15} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* 2. APPLE-STYLE SLIDING SEGMENTED CONTROL */}
        <div className="mt-2">
          <div
            role="tablist"
            aria-label="Pilih mode tampilan toko"
            className="relative bg-[rgba(232,214,205,0.65)] p-1 rounded-2xl grid grid-cols-3 items-center shadow-inner"
          >
            {/* Sliding Active Pill Indicator */}
            <div
              aria-hidden="true"
              className="absolute top-1 bottom-1 left-1 w-[calc((100%-8px)/3)] rounded-xl bg-white shadow-xs pointer-events-none"
              style={{
                transform: `translateX(${activeTabIndex * 100}%)`,
                transition: 'transform 280ms var(--ease-spring)',
              }}
            />

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'katalog'}
              onClick={() => {
                triggerHaptic(6)
                setActiveTab('katalog')
              }}
              className={`relative z-10 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 press ${
                activeTab === 'katalog'
                  ? 'text-[var(--accent-2)]'
                  : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              <Zap size={13} aria-hidden="true" className={activeTab === 'katalog' ? 'text-[var(--accent)]' : ''} />
              <span>Katalog</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'checklist'}
              onClick={() => {
                triggerHaptic(6)
                setActiveTab('checklist')
              }}
              className={`relative z-10 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 press ${
                activeTab === 'checklist'
                  ? 'text-[var(--accent-2)]'
                  : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              <CheckSquare size={13} aria-hidden="true" className={activeTab === 'checklist' ? 'text-[var(--accent)]' : ''} />
              <span>Checklist</span>
              {checkedIds.size > 0 && (
                <span className="size-4 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {checkedIds.size}
                </span>
              )}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'promo'}
              onClick={() => {
                triggerHaptic(6)
                setActiveTab('promo')
              }}
              className={`relative z-10 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 press ${
                activeTab === 'promo'
                  ? 'text-[var(--accent-2)]'
                  : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              <TicketPercent size={13} aria-hidden="true" className={activeTab === 'promo' ? 'text-[var(--accent)]' : ''} />
              <span>Kupon &amp; Info</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. QUICK-COMMERCE SPLIT-SIDEBAR LAYOUT (BOROBAZAR / ASTROMART / ALFAGIFT STYLE) */}
      {activeTab !== 'promo' ? (
        <div className="flex items-start min-h-[calc(100dvh-165px)]">
          {/* KOLOM KIRI: STICKY VERTICAL CATEGORY RAIL (mengto/css-alpha-masking: mask-fade-bottom) */}
          <aside
            aria-label="Daftar Kategori Produk"
            className="w-[82px] sm:w-[92px] shrink-0 sticky top-[146px] max-h-[calc(100dvh-210px)] overflow-y-auto scrollbar-hide mask-fade-bottom bg-[#F2E4DC]/80 border-r border-b border-[var(--line)] rounded-br-2xl py-2 pb-5 px-1.5 space-y-1.5 select-none"
          >
            {/* Tombol Semua Produk */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(6)
                setSelectedCategory('all')
              }}
              className={`press relative w-full py-2 px-1 rounded-2xl flex flex-col items-center justify-center text-center transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-white border border-[var(--accent)]/60 shadow-xs text-[var(--accent-2)]'
                  : 'text-[var(--ink-soft)] hover:bg-white/60 hover:text-[var(--ink)] border border-transparent'
              }`}
            >
              {selectedCategory === 'all' && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-[var(--accent)]"
                />
              )}
              <span
                aria-hidden="true"
                className={`size-9 rounded-xl flex items-center justify-center text-lg mb-1 transition-transform ${
                  selectedCategory === 'all'
                    ? 'bg-[var(--accent-bg)] scale-105'
                    : 'bg-white/80 border border-[var(--line)]/60'
                }`}
              >
                🏪
              </span>
              <span className="text-[10.5px] font-sora font-bold leading-tight line-clamp-2">
                Semua
              </span>
              <span className="text-[9.5px] text-[var(--ink-soft)] font-semibold tabular-nums mt-0.5">
                {products.length} item
              </span>
            </button>

            {/* Daftar Kategori dari Database */}
            {categories.map((cat) => {
              const count = products.filter(
                (p) => p.category_id === cat.id || p.categories?.slug === cat.slug
              ).length
              if (count === 0) return null
              const isSelected = selectedCategory === cat.id || selectedCategory === cat.slug
              const emoji = getCategoryIconEmoji(cat.nama)

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic(6)
                    setSelectedCategory(cat.slug || cat.id)
                  }}
                  className={`press relative w-full py-2 px-1 rounded-2xl flex flex-col items-center justify-center text-center transition-colors ${
                    isSelected
                      ? 'bg-white border border-[var(--accent)]/60 shadow-xs text-[var(--accent-2)]'
                      : 'text-[var(--ink-soft)] hover:bg-white/60 hover:text-[var(--ink)] border border-transparent'
                  }`}
                >
                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-[var(--accent)]"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className={`size-9 rounded-xl flex items-center justify-center text-lg mb-1 transition-transform ${
                      isSelected
                        ? 'bg-[var(--accent-bg)] scale-105'
                        : 'bg-white/80 border border-[var(--line)]/60'
                    }`}
                  >
                    {emoji}
                  </span>
                  <span className="text-[10.5px] font-sora font-bold leading-tight line-clamp-2 px-0.5">
                    {cat.nama}
                  </span>
                  <span className="text-[9.5px] text-[var(--ink-soft)] font-semibold tabular-nums mt-0.5">
                    {count}
                  </span>
                </button>
              )
            })}
          </aside>

          {/* KOLOM KANAN: DAFTAR PRODUK UTAMA (flornkm/prefer-container-queries: @container) */}
          <main className="@container flex-1 min-w-0 p-2.5 sm:p-3">
            {/* Baris Judul Kategori Aktif & Saklar Mode Grid/List (jakubantalik/transitions-dev: sliding pill toggle) */}
            <div className="flex items-center justify-between gap-2 mb-2 bg-white/90 rounded-2xl px-3 py-2 smooth-ring-card">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="text-sm">{activeCategoryMeta.icon}</span>
                  <h2 className="font-sora font-bold text-xs text-[var(--ink)] truncate">
                    {activeCategoryMeta.nama}
                  </h2>
                </div>
                <p className="text-[10px] text-[var(--ink-soft)] font-medium tabular-nums">
                  Menampilkan {filteredProducts.length} produk tersedia
                </p>
              </div>

              {activeTab === 'katalog' && (
                <div
                  role="group"
                  aria-label="Pilih tata letak produk"
                  className="relative grid grid-cols-2 items-center bg-[var(--paper)] p-0.5 rounded-xl border border-[var(--line)] shrink-0"
                >
                  {/* Sliding Active Pill Indicator */}
                  <div
                    aria-hidden="true"
                    className="absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-lg bg-white shadow-2xs pointer-events-none"
                    style={{
                      transform: `translateX(${viewMode === 'list' ? '100%' : '0%'})`,
                      transition: 'transform 240ms var(--ease-spring)',
                    }}
                  />
                  <button
                    type="button"
                    aria-label="Tampilan Grid 2 Kolom"
                    aria-pressed={viewMode === 'grid'}
                    onClick={() => {
                      triggerHaptic(5)
                      setViewMode('grid')
                    }}
                    className={`relative z-10 press px-2 py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${
                      viewMode === 'grid'
                        ? 'text-[var(--accent-2)]'
                        : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
                    }`}
                  >
                    <LayoutGrid size={12} aria-hidden="true" />
                    <span>Grid</span>
                  </button>
                  <button
                    type="button"
                    aria-label="Tampilan Daftar Baris"
                    aria-pressed={viewMode === 'list'}
                    onClick={() => {
                      triggerHaptic(5)
                      setViewMode('list')
                    }}
                    className={`relative z-10 press px-2 py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${
                      viewMode === 'list'
                        ? 'text-[var(--accent-2)]'
                        : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
                    }`}
                  >
                    <List size={12} aria-hidden="true" />
                    <span>Baris</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick-Search Popular Essential Pills (pbakaus/clarify & mengto/css-alpha-masking: 1-tap filter + mask-fade-right) */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide mask-fade-right pr-4 pb-2 mb-0.5">
              <span className="text-[10px] font-bold text-[var(--ink-soft)] shrink-0">Cepat:</span>
              {[
                { label: '🌾 Beras', kw: 'Beras' },
                { label: '🌻 Minyak', kw: 'Minyak' },
                { label: '🍜 Mie', kw: 'Mie' },
                { label: '🧼 Sabun', kw: 'Sabun' },
                { label: '🥚 Telur', kw: 'Telur' },
                { label: '🍬 Gula', kw: 'Gula' },
              ].map((tag) => {
                const isTagActive = searchQuery.toLowerCase().trim() === tag.kw.toLowerCase()
                return (
                  <button
                    key={tag.kw}
                    type="button"
                    aria-pressed={isTagActive}
                    onClick={() => {
                      triggerHaptic(5)
                      setSearchQuery(isTagActive ? '' : tag.kw)
                    }}
                    className={`press shrink-0 px-2.5 py-1 rounded-full text-[10.5px] font-sora font-bold transition-colors border ${
                      isTagActive
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs'
                        : 'bg-white text-[var(--ink-soft)] border-[var(--line)] hover:border-[var(--accent)]/60 hover:text-[var(--ink)]'
                    }`}
                  >
                    {tag.label}
                  </button>
                )
              })}
            </div>

            {/* TAB 1: KATALOG (GRID 2 KOLOM ATAU DAFTAR BARIS) */}
            {activeTab === 'katalog' && (
              <>
                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-2xl p-6 text-center border border-[var(--line)] shadow-card-sm">
                    <p className="text-3xl mb-2" aria-hidden="true">🔍</p>
                    <p className="font-bold text-sm text-[var(--ink)]">Produk tidak ditemukan</p>
                    <p className="text-xs text-[var(--ink-soft)] mt-1">
                      Coba kata kunci lain atau pilih kategori di sebelah kiri
                    </p>
                    {(searchQuery || selectedCategory !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('')
                          setSelectedCategory('all')
                        }}
                        className="press mt-3 inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-sora font-bold shadow-xs"
                      >
                        Tampilkan Semua Produk
                      </button>
                    )}
                  </div>
                ) : viewMode === 'grid' ? (
                  /* TAMPILAN GRID ADAPTIF (flornkm/prefer-container-queries: grid-cols-2 @[520px]:grid-cols-3) */
                  <div className="grid grid-cols-2 @[520px]:grid-cols-3 gap-2">
                    {filteredProducts.map((product, idx) => {
                      const qty = cartQuantities[product.id] || 0
                      return (
                        <div
                          key={product.id}
                          className={`rounded-2xl p-2 flex flex-col justify-between smooth-ring-card ${
                            idx >= 6 ? 'cv-auto' : ''
                          }`}
                        >
                          <div>
                            {/* Gambar Produk Persegi (jakubkrehel/better-ui: img-ring-inset) */}
                            <Link
                              href={`/produk/${product.slug}`}
                              className="block relative aspect-square w-full rounded-xl bg-[var(--accent-bg)] img-ring-inset overflow-hidden mb-1.5"
                            >
                              {product.image_url ? (
                                <Image
                                  src={product.image_url}
                                  alt={product.nama}
                                  fill
                                  priority={idx < 4}
                                  className="object-contain p-1.5 transition-transform duration-300 hover:scale-105"
                                  sizes="(max-width: 480px) 40vw, 180px"
                                />
                              ) : (
                                <div
                                  className="w-full h-full flex items-center justify-center text-2xl text-[var(--ink-soft)]"
                                  aria-hidden="true"
                                >
                                  📦
                                </div>
                              )}

                              {/* Badge Sisa Stok Sedikit */}
                              {product.stok > 0 && product.stok <= 5 && (
                                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-[var(--accent-2)] text-[9.5px] font-bold shadow-2xs tabular-nums">
                                  Sisa {product.stok}
                                </span>
                              )}
                            </Link>

                            {/* Nama Produk */}
                            <Link href={`/produk/${product.slug}`} className="block">
                              <h3 className="font-bold text-xs leading-snug line-clamp-2 text-[var(--ink)] hover:text-[var(--accent)] min-h-[2.1rem]">
                                {product.nama}
                              </h3>
                            </Link>
                          </div>

                          {/* Harga & Tombol Stepper Instan */}
                          <div className="pt-1.5 mt-1 border-t border-[var(--line)]/60 flex items-center justify-between gap-1">
                            <div className="min-w-0 tabular-nums">
                              <span className="block font-sora font-extrabold text-xs text-[var(--accent-2)] truncate">
                                {formatRupiah(product.harga)}
                              </span>
                              <span className="block text-[9.5px] text-[var(--ink-soft)]">
                                Stok {product.stok}
                              </span>
                            </div>

                            <div className="shrink-0">
                              {qty === 0 ? (
                                <button
                                  type="button"
                                  onClick={() => updateQty(product.id, 1)}
                                  disabled={product.stok <= 0}
                                  aria-label={`Tambah ${product.nama} ke keranjang`}
                                  className="press hit-area-expand px-2.5 py-1.5 rounded-xl bg-[var(--accent)] text-white font-sora font-bold text-[11px] hover:bg-[var(--accent-2)] transition-colors flex items-center gap-0.5 shadow-xs disabled:opacity-50"
                                >
                                  <Plus size={13} aria-hidden="true" />
                                  <span>Beli</span>
                                </button>
                              ) : (
                                <div className="flex items-center gap-0.5 bg-[var(--paper)] rounded-xl p-0.5 border border-[var(--line)] animate-pop">
                                  <button
                                    type="button"
                                    aria-label={`Kurangi jumlah ${product.nama}`}
                                    onClick={() => updateQty(product.id, -1)}
                                    className="press hit-area-expand size-6 rounded-lg bg-white flex items-center justify-center text-[var(--ink)] font-bold shadow-2xs"
                                  >
                                    <Minus size={11} aria-hidden="true" />
                                  </button>
                                  <span
                                    key={`qty-${product.id}-${qty}`}
                                    className="w-4 text-center font-sora font-bold text-[11px] text-[var(--accent-2)] tabular-nums animate-pop"
                                  >
                                    {qty}
                                  </span>
                                  <button
                                    type="button"
                                    aria-label={`Tambah jumlah ${product.nama}`}
                                    onClick={() => updateQty(product.id, 1)}
                                    disabled={qty >= product.stok}
                                    className="press hit-area-expand size-6 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white font-bold shadow-2xs disabled:opacity-50"
                                  >
                                    <Plus size={11} aria-hidden="true" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  /* TAMPILAN DAFTAR BARIS (LIST COMPACT) */
                  <div className="space-y-2">
                    {filteredProducts.map((product, idx) => {
                      const qty = cartQuantities[product.id] || 0
                      return (
                        <div
                          key={product.id}
                          className={`rounded-2xl p-2.5 flex items-center gap-2.5 smooth-ring-card ${
                            idx >= 8 ? 'cv-auto' : ''
                          }`}
                        >
                          {/* Gambar Thumbnail */}
                          <Link
                            href={`/produk/${product.slug}`}
                            className="size-13 rounded-xl bg-[var(--accent-bg)] img-ring-inset relative overflow-hidden shrink-0"
                          >
                            {product.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.nama}
                                fill
                                className="object-contain p-1"
                                sizes="56px"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center text-xs text-[var(--ink-soft)]"
                                aria-hidden="true"
                              >
                                📦
                              </div>
                            )}
                          </Link>

                          {/* Informasi Produk */}
                          <div className="flex-1 min-w-0">
                            <Link href={`/produk/${product.slug}`} className="block">
                              <h3 className="font-bold text-xs leading-snug line-clamp-2 text-[var(--ink)] hover:text-[var(--accent)]">
                                {product.nama}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-2 mt-1 tabular-nums">
                              <span className="font-sora font-extrabold text-xs text-[var(--accent-2)]">
                                {formatRupiah(product.harga)}
                              </span>
                              <span className="text-[10px] text-[var(--ink-soft)]">
                                Stok: {product.stok}
                              </span>
                            </div>
                          </div>

                          {/* Tombol Stepper / Tambah */}
                          <div className="shrink-0">
                            {qty === 0 ? (
                              <button
                                type="button"
                                onClick={() => updateQty(product.id, 1)}
                                disabled={product.stok <= 0}
                                aria-label={`Tambah ${product.nama} ke keranjang`}
                                className="press hit-area-expand px-2.5 py-1.5 rounded-xl bg-[var(--accent-bg)] text-[var(--accent-2)] font-bold text-xs hover:bg-[var(--accent)] hover:text-white transition-colors flex items-center gap-1 disabled:opacity-50 shadow-xs"
                              >
                                <Plus size={13} aria-hidden="true" />
                                <span>Beli</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 bg-[var(--paper)] rounded-xl p-1 border border-[var(--line)]">
                                <button
                                  type="button"
                                  aria-label={`Kurangi jumlah ${product.nama}`}
                                  onClick={() => updateQty(product.id, -1)}
                                  className="press hit-area-expand size-6 rounded-lg bg-white flex items-center justify-center text-[var(--ink)] font-bold shadow-2xs"
                                >
                                  <Minus size={12} aria-hidden="true" />
                                </button>
                                <span className="w-5 text-center font-sora font-bold text-xs text-[var(--accent-2)] tabular-nums">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  aria-label={`Tambah jumlah ${product.nama}`}
                                  onClick={() => updateQty(product.id, 1)}
                                  disabled={qty >= product.stok}
                                  className="press hit-area-expand size-6 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white font-bold shadow-2xs disabled:opacity-50"
                                >
                                  <Plus size={12} aria-hidden="true" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {/* TAB 2: CHECKLIST KILAT (DENGAN SIDEBAR KATEGORI DI KIRI) */}
            {activeTab === 'checklist' && (
              <div>
                <div className="bg-[var(--accent-bg)] rounded-2xl p-2.5 mb-2.5 border border-[rgba(255,107,53,0.3)] flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-xs text-[var(--ink)]">
                      Centang Barang Belanjaan
                    </p>
                    <p className="text-[10px] text-[var(--ink-soft)]">
                      Pilih kategori di kiri lalu centang barang
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (checkedIds.size === filteredProducts.length) {
                        setCheckedIds(new Set())
                      } else {
                        setCheckedIds(new Set(filteredProducts.map((p) => p.id)))
                      }
                    }}
                    className="text-xs font-bold text-[var(--accent-2)] hover:underline shrink-0"
                  >
                    {checkedIds.size === filteredProducts.length ? 'Batal Semua' : 'Pilih Semua'}
                  </button>
                </div>

                <div className="space-y-1.5">
                  {filteredProducts.map((product) => {
                    const isChecked = checkedIds.has(product.id)
                    return (
                      <button
                        key={`check-${product.id}`}
                        type="button"
                        role="checkbox"
                        aria-checked={isChecked}
                        onClick={() => toggleCheck(product.id)}
                        className={`w-full text-left p-2.5 rounded-2xl border transition-colors cursor-pointer flex items-center justify-between gap-2.5 ${
                          isChecked
                            ? 'bg-[var(--accent-bg)]/80 border-[var(--accent)]'
                            : 'bg-white border-[var(--line)]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="text-[var(--accent)] shrink-0" aria-hidden="true">
                            {isChecked ? (
                              <CheckSquare size={19} />
                            ) : (
                              <Square size={19} className="text-[var(--ink-soft)]/50" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-bold line-clamp-1 ${
                                isChecked ? 'text-[var(--accent-2)]' : 'text-[var(--ink)]'
                              }`}
                            >
                              {product.nama}
                            </p>
                            <p className="text-[10px] text-[var(--ink-soft)] tabular-nums">
                              Sisa stok: {product.stok}
                            </p>
                          </div>
                        </div>

                        <span className="font-sora font-extrabold text-xs text-[var(--ink)] shrink-0 tabular-nums">
                          {formatRupiah(product.harga)}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Checklist Floating Action Bar */}
                {checklistSummary.count > 0 && (
                  <div className="mt-4 p-3 bg-white rounded-2xl border border-[var(--accent)] shadow-md flex items-center justify-between">
                    <div className="tabular-nums">
                      <span className="text-[10px] text-[var(--ink-soft)] font-medium block">
                        {checklistSummary.count} Item Dicentang
                      </span>
                      <span className="font-sora font-extrabold text-sm text-[var(--accent-2)]">
                        {formatRupiah(checklistSummary.total)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAllChecklist}
                      disabled={isPending}
                      className="press px-3.5 py-2 rounded-xl bg-[var(--accent)] text-white font-bold text-xs hover:bg-[var(--accent-2)] transition-colors flex items-center gap-1.5 shadow-btn"
                    >
                      <ShoppingCart size={14} aria-hidden="true" />
                      <span>{isPending ? 'Menyimpan...' : 'Beli Semua'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      ) : (
        /* TAB 3: PROMO & INFORMASI TOKO */
        <main className="px-4 mt-3 space-y-3">
          {/* Kartu Informasi Toko */}
          <div className="bg-white rounded-2xl p-4 border border-[var(--line)] shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Store size={18} aria-hidden="true" className="text-[var(--accent)]" />
              <h3 className="font-bold text-xs text-[var(--ink)]">Informasi &amp; Layanan Toko</h3>
            </div>
            <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
              Melayani pesan antar kebutuhan pokok, sembako, alat tulis, dan perlengkapan harian ke seluruh dusun Desa Pengenjek dan sekitarnya (Bisa COD / Bayar di Kasir).
            </p>
            <div className="mt-3 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs tabular-nums">
              <span className="text-[var(--ink-soft)]">Jam Operasional Toko:</span>
              <strong className="text-[var(--accent-2)]">07.00 – 21.00 WITA</strong>
            </div>
          </div>

          {/* Daftar Kupon Promo */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-[var(--ink-soft)] px-1">Kupon Promo Toko:</h4>
            <div className="bg-white rounded-2xl p-3 border border-[var(--line)] flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div
                  className="size-9 rounded-xl bg-[var(--accent-bg)] text-[var(--accent-2)] flex items-center justify-center font-bold"
                  aria-hidden="true"
                >
                  🎟️
                </div>
                <div>
                  <span className="font-sora font-extrabold text-xs text-[var(--ink)]">HEMATDESA</span>
                  <p className="text-[10px] text-[var(--ink-soft)]">
                    Gratis ongkir belanja min. Rp 25.000 se-Pengenjek
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10)
                  navigator.clipboard?.writeText('HEMATDESA')
                  try {
                    localStorage.setItem('widiya_saved_voucher', 'HEMATDESA')
                  } catch {}
                  setCopiedCoupon('HEMATDESA')
                  setTimeout(() => setCopiedCoupon(null), 2500)
                  showToast('Kode HEMATDESA disalin & siap dipakai di Keranjang!')
                }}
                className={`press hit-area-expand px-3 py-1.5 rounded-xl font-bold text-xs transition-colors shrink-0 flex items-center gap-1 ${
                  copiedCoupon === 'HEMATDESA'
                    ? 'bg-emerald-600 text-white border border-emerald-600 animate-pop'
                    : 'border border-[var(--accent)] text-[var(--accent-2)] hover:bg-[var(--accent)] hover:text-white'
                }`}
              >
                {copiedCoupon === 'HEMATDESA' ? (
                  <>
                    <Check size={13} aria-hidden="true" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <span>Salin</span>
                )}
              </button>
            </div>
          </div>
        </main>
      )}

      {/* 4. MAINBUTTON MELAYANG + FREE-SHIPPING PROGRESS BAR (mengto/scroll-progress-timeline) */}
      {(totalLocalCart.count > 0 || checkedIds.size > 0) && (() => {
        const currentTotal = totalLocalCart.count > 0 ? totalLocalCart.total : checklistSummary.total
        const freeShipTarget = 25000
        const remainingForFreeShip = Math.max(0, freeShipTarget - currentTotal)
        const freeShipRatio = Math.min(1, currentTotal / freeShipTarget)
        return (
          <div className="fixed bottom-20 inset-x-0 z-50 p-3 max-w-lg mx-auto">
            <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white rounded-2xl p-3 shadow-btn space-y-2 animate-fade-in">
              {/* Progress Bar Gratis Ongkir Rp 25.000 */}
              <div className="bg-black/15 rounded-xl px-2.5 py-1.5 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-semibold">
                  <span>
                    {remainingForFreeShip === 0
                      ? '🎉 Syarat Gratis Ongkir se-Pengenjek Terpenuhi!'
                      : `🛵 Tambah ${formatRupiah(remainingForFreeShip)} lagi untuk Gratis Ongkir`}
                  </span>
                  <span className="tabular-nums font-bold">{Math.round(freeShipRatio * 100)}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/25 overflow-hidden">
                  <div
                    className="h-full w-full origin-left rounded-full bg-white transition-transform duration-300"
                    style={{ transform: `scaleX(${freeShipRatio})` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="tabular-nums min-w-0">
                  <span className="text-[10px] opacity-90 block font-medium truncate">
                    {totalLocalCart.count > 0
                      ? `${totalLocalCart.count} Item di Keranjang`
                      : `${checkedIds.size} Item Terpilih`}
                  </span>
                  <span className="font-sora font-extrabold text-sm block truncate">
                    {formatRupiah(currentTotal)}
                  </span>
                </div>
                <Link
                  href="/keranjang"
                  className="press shrink-0 px-4 py-2 bg-white text-[var(--accent-2)] font-sora font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm hover:bg-[var(--paper)] transition-colors"
                >
                  <span>Lanjut Bayar</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 inset-x-4 z-50 flex justify-center pointer-events-none"
        >
          <div className="bg-[var(--navy)]/95 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-2 animate-fade-in">
            <Check size={14} aria-hidden="true" className="text-emerald-400" />
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  )
}

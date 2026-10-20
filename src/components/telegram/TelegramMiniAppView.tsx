// @ts-nocheck
'use client'

import React, { useState, useMemo, useTransition } from 'react'
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
} from 'lucide-react'
import { formatRupiah, isStoreOpen, formatWhatsAppUrl } from '@/lib/utils'
import { addToCart } from '@/lib/actions/cart'

interface TelegramMiniAppViewProps {
  categories: any[]
  products: any[]
  storeInfo: any
  promos: any[]
}

export function TelegramMiniAppView({
  categories = [],
  products = [],
  storeInfo = null,
  promos = [],
}: TelegramMiniAppViewProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'katalog' | 'checklist' | 'promo'>('katalog')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({})
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<string | null>(null)

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

  // Handler Checklist Toggle
  const toggleCheck = (id: string) => {
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

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] pb-32">
      {/* 1. HEADER KHAS TOKO WIDIYA MART (WARM CORAL BRANDING) */}
      <header className="sticky top-0 z-40 bg-[rgba(250,240,235,0.96)] backdrop-blur-md border-b border-[var(--line)] px-4 py-3 shadow-header">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Logo Asli Widiya Mart */}
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden shadow-sm shrink-0 border border-[var(--line)] bg-white">
              <Image
                src={storeInfo?.logo_url || '/logo.png'}
                alt={storeInfo?.nama_toko || 'Widiya Mart'}
                fill
                className="object-cover"
                sizes="40px"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-sora font-extrabold text-sm truncate text-[var(--ink)]">
                  {storeInfo?.nama_toko || 'PENGENJEK MART'}
                </h1>
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[9px] font-bold">
                  ✓
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--ink-soft)]">
                <span className={`w-2 h-2 rounded-full ${storeStatus.isOpen ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                <span className="font-medium">
                  {storeStatus.isOpen ? `Buka s/d ${storeStatus.jamTutupFormatted}` : 'Tutup Sementara'}
                </span>
                <span>•</span>
                <span>Lombok Tengah</span>
              </div>
            </div>
          </div>

          {/* Tombol Chat Kasir WhatsApp */}
          <a
            href={formatWhatsAppUrl(adminWa, 'Halo Admin Pengenjek Mart, saya mau tanya ketersediaan stok')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--accent-bg)] text-[var(--accent-2)] hover:bg-[var(--accent)] hover:text-white transition-all text-xs font-bold shrink-0 shadow-card-sm active:scale-95"
          >
            <MessageCircle size={15} />
            <span className="hidden xs:inline">Chat Kasir</span>
          </a>
        </div>

        {/* Input Pencarian Cepat Terintegrasi */}
        <div className="mt-2.5 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[var(--ink-soft)]">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari beras, minyak, sabun, pulpen..."
            className="w-full pl-9 pr-8 py-2 bg-white border border-[var(--line)] focus:border-[var(--accent)] rounded-xl text-xs font-medium text-[var(--ink)] placeholder-[var(--ink-soft)]/60 outline-none shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-2.5 flex items-center text-[var(--ink-soft)] hover:text-[var(--ink)]"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </header>

      {/* 2. SEGMENTED TAB SWITCHER (WARNA TOKO KITA) */}
      <div className="px-4 pt-3">
        <div className="bg-[rgba(232,214,205,0.6)] p-1 rounded-2xl flex items-center gap-1">
          <button
            onClick={() => setActiveTab('katalog')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'katalog'
                ? 'bg-white text-[var(--accent-2)] shadow-xs'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            <Zap size={14} className={activeTab === 'katalog' ? 'text-[var(--accent)]' : ''} />
            <span>Katalog Cepat</span>
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 relative ${
              activeTab === 'checklist'
                ? 'bg-white text-[var(--accent-2)] shadow-xs'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            <CheckSquare size={14} className={activeTab === 'checklist' ? 'text-[var(--accent)]' : ''} />
            <span>Daftar Checklist</span>
            {checkedIds.size > 0 && (
              <span className="w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center">
                {checkedIds.size}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('promo')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'promo'
                ? 'bg-white text-[var(--accent-2)] shadow-xs'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            <TicketPercent size={14} className={activeTab === 'promo' ? 'text-[var(--accent)]' : ''} />
            <span>Kupon & Info</span>
          </button>
        </div>
      </div>

      {/* 3. CATEGORY CHIP BAR (PIL FILTER HORIZONTAL) */}
      {activeTab !== 'promo' && (
        <div className="px-4 py-2.5 overflow-x-auto scrollbar-hide flex items-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[var(--accent)] text-white shadow-chip-active'
                : 'bg-white text-[var(--ink-soft)] border border-[var(--line)] shadow-xs hover:border-[var(--accent)]'
            }`}
          >
            Semua ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category_id === cat.id || p.categories?.slug === cat.slug).length
            if (count === 0) return null
            const isSelected = selectedCategory === cat.id || selectedCategory === cat.slug
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug || cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[var(--accent)] text-white shadow-chip-active'
                    : 'bg-white text-[var(--ink-soft)] border border-[var(--line)] shadow-xs hover:border-[var(--accent)]'
                }`}
              >
                {cat.nama} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* 4. KONTEN TAB UTAMA */}
      <main className="px-4 mt-1">
        {/* TAB 1: KATALOG CEPAT (ROW COMPACT LIST) */}
        {activeTab === 'katalog' && (
          <div className="space-y-2">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-[var(--line)] shadow-xs">
                <p className="text-3xl mb-2">🔍</p>
                <p className="font-bold text-sm text-[var(--ink)]">Produk tidak ditemukan</p>
                <p className="text-xs text-[var(--ink-soft)] mt-1">Gunakan kata kunci atau pilih kategori lain</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const qty = cartQuantities[product.id] || 0
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl p-2.5 border border-[var(--line)] flex items-center gap-3 transition-all hover:border-[var(--accent)]/50 shadow-xs"
                  >
                    {/* Gambar Thumbnail */}
                    <Link
                      href={`/produk/${product.slug}`}
                      className="w-14 h-14 rounded-xl bg-[var(--accent-bg)] relative overflow-hidden shrink-0 border border-[var(--line)]/50"
                    >
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.nama}
                          fill
                          className="object-cover"
                          sizes="60px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[var(--ink-soft)]">
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
                      <div className="flex items-center gap-2 mt-1">
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
                          onClick={() => updateQty(product.id, 1)}
                          disabled={product.stok <= 0}
                          className="px-3 py-1.5 rounded-xl bg-[var(--accent-bg)] text-[var(--accent-2)] font-bold text-xs hover:bg-[var(--accent)] hover:text-white transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50 shadow-xs"
                        >
                          <Plus size={14} />
                          <span>Tambah</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 bg-[var(--paper)] rounded-xl p-1 border border-[var(--line)]">
                          <button
                            onClick={() => updateQty(product.id, -1)}
                            className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[var(--ink)] font-bold active:scale-95 shadow-2xs"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center font-sora font-bold text-xs text-[var(--accent-2)]">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQty(product.id, 1)}
                            disabled={qty >= product.stok}
                            className="w-6 h-6 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white font-bold active:scale-95 shadow-2xs disabled:opacity-50"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* TAB 2: CHECKLIST KILAT (NOTA BELANJA CENTANG CEPAT) */}
        {activeTab === 'checklist' && (
          <div>
            <div className="bg-[var(--accent-bg)] rounded-2xl p-3 mb-3 border border-[rgba(255,107,53,0.3)] flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-[var(--ink)]">
                  Centang Kebutuhan yang Ingin Dipesan
                </p>
                <p className="text-[10px] text-[var(--ink-soft)]">
                  Pilih item harian dan masukkan sekaligus ke keranjang
                </p>
              </div>
              <button
                onClick={() => {
                  if (checkedIds.size === filteredProducts.length) {
                    setCheckedIds(new Set())
                  } else {
                    setCheckedIds(new Set(filteredProducts.map((p) => p.id)))
                  }
                }}
                className="text-xs font-bold text-[var(--accent-2)] hover:underline"
              >
                {checkedIds.size === filteredProducts.length ? 'Batal Semua' : 'Pilih Semua'}
              </button>
            </div>

            <div className="space-y-1.5">
              {filteredProducts.map((product) => {
                const isChecked = checkedIds.has(product.id)
                return (
                  <div
                    key={`check-${product.id}`}
                    onClick={() => toggleCheck(product.id)}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isChecked
                        ? 'bg-[var(--accent-bg)]/80 border-[var(--accent)]'
                        : 'bg-white border-[var(--line)]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-[var(--accent)] shrink-0">
                        {isChecked ? <CheckSquare size={20} /> : <Square size={20} className="text-[var(--ink-soft)]/50" />}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold line-clamp-1 ${isChecked ? 'text-[var(--accent-2)]' : 'text-[var(--ink)]'}`}>
                          {product.nama}
                        </p>
                        <p className="text-[10px] text-[var(--ink-soft)]">
                          Sisa stok: {product.stok}
                        </p>
                      </div>
                    </div>

                    <span className="font-sora font-extrabold text-xs text-[var(--ink)] shrink-0">
                      {formatRupiah(product.harga)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Checklist Floating Action Bar */}
            {checklistSummary.count > 0 && (
              <div className="mt-4 p-3.5 bg-white rounded-2xl border border-[var(--accent)] shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[var(--ink-soft)] font-medium block">
                    {checklistSummary.count} Item Dicentang
                  </span>
                  <span className="font-sora font-extrabold text-sm text-[var(--accent-2)]">
                    {formatRupiah(checklistSummary.total)}
                  </span>
                </div>
                <button
                  onClick={handleAddAllChecklist}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white font-bold text-xs hover:bg-[var(--accent-2)] transition-all flex items-center gap-1.5 shadow-btn active:scale-95"
                >
                  <ShoppingCart size={14} />
                  <span>{isPending ? 'Menyimpan...' : 'Beli Semua'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROMO & INFORMASI TOKO */}
        {activeTab === 'promo' && (
          <div className="space-y-3">
            {/* Kartu Informasi Toko */}
            <div className="bg-white rounded-2xl p-4 border border-[var(--line)] shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <Store size={18} className="text-[var(--accent)]" />
                <h3 className="font-bold text-xs text-[var(--ink)]">Informasi & Layanan Toko</h3>
              </div>
              <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                Melayani pesan antar kebutuhan pokok, sembako, alat tulis, dan perlengkapan harian ke seluruh dusun Desa Pengenjek dan sekitarnya (Bisa COD / Bayar di Kasir).
              </p>
              <div className="mt-3 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs">
                <span className="text-[var(--ink-soft)]">Jam Operasional Toko:</span>
                <strong className="text-[var(--accent-2)]">07.00 – 21.00 WITA</strong>
              </div>
            </div>

            {/* Daftar Kupon Promo */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-[var(--ink-soft)] px-1">Kupon Promo Toko:</h4>
              <div className="bg-white rounded-2xl p-3 border border-[var(--line)] flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[var(--accent-bg)] text-[var(--accent-2)] flex items-center justify-center font-bold">
                    🎟️
                  </div>
                  <div>
                    <span className="font-sora font-extrabold text-xs text-[var(--ink)]">HEMATDESA</span>
                    <p className="text-[10px] text-[var(--ink-soft)]">Gratis ongkir belanja min. Rp 25.000 se-Pengenjek</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText('HEMATDESA')
                    showToast('Kode kupon HEMATDESA disalin!')
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[var(--accent)] text-[var(--accent-2)] font-bold text-xs hover:bg-[var(--accent)] hover:text-white transition-all shrink-0 active:scale-95"
                >
                  Salin
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. MAINBUTTON MELAYANG KHAS TELEGRAM APP (WARNA CORAL RESMI) */}
      {(totalLocalCart.count > 0 || checkedIds.size > 0) && (
        <div className="fixed bottom-20 inset-x-0 z-50 p-3 max-w-lg mx-auto">
          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white rounded-2xl p-3.5 shadow-btn flex items-center justify-between animate-in slide-in-from-bottom-2 duration-200">
            <div>
              <span className="text-[10px] opacity-90 block font-medium">
                {totalLocalCart.count > 0 ? `${totalLocalCart.count} Item di Keranjang` : `${checkedIds.size} Item Terpilih`}
              </span>
              <span className="font-sora font-extrabold text-sm">
                {formatRupiah(totalLocalCart.count > 0 ? totalLocalCart.total : checklistSummary.total)}
              </span>
            </div>
            <Link
              href="/keranjang"
              className="px-4 py-2 bg-white text-[var(--accent-2)] font-sora font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm hover:bg-[var(--paper)] transition-all active:scale-95"
            >
              <span>Lanjut Bayar</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 inset-x-4 z-50 flex justify-center pointer-events-none">
          <div className="bg-[var(--navy)]/95 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
            <Check size={14} className="text-emerald-400" />
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// @ts-nocheck
'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatRupiah, parseProductVariants, formatWhatsAppUrl, type ProductVariant } from '@/lib/utils'
import { addToCart } from '@/lib/actions/cart'
import {
  Layers,
  Check,
  MessageCircle,
  Package,
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingCart,
  Zap,
  Loader2,
  Plus,
  Minus,
} from 'lucide-react'
import { toggleShoppingListItem } from '@/lib/actions/shopping-list'

interface ProductDetailInteractiveProps {
  product: {
    id: string
    nama: string
    harga: number
    stok: number
    deskripsi: string | null
    image_url?: string | null
    slug: string
    categories?: { nama: string; slug: string } | null
  }
  storePhone?: string
}

export default function ProductDetailInteractive({
  product,
  storePhone = '087816182036',
}: ProductDetailInteractiveProps) {
  const router = useRouter()
  const { cleanDeskripsi, variants } = parseProductVariants(product.deskripsi)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.length > 0 ? variants[0] : null
  )
  const [qty, setQty] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const [isBuying, setIsBuying] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [savingWishlist, setSavingWishlist] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Check localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('pengenjek_shopping_list')
      if (raw) {
        const list = JSON.parse(raw)
        if (
          Array.isArray(list) &&
          list.some((item) => item.product_id === product.id || item.id === product.id)
        ) {
          setIsWishlisted(true)
        }
      }
    } catch {
      // ignore
    }
  }, [product.id])

  const handleToggleWishlist = async () => {
    setSavingWishlist(true)
    const nextState = !isWishlisted
    setIsWishlisted(nextState)
    setToastMessage(
      nextState
        ? 'Produk berhasil dicatat ke Daftar Belanja!'
        : 'Produk dihapus dari Daftar Belanja'
    )
    setTimeout(() => setToastMessage(null), 3500)

    try {
      const raw = localStorage.getItem('pengenjek_shopping_list')
      let list = raw ? JSON.parse(raw) : []
      if (!Array.isArray(list)) list = []

      if (nextState) {
        if (!list.some((i: any) => i.product_id === product.id || i.id === product.id)) {
          list.push({
            id: `local_${product.id}`,
            product_id: product.id,
            products: {
              id: product.id,
              nama: product.nama,
              harga: activePrice,
              stok: activeStock,
              image_url: currentImage?.url || product.image_url || null,
              slug: product.slug,
            },
            created_at: new Date().toISOString(),
          })
        }
      } else {
        list = list.filter(
          (i: any) =>
            i.product_id !== product.id &&
            i.id !== product.id &&
            i.id !== `local_${product.id}`
        )
      }
      localStorage.setItem('pengenjek_shopping_list', JSON.stringify(list))
    } catch (e) {
      console.warn('Failed to update localStorage shopping list:', e)
    }

    try {
      await toggleShoppingListItem(product.id)
    } catch {
      // Fail silently without disturbing user experience
    } finally {
      setSavingWishlist(false)
    }
  }

  // Build image gallery
  const galleryImages: { url: string; variantName?: string }[] = []
  if (product.image_url) {
    galleryImages.push({ url: product.image_url })
  }
  variants.forEach((v) => {
    if (v.image_url && !galleryImages.some((img) => img.url === v.image_url)) {
      galleryImages.push({ url: v.image_url, variantName: v.nama })
    }
  })

  const currentImage = galleryImages[activeImageIndex] || galleryImages[0]

  const handleSelectVariant = (v: ProductVariant) => {
    setSelectedVariant(v)
    if (v.image_url) {
      const idx = galleryImages.findIndex((img) => img.url === v.image_url)
      if (idx !== -1) setActiveImageIndex(idx)
    }
  }

  const goToPrev = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))
  }

  const goToNext = () => {
    setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))
  }

  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const isSwipedRef = useRef(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    isSwipedRef.current = false
    if (e.touches && e.touches.length > 0) {
      const clientX = e.touches[0].clientX
      const clientY = e.touches[0].clientY
      setTouchStartX(clientX)
      touchStartXRef.current = clientX
      touchStartYRef.current = clientY
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartXRef.current ?? touchStartX
    if (startX === null || !e.changedTouches || e.changedTouches.length === 0) {
      setTouchStartX(null)
      touchStartXRef.current = null
      touchStartYRef.current = null
      return
    }

    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    const diffX = startX - touchEndX
    const diffY = touchStartYRef.current !== null ? touchStartYRef.current - touchEndY : 0

    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      isSwipedRef.current = true
      if (diffX > 0) {
        goToNext()
      } else {
        goToPrev()
      }
    }

    setTouchStartX(null)
    touchStartXRef.current = null
    touchStartYRef.current = null
  }

  const activePrice = selectedVariant?.harga ?? product.harga
  const activeStock = selectedVariant?.stok ?? product.stok
  const isOutOfStock = activeStock === 0

  const getWhatsAppMessage = () => {
    let msg = `Halo Admin WIDIYA MART, saya ingin menanyakan apakah stok produk ini masih ada?\n\n*${product.nama}*\nHarga: ${formatRupiah(activePrice)}`
    if (selectedVariant?.nama) {
      msg += `\nVarian: ${selectedVariant.nama}`
    }
    msg += `\nStatus: ${isOutOfStock ? 'Tertulis Habis di web' : `Tersedia (${activeStock} pcs)`}`
    msg += `\nLink: https://widiya-mart.vercel.app/produk/${product.slug}`
    return msg
  }

  const whatsappUrl = formatWhatsAppUrl(storePhone, getWhatsAppMessage())

  const handleAddToCart = async () => {
    if (isOutOfStock || isAdding) return
    setIsAdding(true)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(25)
    }
    try {
      const res = await addToCart(product.id, qty)
      if (!res?.error) {
        setIsAdded(true)
        setToastMessage(`✓ ${qty}x ${product.nama} berhasil masuk Keranjang!`)
        setTimeout(() => setIsAdded(false), 2500)
        setTimeout(() => setToastMessage(null), 3500)
      } else {
        setToastMessage(res.error || 'Gagal menambahkan ke keranjang')
        setTimeout(() => setToastMessage(null), 3500)
      }
    } catch (err: any) {
      setToastMessage(err?.message || 'Terjadi kesalahan sistem')
      setTimeout(() => setToastMessage(null), 3500)
    } finally {
      setIsAdding(false)
    }
  }

  const handleBuyNow = async () => {
    if (isOutOfStock || isBuying) return
    setIsBuying(true)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(35)
    }
    try {
      const res = await addToCart(product.id, qty)
      if (!res?.error) {
        // Langsung arahkan pembeli ke halaman Checkout!
        router.push('/checkout')
      } else {
        setToastMessage(res.error || 'Gagal memproses checkout')
        setTimeout(() => setToastMessage(null), 3500)
        setIsBuying(false)
      }
    } catch (err: any) {
      setToastMessage(err?.message || 'Terjadi kesalahan sistem')
      setTimeout(() => setToastMessage(null), 3500)
      setIsBuying(false)
    }
  }

  return (
    <>
      {/* Interactive Image Gallery / Slider */}
      <div className="mx-4 mt-3 flex flex-col gap-2.5">
        <div
          className="relative aspect-square rounded-[var(--radius-xl)] bg-[var(--accent-bg)] border border-[rgba(232,214,205,0.9)] overflow-hidden shadow-thumb-inset select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Slide Image */}
          <button
            type="button"
            onClick={() => {
              if (!isSwipedRef.current) setShowStockModal(true)
            }}
            className="w-full h-full text-left relative block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-[var(--radius-xl)]"
            title="Ketuk gambar untuk menanyakan stok produk via WhatsApp"
          >
            {currentImage ? (
              <Image
                key={currentImage.url}
                src={currentImage.url}
                alt={
                  currentImage.variantName
                    ? `${product.nama} - ${currentImage.variantName}`
                    : product.nama
                }
                fill
                className="object-contain p-6 transition-all duration-300 animate-fade-in"
                sizes="(max-width: 480px) 100vw, 480px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--accent)]/40">
                <Package className="w-20 h-20 stroke-[1.2]" />
              </div>
            )}

            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                <span className="bg-white text-[var(--danger)] font-bold px-4 py-1.5 rounded-full text-xs shadow-md">
                  Stok Habis
                </span>
              </div>
            )}
          </button>

          {/* Current Variant Label Tag on Image */}
          {currentImage?.variantName && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--ink)]/80 text-white text-[var(--text-caption)] font-sora font-semibold shadow-md backdrop-blur-xs">
                <Layers size={11} className="text-[var(--accent)]" />
                <span>{currentImage.variantName}</span>
              </span>
            </div>
          )}

          {/* Previous / Next Arrow Overlays */}
          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={goToPrev}
                aria-label="Foto sebelumnya"
                className="press absolute left-2.5 top-1/2 -translate-y-1/2 size-8 rounded-full bg-white/85 hover:bg-white text-[var(--ink)] shadow-md flex items-center justify-center backdrop-blur-xs active:scale-95 transition-all z-10"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={goToNext}
                aria-label="Foto berikutnya"
                className="press absolute right-2.5 top-1/2 -translate-y-1/2 size-8 rounded-full bg-white/85 hover:bg-white text-[var(--ink)] shadow-md flex items-center justify-center backdrop-blur-xs active:scale-95 transition-all z-10"
              >
                <ChevronRight size={18} />
              </button>

              {/* Slider Dots Indicator */}
              <div
                className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-xs z-10"
                aria-label={`Foto ${activeImageIndex + 1} dari ${galleryImages.length}`}
              >
                {galleryImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`Buka foto ke-${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      activeImageIndex === idx ? 'w-4 bg-[var(--accent)]' : 'w-1.5 bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Selector Strip */}
        {galleryImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-14 h-14 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                  activeImageIndex === idx
                    ? 'border-[var(--accent)] scale-105 shadow-sm ring-2 ring-[var(--accent)]/30'
                    : 'border-[var(--line)] opacity-60 hover:opacity-100 bg-white'
                }`}
              >
                <Image src={img.url} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" sizes="56px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Information Card */}
      <div className="mx-4 mt-3 bg-white border border-[var(--line)] rounded-2xl p-4 shadow-card-sm">
        {product.categories && (
          <Link
            href={`/kategori?c=${product.categories.slug}`}
            className="inline-block bg-[var(--accent-bg)] text-[var(--accent-2)] text-[var(--text-caption)] font-bold px-2.5 py-0.5 rounded-full mb-2"
          >
            {product.categories.nama}
          </Link>
        )}
        <h1 className="text-base font-sora font-bold text-[var(--ink)] leading-snug mb-1">
          {product.nama}
        </h1>
        <div className="flex items-baseline gap-2 mb-2">
          <p className="font-sora font-bold text-2xl text-[var(--accent-2)] tabular-nums">
            {formatRupiah(activePrice)}
          </p>
          {selectedVariant && selectedVariant.harga && selectedVariant.harga !== product.harga && (
            <span className="text-xs text-[var(--ink-soft)] line-through">
              {formatRupiah(product.harga)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-xs">
          <p className="text-[var(--ink-soft)] font-medium">
            Stok:{' '}
            <span
              className={
                activeStock <= 5 ? 'text-[var(--danger)] font-bold' : 'text-[var(--ink)] font-semibold'
              }
            >
              {activeStock} tersisa
            </span>
            {selectedVariant && (
              <span className="ml-2 text-[var(--text-caption)] text-[var(--accent-2)] font-semibold">
                ({selectedVariant.nama})
              </span>
            )}
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[var(--text-caption)] font-sora font-bold text-emerald-600 hover:text-emerald-700 underline"
          >
            <MessageCircle size={12} />
            <span>Tanya Stok</span>
          </a>
        </div>

        {/* Variant Selection Chips */}
        {variants.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-[var(--line)]">
            <label className="text-[var(--text-caption)] font-bold text-[var(--ink)] mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[var(--accent)]" /> Pilih Varian:
            </label>
            <div className="flex flex-wrap gap-2">
              {variants.map((v, i) => {
                const isSelected = selectedVariant?.nama === v.nama
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectVariant(v)}
                    className={`press text-xs font-sora font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'btn-3d btn-3d-coral text-white border-transparent shadow-sm scale-[1.02]'
                        : 'btn-3d btn-3d-white text-[var(--ink)] border-[var(--line)] hover:border-[var(--accent)]'
                    }`}
                  >
                    {v.image_url && (
                      <span className="relative w-4 h-4 rounded-md overflow-hidden border border-black/10 shrink-0">
                        <Image src={v.image_url} alt={v.nama} fill className="object-cover" sizes="16px" />
                      </span>
                    )}
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{v.nama}</span>
                    {v.harga && v.harga !== product.harga && (
                      <span
                        className={`text-[var(--text-caption)] font-normal opacity-90 ${
                          isSelected ? 'text-white' : 'text-[var(--accent-2)]'
                        }`}
                      >
                        ({formatRupiah(v.harga)})
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Quantity Stepper Selector */}
        <div className="mt-3.5 pt-3 border-t border-[var(--line)] flex items-center justify-between">
          <div>
            <label className="text-xs font-sora font-bold text-[var(--ink)] block">
              Jumlah Pembelian
            </label>
            <span className="text-[11px] text-[var(--ink-soft)]">
              Maksimal {activeStock} pcs
            </span>
          </div>
          <div className="flex items-center gap-1 border border-[var(--line)] bg-[var(--paper)] rounded-xl p-1 shadow-card-sm">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1 || isOutOfStock}
              className="press w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-gray-100 text-[var(--ink)] disabled:opacity-30 disabled:cursor-not-allowed shadow-xs transition-all"
              aria-label="Kurangi jumlah"
            >
              <Minus size={15} />
            </button>
            <span className="w-8 text-center font-sora font-bold text-sm text-[var(--ink)] tabular-nums">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(activeStock || 99, q + 1))}
              disabled={qty >= (activeStock || 99) || isOutOfStock}
              className="press w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-gray-100 text-[var(--ink)] disabled:opacity-30 disabled:cursor-not-allowed shadow-xs transition-all"
              aria-label="Tambah jumlah"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Description - Consistent Rounded & Padding */}
      {cleanDeskripsi && (
        <div className="mx-4 mt-2.5 bg-white border border-[var(--line)] rounded-2xl p-3.5 shadow-xs">
          <h2 className="font-sora font-bold text-xs text-[var(--ink)] mb-1.5 flex items-center gap-1.5">
            Deskripsi Produk
          </h2>
          <p className="text-[var(--ink-soft)] text-xs leading-relaxed whitespace-pre-line font-inter">
            {cleanDeskripsi}
          </p>
        </div>
      )}

      {/* Modern Docked Sticky Bottom Action Bar (Standar E-Commerce: Chat + Keranjang + Suka + Tambah Keranjang + Beli Sekarang) */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[480px] w-full z-40 bg-white/95 backdrop-blur-md border-t border-[rgba(232,214,205,0.9)] px-3 py-2.5 shadow-floating pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          {/* Chat WhatsApp Icon */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="press flex flex-col items-center justify-center min-w-[42px] min-h-[42px] h-11 px-2 rounded-xl text-emerald-600 hover:bg-emerald-50 active:scale-95 transition-all shrink-0"
            title="Chat Toko via WhatsApp"
            aria-label="Chat Toko via WhatsApp"
          >
            <MessageCircle size={20} className="shrink-0" />
            <span className="text-[10px] font-sora font-semibold mt-0.5 leading-tight">Chat</span>
          </a>

          {/* Keranjang Icon */}
          <Link
            href="/keranjang"
            prefetch={true}
            className="press flex flex-col items-center justify-center min-w-[42px] min-h-[42px] h-11 px-2 rounded-xl text-[var(--ink-soft)] hover:bg-gray-100 active:scale-95 transition-all shrink-0 relative"
            title="Buka Keranjang Belanja"
            aria-label="Buka Keranjang Belanja"
          >
            <ShoppingCart size={20} className="shrink-0" />
            <span className="text-[10px] font-sora font-semibold mt-0.5 leading-tight">Keranjang</span>
          </Link>

          {/* Suka / Wishlist Icon */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            disabled={savingWishlist}
            className={`press flex flex-col items-center justify-center min-w-[42px] min-h-[42px] h-11 px-2 rounded-xl active:scale-95 transition-all shrink-0 ${
              isWishlisted ? 'text-rose-600 bg-rose-50' : 'text-[var(--ink-soft)] hover:bg-gray-100'
            }`}
            title={isWishlisted ? 'Tersimpan di Favorit' : 'Suka Produk'}
            aria-label={isWishlisted ? 'Hapus dari Favorit' : 'Suka Produk'}
          >
            <Heart
              size={20}
              className={`shrink-0 transition-transform ${
                isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : ''
              }`}
            />
            <span className="text-[10px] font-sora font-semibold mt-0.5 leading-tight">
              {isWishlisted ? 'Disukai' : 'Suka'}
            </span>
          </button>

          {/* Action Buttons: Tambah ke Keranjang & Beli Sekarang */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            {/* Tombol + Keranjang */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className="press flex-1 min-w-0 h-11 px-2 py-2 rounded-xl border border-[var(--accent)] text-[var(--accent)] bg-orange-50/70 hover:bg-orange-100 font-sora font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
            >
              {isAdding ? (
                <Loader2 size={15} className="animate-spin text-[var(--accent)] shrink-0" />
              ) : isAdded ? (
                <>
                  <Check size={15} className="text-emerald-600 shrink-0" />
                  <span className="text-emerald-600 truncate">+ Masuk!</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={15} className="shrink-0" />
                  <span className="truncate">+ Keranjang</span>
                </>
              )}
            </button>

            {/* Tombol Beli Sekarang (Langsung ke Checkout) */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock || isBuying}
              className="press flex-1 min-w-0 h-11 px-2 py-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] hover:brightness-105 text-white font-sora font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer"
            >
              {isBuying ? (
                <Loader2 size={15} className="animate-spin text-white shrink-0" />
              ) : (
                <>
                  <Zap size={15} className="shrink-0 fill-white" />
                  <span className="truncate">Beli Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 max-w-[calc(480px-32px)] w-[calc(100%-32px)] z-50 animate-bounce-short"
        >
          <div className="bg-[#2B1810] text-white p-3 rounded-2xl shadow-xl flex items-center justify-between border border-rose-500/40">
            <div className="flex items-center gap-2 text-xs">
              <Heart size={17} aria-hidden="true" className="fill-rose-500 text-rose-500 shrink-0" />
              <span className="font-medium">{toastMessage}</span>
            </div>
            <Link
              href="/keranjang"
              prefetch={true}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white text-[var(--text-caption)] font-sora font-bold shrink-0 transition-transform active:scale-95 shadow-sm"
            >
              Lihat Keranjang &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Tanya Stok via WA */}
      {showStockModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="stock-modal-title"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowStockModal(false)
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-page-in"
        >
          <div className="card-3d bg-white rounded-[var(--radius-xl)] p-5 w-full max-w-[400px] shadow-2xl border border-[var(--line)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <span
                  className="size-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <MessageCircle size={18} />
                </span>
                <h3 id="stock-modal-title" className="font-sora font-bold text-sm text-[var(--ink)]">
                  Tanya Stok Produk
                </h3>
              </div>
              <button
                type="button"
                aria-label="Tutup dialog"
                onClick={() => setShowStockModal(false)}
                className="size-7 rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>

            <div className="py-4 space-y-2">
              <p className="text-xs text-[var(--ink-soft)]">
                Kirim pesan langsung ke WhatsApp Admin Toko untuk menanyakan ketersediaan stok:
              </p>
              <div className="p-3 rounded-[var(--radius-md)] bg-[var(--paper)] border border-[rgba(232,214,205,0.9)] text-xs">
                <p className="font-bold text-[var(--ink)] line-clamp-1">{product.nama}</p>
                <p className="font-sora font-bold text-[var(--accent-2)] mt-0.5">
                  {formatRupiah(activePrice)}
                </p>
                {selectedVariant && (
                  <p className="text-[var(--text-caption)] text-[var(--ink-soft)] mt-0.5">
                    Varian: <strong>{selectedVariant.nama}</strong>
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowStockModal(false)}
                className="flex-1 py-3 text-xs font-sora font-bold rounded-[var(--radius-md)] bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
              >
                Batal
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowStockModal(false)}
                className="flex-[2] inline-flex items-center justify-center gap-1.5 py-3 text-xs font-sora font-bold rounded-[var(--radius-md)] bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm active:scale-95 transition-all"
              >
                <MessageCircle size={15} />
                <span>Kirim via WhatsApp</span>
                <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

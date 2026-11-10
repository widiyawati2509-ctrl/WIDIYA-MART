// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Download, X, Share, PlusSquare, Sparkles } from 'lucide-react'

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Don't show if already in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    if (isStandalone) return

    // Don't show if user dismissed within last 7 days
    const dismissedUntil = localStorage.getItem('widiya_pwa_dismissed_until')
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return
    }

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    const isSafari =
      userAgent.includes('safari') &&
      !userAgent.includes('chrome') &&
      !userAgent.includes('crios')
    if (isIosDevice && isSafari) {
      setIsIos(true)
      // Delay prompt appearance so it doesn't disturb initial page load
      const timer = setTimeout(() => setShowPrompt(true), 4000)
      return () => clearTimeout(timer)
    }

    // Android / Chromium beforeinstallprompt handler
    const handleBeforeInstall = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Show prompt after 3 seconds of browsing
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleDismiss = () => {
    setShowPrompt(false)
    setShowIosGuide(false)
    // Cooldown 7 days
    try {
      localStorage.setItem(
        'widiya_pwa_dismissed_until',
        (Date.now() + 7 * 24 * 60 * 60 * 1000).toString()
      )
    } catch (e) {
      // Ignore localStorage errors in private mode
    }
  }

  const handleInstallClick = async () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(25)
    }

    if (isIos) {
      setShowIosGuide(true)
      return
    }

    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    } catch (err) {
      console.warn('PWA install error:', err)
    }
  }

  if (!showPrompt) return null

  return (
    <>
      {/* Floating Modern Banner (Fixed above bottom nav) */}
      <div className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="bg-white/95 backdrop-blur-md border border-[rgba(232,214,205,0.9)] rounded-2xl p-3.5 shadow-xl flex items-center gap-3">
          {/* App Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] p-0.5 shrink-0 shadow-xs flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="WIDIYA MART"
              width={44}
              height={44}
              className="rounded-[10px] object-cover"
            />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <p className="font-sora font-bold text-xs text-[var(--ink)] truncate">
                Pasang Aplikasi WIDIYA MART
              </p>
              <span className="shrink-0 inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <Sparkles className="w-2.5 h-2.5" /> Hemat Kuota
              </span>
            </div>
            <p className="text-[11px] text-[var(--ink-soft)] font-medium leading-tight mt-0.5">
              Akses belanja lebih cepat langsung dari layar utama HP Anda.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="press inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-2)] text-white text-xs font-sora font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pasang</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 text-[var(--ink-soft)] hover:text-[var(--ink)] rounded-lg"
              title="Tutup pemberitahuan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Step-by-Step Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-[rgba(232,214,205,0.9)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sora font-bold text-sm text-[var(--ink)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                Cara Pasang di iPhone / iPad
              </h3>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[var(--ink-soft)]">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-orange-50/60 border border-orange-100">
                <div className="w-6 h-6 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  1
                </div>
                <p className="leading-relaxed">
                  Tap tombol <strong>Bagikan (Share)</strong> <Share className="w-3.5 h-3.5 inline text-[var(--accent)]" /> di bilah bawah browser Safari Anda.
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-orange-50/60 border border-orange-100">
                <div className="w-6 h-6 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  2
                </div>
                <p className="leading-relaxed">
                  Gulir ke bawah dan pilih opsi <strong>Tambah ke Layar Utama</strong> <PlusSquare className="w-3.5 h-3.5 inline text-[var(--accent)]" />.
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-orange-50/60 border border-orange-100">
                <div className="w-6 h-6 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  3
                </div>
                <p className="leading-relaxed">
                  Tap <strong>Tambah</strong> di pojok kanan atas. Ikon WIDIYA MART siap dibuka kapan saja!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="press w-full py-2.5 px-4 rounded-xl bg-[var(--accent)] text-white text-xs font-sora font-bold shadow-md active:scale-95 transition-all text-center"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  )
}

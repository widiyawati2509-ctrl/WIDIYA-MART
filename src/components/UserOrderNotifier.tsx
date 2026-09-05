// @ts-nocheck
'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, X, ArrowRight, PackageCheck, CookingPot, CheckCircle2, AlertOctagon } from 'lucide-react'
import Link from 'next/link'

interface StatusChangeNotification {
  id: string
  status: 'diproses' | 'siap_diambil' | 'selesai' | 'dibatalkan'
  title: string
  message: string
}

export default function UserOrderNotifier() {
  const [notification, setNotification] = useState<StatusChangeNotification | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const knownStatusRef = useRef<Record<string, string>>({})
  const isInitialLoadRef = useRef(true)

  // Initialize or resume AudioContext on user interaction
  useEffect(() => {
    const unlockAudio = () => {
      if (!audioCtxRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass()
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume()
      }
      window.removeEventListener('click', unlockAudio)
      window.removeEventListener('touchstart', unlockAudio)
    }

    window.addEventListener('click', unlockAudio, { passive: true })
    window.addEventListener('touchstart', unlockAudio, { passive: true })
    return () => {
      window.removeEventListener('click', unlockAudio)
      window.removeEventListener('touchstart', unlockAudio)
    }
  }, [])

  const playChime = useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) return

      const ctx = audioCtxRef.current || new AudioContextClass()
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const playNote = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, startTime)
        gain.gain.setValueAtTime(0.25, startTime)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(startTime)
        osc.stop(startTime + duration)
      }

      const now = ctx.currentTime
      // Upbeat friendly chime: E5 -> G5 -> C6
      playNote(659.25, now, 0.25)
      playNote(783.99, now + 0.12, 0.28)
      playNote(1046.5, now + 0.25, 0.45)
    } catch {
      // Audio autoplay might be restricted
    }

    // Phone vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200])
      } catch {
        // ignore
      }
    }
  }, [])

  const triggerNotification = useCallback(
    (orderId: string, newStatus: string) => {
      const shortId = orderId.slice(0, 8).toUpperCase()
      let title = ''
      let message = ''

      switch (newStatus) {
        case 'diproses':
          title = `Pesanan #${shortId} Sedang Diproses`
          message = 'Toko PENGENJEK MART sedang menyiapkan barang belanjaan Anda.'
          break
        case 'siap_diambil':
          title = `Pesanan #${shortId} Siap Diambil!`
          message = 'Belanjaan Anda sudah siap! Silakan datang ke toko untuk pengambilan/serah terima.'
          break
        case 'selesai':
          title = `Pesanan #${shortId} Selesai 🎉`
          message = 'Terima kasih telah berbelanja di PENGENJEK MART! Poin belanja Anda telah tercatat.'
          break
        case 'dibatalkan':
          title = `Pesanan #${shortId} Dibatalkan`
          message = 'Pesanan Anda telah dibatalkan.'
          break
        default:
          return
      }

      const notifData: StatusChangeNotification = {
        id: orderId,
        status: newStatus as StatusChangeNotification['status'],
        title,
        message,
      }

      setNotification(notifData)
      playChime()

      // Native browser notification if allowed
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body: message,
            icon: '/icon-192.png',
          })
        } catch {
          // ignore
        }
      }
    },
    [playChime]
  )

  useEffect(() => {
    let supabase: ReturnType<typeof createClient>
    let channel: any
    let pollInterval: NodeJS.Timeout

    async function initListener() {
      try {
        supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Initial fetch of active orders to prime cache
        const { data: initialOrders } = await supabase
          .from('orders')
          .select('id, status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (initialOrders) {
          initialOrders.forEach((o) => {
            knownStatusRef.current[o.id] = o.status
          })
        }
        isInitialLoadRef.current = false

        // Request notification permission unobtrusively
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission().catch(() => {})
        }

        // 1. Setup Supabase Realtime Subscription for this user's orders
        channel = supabase
          .channel(`user-orders-${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'orders',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              const updatedOrder = payload.new as { id: string; status: string }
              if (!updatedOrder) return

              const prevStatus = knownStatusRef.current[updatedOrder.id]
              knownStatusRef.current[updatedOrder.id] = updatedOrder.status

              if (prevStatus && prevStatus !== updatedOrder.status) {
                triggerNotification(updatedOrder.id, updatedOrder.status)
              }
            }
          )
          .subscribe()

        // 2. Lightweight polling fallback every 15s for active orders
        pollInterval = setInterval(async () => {
          try {
            const { data: latestOrders } = await supabase
              .from('orders')
              .select('id, status')
              .eq('user_id', user.id)
              .in('status', ['menunggu_diproses', 'diproses', 'siap_diambil', 'selesai', 'dibatalkan'])
              .order('created_at', { ascending: false })
              .limit(10)

            if (latestOrders) {
              latestOrders.forEach((o) => {
                const prev = knownStatusRef.current[o.id]
                if (prev && prev !== o.status && !isInitialLoadRef.current) {
                  triggerNotification(o.id, o.status)
                }
                knownStatusRef.current[o.id] = o.status
              })
            }
          } catch {
            // silent network failure
          }
        }, 15000)
      } catch (err) {
        console.warn('UserOrderNotifier init err:', err)
      }
    }

    initListener()

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel)
      }
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [triggerNotification])

  // Auto-dismiss notification after 8 seconds
  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(() => {
      setNotification(null)
    }, 8000)
    return () => clearTimeout(timer)
  }, [notification])

  if (!notification) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'diproses':
        return <CookingPot className="w-5 h-5 text-orange-600" />
      case 'siap_diambil':
        return <PackageCheck className="w-5 h-5 text-emerald-600" />
      case 'selesai':
        return <CheckCircle2 className="w-5 h-5 text-blue-600" />
      case 'dibatalkan':
        return <AlertOctagon className="w-5 h-5 text-[var(--danger)]" />
      default:
        return <Bell className="w-5 h-5 text-[var(--accent)]" />
    }
  }

  const getStatusBadgeBg = (status: string) => {
    switch (status) {
      case 'diproses':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'siap_diambil':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'selesai':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'dibatalkan':
        return 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20'
      default:
        return 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20'
    }
  }

  return (
    <aside
      aria-label="Notifikasi Pembaruan Pesanan"
      className="fixed top-4 left-4 right-4 z-[9999] max-w-[440px] mx-auto animate-bounce-in"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-[var(--radius-lg)] p-4 shadow-[0_12px_36px_rgba(0,0,0,0.18)] border border-[rgba(232,214,205,0.9)] ring-1 ring-black/5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent-bg)] flex items-center justify-center shrink-0 border border-[var(--accent)]/20 shadow-xs">
              {getStatusIcon(notification.status)}
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`text-[var(--text-caption)] font-sora font-extrabold px-2 py-0.5 rounded-full border ${getStatusBadgeBg(notification.status)}`}>
                  UPDATE PESANAN
                </span>
              </div>
              <h4 className="font-sora font-bold text-xs text-[var(--ink)]">
                {notification.title}
              </h4>
              <p className="text-[var(--text-caption)] text-[var(--ink-soft)] mt-0.5 leading-tight font-medium">
                {notification.message}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 rounded-full text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--paper)] transition-colors shrink-0"
            aria-label="Tutup notifikasi"
          >
            <X size={15} />
          </button>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[var(--line)] flex items-center justify-between">
          <span className="text-[var(--text-caption)] text-[var(--ink-soft)] font-medium">
            Baru saja diperbarui
          </span>
          <Link
            href={`/pesanan/${notification.id}`}
            onClick={() => setNotification(null)}
            className="inline-flex items-center gap-1 text-xs font-sora font-bold text-[var(--accent-2)] hover:underline"
          >
            <span>Buka Detail Pesanan</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </aside>
  )
}

// @ts-nocheck
'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Bell, X, ArrowRight, Volume2, VolumeX } from 'lucide-react'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils'

interface NewOrderNotification {
  id: string
  nama_pemesan: string
  total: number
  created_at: string
}

export default function AdminOrderNotifier() {
  const router = useRouter()
  const [notification, setNotification] = useState<NewOrderNotification | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const lastOrderIdRef = useRef<string | null>(null)
  const lastOrderSignatureRef = useRef<string | null>(null)
  const initialLoadDoneRef = useRef(false)

  // Initialize or resume AudioContext on first tap
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
    if (!soundEnabled) return

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
        gain.gain.setValueAtTime(0.3, startTime)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(startTime)
        osc.stop(startTime + duration)
      }

      const now = ctx.currentTime
      // Cash-register chime: G5 -> C6 -> E6
      playNote(784.0, now, 0.35)
      playNote(1046.5, now + 0.15, 0.45)
      playNote(1318.5, now + 0.32, 0.65)
    } catch (err) {
      console.warn('Audio chime notice:', err)
    }

    // Vibrate phone if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([300, 100, 300])
      } catch {
        // ignore
      }
    }
  }, [soundEnabled])

  // Fire Android Native System Notification & In-app popup
  const fireNotification = useCallback((order: NewOrderNotification) => {
    setNotification(order)
    playChime()
    router.refresh()

    const title = 'Pesanan Baru Masuk! 🎉'
    const body = `Pesanan dari ${order.nama_pemesan || 'Pelanggan'} - Total ${formatRupiah(order.total || 0)}`

    // 1. Android Native Javascript Interface (Triggers Notification Tray on Android Phone!)
    if (typeof window !== 'undefined') {
      const host = window as unknown as {
        AndroidHost?: { showNotification: (t: string, m: string) => void }
        Android?: { showNotification: (t: string, m: string) => void }
      }

      if (host.AndroidHost?.showNotification) {
        try {
          host.AndroidHost.showNotification(title, body)
        } catch (e) {
          console.error('AndroidHost notif error:', e)
        }
      } else if (host.Android?.showNotification) {
        try {
          host.Android.showNotification(title, body)
        } catch (e) {
          console.error('Android notif error:', e)
        }
      } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification(title, { body })
        } catch (e) {
          console.error('Web notification error:', e)
        }
      }
    }
  }, [playChime, router])

  // Real-time listener + Polling Fallback
  useEffect(() => {
    const supabase = createClient()

    // 1. Initial fetch to establish baseline latest order ID
    const initBaseline = async () => {
      try {
        const { data } = await supabase
          .from('orders')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1)
        if (data && data.length > 0) {
          lastOrderIdRef.current = data[0].id
        }
        initialLoadDoneRef.current = true
      } catch (e) {
        console.warn('Init baseline error:', e)
        initialLoadDoneRef.current = true
      }
    }
    initBaseline()

    // 2. Supabase Realtime channel (listen to INSERT, UPDATE, DELETE on orders)
    const channel = supabase
      .channel('admin-realtime-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as NewOrderNotification
            if (newOrder && newOrder.id !== lastOrderIdRef.current) {
              lastOrderIdRef.current = newOrder.id
              fireNotification(newOrder)
            }
          } else {
            // Pada event UPDATE (misal status pesanan diubah ke 'selesai') atau DELETE:
            // Segera refresh router agar ringkasan toko, omset, dan daftar pesanan terupdate otomatis
            router.refresh()
          }
        }
      )
      .subscribe()

    // 3. Fallback Poller every 8s (memastikan data tetap update otomatis meskipun WebSocket sleeping)
    const poller = setInterval(async () => {
      if (!initialLoadDoneRef.current) return
      try {
        const { data } = await supabase
          .from('orders')
          .select('id, nama_pemesan, total, created_at, status, updated_at')
          .order('updated_at', { ascending: false })
          .limit(1)

        if (data && data.length > 0) {
          const latest = data[0]
          const signature = `${latest.id}-${latest.status}-${latest.updated_at}`
          if (lastOrderIdRef.current && latest.id !== lastOrderIdRef.current && latest.created_at === latest.updated_at) {
            lastOrderIdRef.current = latest.id
            fireNotification(latest as NewOrderNotification)
          } else if (lastOrderSignatureRef.current && lastOrderSignatureRef.current !== signature) {
            lastOrderSignatureRef.current = signature
            router.refresh()
          } else if (!lastOrderSignatureRef.current) {
            lastOrderSignatureRef.current = signature
          }
        }
      } catch {
        // network silent retry
      }
    }, 8000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(poller)
    }
  }, [fireNotification])

  return (
    <>
      {/* Floating Control Bar: Suara Bel */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => {
            const next = !soundEnabled
            setSoundEnabled(next)
            if (next) playChime()
          }}
          type="button"
          className="press flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/95 border border-[rgba(232,214,205,0.9)] shadow-lg text-[var(--text-caption)] font-sora font-semibold text-[var(--ink)] backdrop-blur-md active:scale-95 transition-all"
          title={soundEnabled ? 'Matikan suara bel' : 'Aktifkan suara bel'}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Bel Aktif</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-gray-400" />
              <span>Bel Bisu</span>
            </>
          )}
        </button>
      </div>

      {/* Floating Order Alert Banner */}
      {notification && (
        <div className="fixed top-3 left-4 right-4 z-50 max-w-[440px] mx-auto animate-bounce-short">
          <div className="card-3d bg-white border-2 border-[var(--accent)] rounded-[var(--radius-lg)] p-4 shadow-popover flex flex-col gap-2.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[var(--accent-bg)] text-[var(--accent-2)] flex items-center justify-center animate-pulse">
                  <Bell size={18} />
                </span>
                <div>
                  <h4 className="font-sora font-bold text-sm text-[var(--ink)]">Pesanan Baru Masuk! 🎉</h4>
                  <p className="text-xs text-[var(--ink-soft)]">
                    Dari: <strong className="text-[var(--ink)]">{notification.nama_pemesan || 'Pelanggan'}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors"
                aria-label="Tutup"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[rgba(232,214,205,0.6)]">
              <span className="text-xs font-sora font-bold text-[var(--accent-2)]">
                {formatRupiah(notification.total || 0)}
              </span>
              <Link
                href={`/admin/pesanan/${notification.id}`}
                onClick={() => setNotification(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--accent)] text-white text-xs font-sora font-bold shadow-xs hover:brightness-95 active:scale-95 transition-all"
              >
                <span>Buka Pesanan</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

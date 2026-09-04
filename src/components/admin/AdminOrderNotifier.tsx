// @ts-nocheck
'use client'

import { useEffect, useState, useRef } from 'react'
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
  const [hasInteracted, setHasInteracted] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Initialize or resume AudioContext on first user tap/interaction
  useEffect(() => {
    const unlockAudio = () => {
      setHasInteracted(true)
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
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

  const playChime = () => {
    if (!soundEnabled) return

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
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
      // Cash-register chime sequence: G5 -> C6 -> E6
      playNote(784.0, now, 0.35)
      playNote(1046.5, now + 0.15, 0.45)
      playNote(1318.5, now + 0.32, 0.65)
    } catch (err) {
      console.warn('Audio chime notice:', err)
    }

    // Vibrate phone if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([250, 100, 250])
      } catch {
        // ignore
      }
    }
  }

  useEffect(() => {
    const supabase = createClient()

    // Listen to real-time INSERTs on orders table
    const channel = supabase
      .channel('admin-order-notifier')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const newOrder = payload.new as NewOrderNotification
          setNotification(newOrder)
          playChime()
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [soundEnabled, router])

  return (
    <>
      {/* Floating Audio Toggle in header/corner */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => {
            const next = !soundEnabled
            setSoundEnabled(next)
            if (next) playChime()
          }}
          type="button"
          className="press flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/95 border border-[rgba(232,214,205,0.9)] shadow-lg text-[11px] font-sora font-semibold text-[var(--ink)] backdrop-blur-md active:scale-95 transition-all"
          title={soundEnabled ? 'Matikan suara notifikasi' : 'Aktifkan suara notifikasi'}
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
          <div className="card-3d bg-white border-2 border-[var(--accent)] rounded-[20px] p-4 shadow-[0_12px_32px_rgba(255,107,53,0.28)] flex flex-col gap-2.5">
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

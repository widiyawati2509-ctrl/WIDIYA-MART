// @ts-nocheck
'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { RefreshCw, Radio } from 'lucide-react'

export default function AdminDashboardLive() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [lastSync, setLastSync] = useState<string>('')

  const updateSyncTime = () => {
    const now = new Date()
    setLastSync(
      now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' WITA'
    )
  }

  const handleManualRefresh = () => {
    startTransition(() => {
      router.refresh()
      updateSyncTime()
    })
  }

  useEffect(() => {
    updateSyncTime()
    const supabase = createClient()

    // 1. Supabase Realtime: dengarkan perubahan orders (INSERT, UPDATE, DELETE)
    const channel = supabase
      .channel('admin-dashboard-live-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          startTransition(() => {
            router.refresh()
            updateSyncTime()
          })
        }
      )
      .subscribe()

    // 2. Auto-polling setiap 6 detik ketika tab aktif
    const poller = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        startTransition(() => {
          router.refresh()
          updateSyncTime()
        })
      }
    }, 6000)

    // 3. Sinkronisasi instan saat user membuka/berpindah kembali ke tab ini
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startTransition(() => {
          router.refresh()
          updateSyncTime()
        })
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(poller)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router])

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
        <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
        <span>Live Sync {lastSync ? `• ${lastSync}` : ''}</span>
      </div>

      <button
        type="button"
        onClick={handleManualRefresh}
        disabled={isPending}
        className="press flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[rgba(232,214,205,0.9)] shadow-xs hover:border-[var(--accent)] text-[var(--ink)] text-xs font-sora font-semibold transition-all active:scale-95 disabled:opacity-60"
        title="Segarkan Ringkasan Toko Real-Time"
      >
        <RefreshCw size={13} className={`text-[var(--accent-2)] ${isPending ? 'animate-spin' : ''}`} />
        <span className="text-[11px]">{isPending ? 'Memuat...' : 'Segarkan'}</span>
      </button>
    </div>
  )
}

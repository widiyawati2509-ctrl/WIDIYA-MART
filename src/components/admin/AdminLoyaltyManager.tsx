// @ts-nocheck
'use client'

import { useState, useTransition } from 'react'
import { updateLoyaltyConfig, type LoyaltyConfig } from '@/lib/actions/loyalty'
import { formatRupiah } from '@/lib/utils'
import { Coins, Save, Loader2, Sparkles, TrendingUp, History, ShieldCheck } from 'lucide-react'
import AdminPageTitle from './AdminPageTitle'

interface AdminLoyaltyManagerProps {
  config: LoyaltyConfig
  transactions: any[]
}

export default function AdminLoyaltyManager({ config: initialConfig, transactions }: AdminLoyaltyManagerProps) {
  const [config, setConfig] = useState<LoyaltyConfig>(initialConfig)
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await updateLoyaltyConfig(formData)
      if (res.success) {
        setFeedback({ type: 'success', text: 'Pengaturan skema poin berhasil disimpan!' })
      } else {
        setFeedback({ type: 'error', text: res.error || 'Gagal menyimpan pengaturan' })
      }
    })
  }

  const totalEarnedTxs = transactions.filter((t) => t.type === 'earned')
  const totalEarnedPoints = totalEarnedTxs.reduce((sum, t) => sum + (Number(t.points) || 0), 0)
  const totalRedeemedTxs = transactions.filter((t) => t.type === 'redeemed')
  const totalRedeemedPoints = Math.abs(totalRedeemedTxs.reduce((sum, t) => sum + (Number(t.points) || 0), 0))

  return (
    <div className="space-y-4">
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{feedback.text}</span>
          <button type="button" onClick={() => setFeedback(null)}>✕</button>
        </div>
      )}

      {/* Header */}
      <AdminPageTitle
        title="Poin Loyalitas"
        subtitle="Atur perolehan dan rasio tukar poin belanja (fleksibel via database)"
      />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-[20px] p-4 shadow-3d">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={14} />
            </span>
            <span className="text-[11px] font-semibold text-[var(--ink-soft)]">Total Poin Diberikan</span>
          </div>
          <p className="font-sora font-bold text-lg text-[var(--ink)]">
            {totalEarnedPoints.toLocaleString('id-ID')} <span className="text-xs text-[var(--ink-soft)] font-normal">Poin</span>
          </p>
        </div>

        <div className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-[20px] p-4 shadow-3d">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Coins size={14} />
            </span>
            <span className="text-[11px] font-semibold text-[var(--ink-soft)]">Total Poin Ditukar</span>
          </div>
          <p className="font-sora font-bold text-lg text-[var(--accent-2)]">
            {totalRedeemedPoints.toLocaleString('id-ID')} <span className="text-xs text-[var(--ink-soft)] font-normal">Poin</span>
          </p>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-[20px] p-5 shadow-3d">
        <h3 className="font-sora font-bold text-xs text-[var(--ink)] mb-3 flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-[var(--accent)]" />
          Konfigurasi Aturan Loyalitas Toko
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--paper)] border border-[var(--line)]">
            <div>
              <p className="font-bold text-[var(--ink)]">Status Program Loyalitas</p>
              <p className="text-[10.5px] text-[var(--ink-soft)]">Aktifkan atau nonaktifkan perolehan poin belanja</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                value="true"
                defaultChecked={config.is_active}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[var(--ink)] block mb-1">
                Kelipatan Belanja (Rp) *
              </label>
              <input
                type="number"
                name="threshold_amount"
                defaultValue={config.threshold_amount}
                min="1000"
                step="1000"
                required
                className="w-full px-3 py-2 rounded-xl border border-[var(--line)] outline-none focus:border-[var(--accent)]"
              />
              <span className="text-[10px] text-[var(--ink-soft)]">Contoh: Rp 10.000</span>
            </div>

            <div>
              <label className="font-bold text-[var(--ink)] block mb-1">
                Poin per Kelipatan *
              </label>
              <input
                type="number"
                name="points_per_threshold"
                defaultValue={config.points_per_threshold}
                min="1"
                required
                className="w-full px-3 py-2 rounded-xl border border-[var(--line)] outline-none focus:border-[var(--accent)]"
              />
              <span className="text-[10px] text-[var(--ink-soft)]">Contoh: 1 poin</span>
            </div>

            <div>
              <label className="font-bold text-[var(--ink)] block mb-1">
                Nilai Tukar 1 Poin (Rp Diskon) *
              </label>
              <input
                type="number"
                name="redeem_rate"
                defaultValue={config.redeem_rate}
                min="1"
                required
                className="w-full px-3 py-2 rounded-xl border border-[var(--line)] outline-none focus:border-[var(--accent)]"
              />
              <span className="text-[10px] text-[var(--ink-soft)]">Contoh: Rp 100 per 1 poin</span>
            </div>

            <div>
              <label className="font-bold text-[var(--ink)] block mb-1">
                Maksimal Diskon Poin (%) *
              </label>
              <input
                type="number"
                name="max_redeem_percentage"
                defaultValue={config.max_redeem_percentage}
                min="1"
                max="100"
                required
                className="w-full px-3 py-2 rounded-xl border border-[var(--line)] outline-none focus:border-[var(--accent)]"
              />
              <span className="text-[10px] text-[var(--ink-soft)]">Batas diskon per transaksi (contoh: 50%)</span>
            </div>
          </div>

          <div>
            <label className="font-bold text-[var(--ink)] block mb-1">
              Minimal Belanja untuk Peroleh Poin (Rp) *
            </label>
            <input
              type="number"
              name="min_order_amount"
              defaultValue={config.min_order_amount}
              min="0"
              step="1000"
              required
              className="w-full px-3 py-2 rounded-xl border border-[var(--line)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="press w-full py-3 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white font-sora font-bold text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>Simpan Perubahan Skema Poin</span>
            </button>
          </div>
        </form>
      </div>

      {/* Latest Point Transactions Table */}
      <div className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-[20px] p-5 shadow-3d">
        <h3 className="font-sora font-bold text-xs text-[var(--ink)] mb-3 flex items-center gap-1.5">
          <History size={14} className="text-[var(--accent)]" />
          Riwayat Transaksi Poin Pelanggan Terkini
        </h3>

        {transactions.length === 0 ? (
          <p className="text-xs text-[var(--ink-soft)] py-4 text-center">
            Belum ada transaksi poin yang tercatat.
          </p>
        ) : (
          <div className="divide-y divide-gray-100 text-xs">
            {transactions.slice(0, 15).map((t) => (
              <div key={t.id} className="py-2.5 flex items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-[var(--ink)]">{t.description}</p>
                  <p className="text-[10px] text-[var(--ink-soft)] font-medium">
                    {new Date(t.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span
                  className={`font-sora font-bold text-xs px-2.5 py-0.5 rounded-full ${
                    t.points > 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-orange-50 text-orange-700'
                  }`}
                >
                  {t.points > 0 ? `+${t.points}` : t.points} Poin
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

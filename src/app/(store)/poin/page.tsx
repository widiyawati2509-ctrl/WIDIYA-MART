// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import { getUserLoyaltySummary } from '@/lib/actions/loyalty'
import { formatRupiah } from '@/lib/utils'
import { ChevronLeft, Coins, Award, Sparkles, TrendingUp, History, Info } from 'lucide-react'

export const metadata = {
  title: 'Poin Saya | PENGENJEK MART',
}

export default async function PoinPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/masuk')

  const summary = await getUserLoyaltySummary(user.id)
  const totalPoints = summary?.totalPoints ?? 0
  const redeemValue = summary?.redeemValue ?? 0
  const config = summary?.config
  const transactions = summary?.transactions ?? []

  return (
    <div className="w-full pb-28">
      {/* Top Header */}
      <PageHeader
        title="Poin Saya"
        subtitle="Program Loyalitas Toko"
        showBack={true}
        backHref="/profil"
        rightSlot={
          <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
            <Coins size={16} />
          </span>
        }
      />

      <div className="p-4 space-y-3.5">
        {/* Main Points Card */}
        <div className="card-3d bg-gradient-to-br from-[#2B1810] via-[#3D2117] to-[#1E0F0A] text-white rounded-[var(--radius-xl)] p-5 shadow-[0_12px_28px_-4px_rgba(43,24,16,0.4)] border border-amber-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-orange-500/0 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[var(--text-caption)] font-sora font-bold uppercase tracking-wider">
              <Sparkles size={12} /> Saldo Poin Belanja
            </span>
            <span className="text-[var(--text-caption)] text-amber-200/80 font-medium">PENGENJEK MART</span>
          </div>

          <div className="relative z-10 mb-4">
            <div className="flex items-baseline gap-2">
              <span className="font-sora font-extrabold text-4xl text-amber-400 tabular-nums">
                {totalPoints.toLocaleString('id-ID')}
              </span>
              <span className="font-sora font-bold text-base text-amber-200">Poin</span>
            </div>
            <p className="text-xs text-white/80 font-medium mt-1">
              Bisa ditukar diskon belanja senilai{' '}
              <strong className="text-white underline font-bold">{formatRupiah(redeemValue)}</strong>
            </p>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[var(--text-caption)] text-white/70 relative z-10">
            <span>Rasio: 1 Poin = {formatRupiah(config?.redeem_rate ?? 100)}</span>
            <Link
              href="/"
              className="press px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-sora font-bold text-[var(--text-caption)] shadow-xs active:scale-95"
            >
              Belanja Sekarang &rarr;
            </Link>
          </div>
        </div>

        {/* How It Works Card */}
        <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] p-4 shadow-3d space-y-2.5">
          <h2 className="font-sora font-bold text-xs text-[var(--ink)] flex items-center gap-1.5">
            <Info size={14} className="text-[var(--accent)]" />
            Cara Kerja Poin Loyalitas
          </h2>
          <div className="space-y-2 text-[var(--text-small)] text-[var(--ink-soft)] leading-relaxed font-medium">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[var(--text-caption)] font-bold shrink-0 mt-0.5">
                1
              </span>
              <p>
                Belanja pesanan COD minimal <strong>{formatRupiah(config?.min_order_amount ?? 10000)}</strong>.
                Tiap kelipatan <strong>{formatRupiah(config?.threshold_amount ?? 10000)}</strong> Anda otomatis memperoleh <strong>{config?.points_per_threshold ?? 1} Poin</strong> setelah pesanan diselesaikan di toko.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[var(--text-caption)] font-bold shrink-0 mt-0.5">
                2
              </span>
              <p>
                Saat Checkout pesanan berikutnya, centang opsi <strong>"Tukar Poin"</strong> untuk langsung mendapatkan potongan diskon tagihan tunai hingga {config?.max_redeem_percentage ?? 50}%.
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-lg)] p-4 shadow-3d">
          <h2 className="font-sora font-bold text-xs text-[var(--ink)] mb-3 flex items-center gap-1.5">
            <History size={14} className="text-[var(--accent)]" />
            Riwayat Poin
          </h2>

          {transactions.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--ink-soft)]">
              Belum ada riwayat perolehan atau penggunaan poin. Selesaikan transaksi COD pertama Anda untuk mulai mengumpulkan poin!
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map((tx) => {
                const isEarned = tx.points > 0
                return (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-[var(--ink)]">{tx.description}</p>
                      <p className="text-[var(--text-caption)] text-[var(--ink-soft)] mt-0.5 font-medium">
                        {new Date(tx.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span
                      className={`font-sora font-bold text-xs px-2.5 py-1 rounded-full shrink-0 ${
                        isEarned
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-orange-50 text-orange-700 border border-orange-200'
                      }`}
                    >
                      {isEarned ? `+${tx.points}` : tx.points} Poin
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

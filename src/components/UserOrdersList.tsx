// @ts-nocheck
'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import {
  formatRupiah,
  getOrderStatusLabel,
  getOrderStatusColor,
  formatBatasWaktu,
  getPickupCountdown,
} from '@/lib/utils'
import { deleteOrders, deleteAllOrders, deleteSingleOrder, reorderItems } from '@/lib/actions/orders'
import {
  Package,
  ChevronRight,
  Trash2,
  CheckSquare,
  Square,
  MinusSquare,
  AlertTriangle,
  Loader2,
  X,
  RotateCcw,
  Clock,
  Truck,
  CheckCircle2,
  Search,
  ExternalLink,
} from 'lucide-react'
import { EmptyState } from '@/components/ui'

interface OrderItem {
  id: string
  nama_produk: string
  qty: number
  harga_saat_beli: number
}

interface Order {
  id: string
  created_at: string
  status: string
  total: number
  metode_pengiriman?: string
  alamat_pengiriman?: string
  estimasi_menit?: number | null
  batas_waktu_ambil?: string | null
  order_items: OrderItem[]
}

interface UserOrdersListProps {
  initialOrders: Order[]
}

const statusTabs = [
  { id: 'all', label: 'Semua' },
  { id: 'menunggu_diproses', label: 'Menunggu' },
  { id: 'diproses', label: 'Diproses' },
  { id: 'siap_diambil', label: 'Diantar / Siap' },
  { id: 'selesai', label: 'Selesai' },
  { id: 'dibatalkan', label: 'Batal' },
]

export default function UserOrdersList({ initialOrders }: UserOrdersListProps) {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [activeTab, setActiveTab] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [reorderingId, setReorderingId] = useState<string | null>(null)

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    mode: 'selected' | 'all' | 'single'
    targetId?: string
    count?: number
  }>({
    isOpen: false,
    mode: 'selected',
  })
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  // Filter orders according to active tab and search query
  const filteredOrders = orders.filter((order) => {
    let matchesTab = true
    if (activeTab === 'dibatalkan') {
      matchesTab = order.status === 'dibatalkan' || order.status === 'tidak_diambil'
    } else if (activeTab !== 'all') {
      matchesTab = order.status === activeTab
    }

    let matchesQuery = true
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const matchesId = order.id.toLowerCase().includes(q)
      const matchesItems = order.order_items?.some((i) => i.nama_produk.toLowerCase().includes(q))
      matchesQuery = matchesId || Boolean(matchesItems)
    }

    return matchesTab && matchesQuery
  })

  // Counts for tabs
  const tabCounts: Record<string, number> = {
    all: orders.length,
    menunggu_diproses: orders.filter((o) => o.status === 'menunggu_diproses').length,
    diproses: orders.filter((o) => o.status === 'diproses').length,
    siap_diambil: orders.filter((o) => o.status === 'siap_diambil').length,
    selesai: orders.filter((o) => o.status === 'selesai').length,
    dibatalkan: orders.filter((o) => o.status === 'dibatalkan' || o.status === 'tidak_diambil').length,
  }

  const allSelected =
    filteredOrders.length > 0 && filteredOrders.every((o) => selectedIds.has(o.id))
  const someSelected =
    filteredOrders.some((o) => selectedIds.has(o.id)) && !allSelected

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredOrders.map((o) => o.id)))
    }
  }

  const handleToggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const executeDelete = () => {
    startTransition(async () => {
      let res
      if (confirmModal.mode === 'single' && confirmModal.targetId) {
        res = await deleteSingleOrder(confirmModal.targetId)
        if (res.success) {
          setOrders((prev) => prev.filter((o) => o.id !== confirmModal.targetId))
          setSelectedIds((prev) => {
            const next = new Set(prev)
            next.delete(confirmModal.targetId!)
            return next
          })
          setFeedbackMsg({ type: 'success', text: 'Riwayat pesanan berhasil dihapus.' })
        }
      } else if (confirmModal.mode === 'all') {
        res = await deleteAllOrders('mine')
        if (res.success) {
          setOrders([])
          setSelectedIds(new Set())
          setIsSelectMode(false)
          setFeedbackMsg({ type: 'success', text: 'Semua riwayat pesanan berhasil dihapus.' })
        }
      } else {
        const idsToDelete = Array.from(selectedIds)
        res = await deleteOrders(idsToDelete)
        if (res.success) {
          setOrders((prev) => prev.filter((o) => !selectedIds.has(o.id)))
          setSelectedIds(new Set())
          setIsSelectMode(false)
          setFeedbackMsg({
            type: 'success',
            text: `${idsToDelete.length} riwayat pesanan berhasil dihapus.`,
          })
        }
      }

      if (res?.error) {
        setFeedbackMsg({ type: 'error', text: res.error })
      }

      setConfirmModal({ isOpen: false, mode: 'selected' })
      router.refresh()

      setTimeout(() => {
        setFeedbackMsg(null)
      }, 4000)
    })
  }

  // Helper for tracking stage index
  const getStageIndex = (status: string) => {
    switch (status) {
      case 'menunggu_diproses':
        return 0
      case 'diproses':
        return 1
      case 'siap_diambil':
        return 2
      case 'selesai':
        return 3
      default:
        return -1
    }
  }

  return (
    <div className="space-y-3">
      {/* Top Header */}
      <PageHeader
        title="Riwayat Pesanan"
        subtitle={orders.length > 0 ? `${orders.length} total transaksi` : 'Lacak status pesanan'}
        rightSlot={
          orders.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                const next = !isSelectMode
                setIsSelectMode(next)
                if (!next) setSelectedIds(new Set())
              }}
              className={`press px-3 py-1.5 rounded-full text-xs font-sora font-semibold transition-all ${
                isSelectMode
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'bg-white/80 border border-[rgba(232,214,205,0.9)] text-[var(--ink-soft)] hover:bg-white'
              }`}
            >
              {isSelectMode ? 'Batal' : 'Pilih / Hapus'}
            </button>
          ) : null
        }
      />

      {/* Status Filter Tab Bar (Shopee / Tokopedia Style) */}
      <div className="px-4">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide py-1">
          {statusTabs.map((tab) => {
            const isActive = activeTab === tab.id
            const count = tabCounts[tab.id] || 0

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`press shrink-0 px-3 py-1.5 rounded-full text-xs font-sora font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'bg-white border border-[rgba(232,214,205,0.9)] text-[var(--ink-soft)] hover:text-[var(--ink)]'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-[var(--paper)] text-[var(--ink-soft)]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Search Filter for Orders */}
      {orders.length > 3 && (
        <div className="px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--ink-soft)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID pesanan atau nama produk..."
              className="w-full text-xs pl-9 pr-8 py-2 rounded-xl bg-white border border-[rgba(232,214,205,0.9)] text-[var(--ink)] outline-hidden focus:border-[var(--accent)] transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] hover:text-[var(--ink)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="px-4">
          <div
            className={`p-3 rounded-2xl text-xs font-medium flex items-center justify-between shadow-sm animate-bounce-short ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)]'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="p-1 text-[var(--ink-soft)] hover:text-[var(--ink)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Batch Select Toolbar when Selection Mode active */}
      {filteredOrders.length > 0 && isSelectMode && (
        <div className="px-4">
          <div className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-2xl p-3 shadow-3d flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="press flex items-center gap-2 text-xs font-sora font-semibold text-[var(--ink)] cursor-pointer"
            >
              {allSelected ? (
                <CheckSquare className="w-5 h-5 text-[var(--accent)]" />
              ) : someSelected ? (
                <MinusSquare className="w-5 h-5 text-[var(--accent)]" />
              ) : (
                <Square className="w-5 h-5 text-[var(--line)]" />
              )}
              <span>Pilih Semua ({filteredOrders.length})</span>
            </button>

            <div className="flex items-center gap-2">
              {selectedIds.size > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      mode: 'selected',
                      count: selectedIds.size,
                    })
                  }}
                  disabled={isPending}
                  className="press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--danger)] hover:brightness-95 text-white text-xs font-sora font-bold shadow-md active:scale-95 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus ({selectedIds.size})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      mode: 'all',
                      count: orders.length,
                    })
                  }}
                  disabled={isPending}
                  className="text-xs text-[var(--danger)] hover:brightness-90 font-semibold px-2 py-1 rounded-lg"
                >
                  Hapus Semua
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="px-4">
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={Package}
            message={
              activeTab !== 'all'
                ? `Tidak ada pesanan dengan status "${statusTabs.find((t) => t.id === activeTab)?.label}".`
                : searchQuery
                ? `Tidak ada riwayat pesanan yang cocok dengan "${searchQuery}".`
                : 'Kamu belum memiliki riwayat pesanan.'
            }
            actionHref="/"
            actionLabel="Mulai Belanja"
          />
        ) : (
          <div className="space-y-2.5">
            {filteredOrders.map((order) => {
              const isSelected = selectedIds.has(order.id)
              const stageIdx = getStageIndex(order.status)
              const isDelivery = order.metode_pengiriman === 'antar_alamat'

              return (
                <div
                  key={order.id}
                  className={`card-3d bg-card border rounded-[var(--radius-lg)] transition-all overflow-hidden relative shadow-3d ${
                    isSelected
                      ? 'border-[var(--accent)] bg-orange-50/40'
                      : 'border-[rgba(232,214,205,0.9)] hover:border-[var(--accent)]'
                  }`}
                >
                  <div className="flex items-start">
                    {/* Checkbox baris saat select mode */}
                    {isSelectMode && (
                      <div
                        onClick={(e) => handleToggleSelectOne(order.id, e)}
                        className="py-3 pl-3 pr-1 cursor-pointer select-none flex items-center justify-center self-stretch"
                        title="Pilih pesanan ini"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-[var(--accent)]" />
                        ) : (
                          <Square className="w-5 h-5 text-[var(--line)] hover:text-[var(--ink-soft)]" />
                        )}
                      </div>
                    )}

                    <div className="flex-1 min-w-0 p-3">
                      <Link
                        href={isSelectMode ? '#' : `/pesanan/${order.id}`}
                        onClick={(e) => {
                          if (isSelectMode) {
                            e.preventDefault()
                            handleToggleSelectOne(order.id, e)
                          }
                        }}
                        className="block press"
                      >
                        {/* Header kartu */}
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-sora font-extrabold text-[var(--ink)]">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="text-[10px] text-[var(--ink-soft)]">
                              &bull;{' '}
                              {new Date(order.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getOrderStatusColor(
                                order.status,
                                order.metode_pengiriman
                              )}`}
                            >
                              {getOrderStatusLabel(order.status, order.metode_pengiriman)}
                            </span>
                            {!isSelectMode && (
                              <ChevronRight size={14} className="text-[var(--ink-soft)]" />
                            )}
                          </div>
                        </div>

                        {/* Visual Tracking Mini-Stepper (Menunggu -> Diproses -> Diantar / Siap -> Selesai) */}
                        {stageIdx >= 0 && (
                          <div className="mb-2.5 p-2 bg-[var(--paper)] rounded-xl border border-[var(--line)]">
                            <div className="flex items-center justify-between relative px-1">
                              {/* Connector line */}
                              <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-0.5 bg-[var(--line)] -z-0" />
                              <div
                                className="absolute left-3 top-1/2 -translate-y-1/2 h-0.5 bg-[var(--accent)] -z-0 transition-all duration-300"
                                style={{ width: `${(stageIdx / 3) * 100}%` }}
                              />

                              {['Menunggu', 'Diproses', isDelivery ? 'Diantar' : 'Siap Ambil', 'Selesai'].map(
                                (stepLabel, i) => {
                                  const isCompleted = i < stageIdx
                                  const isCurrent = i === stageIdx
                                  return (
                                    <div
                                      key={stepLabel}
                                      className="flex flex-col items-center z-10"
                                    >
                                      <div
                                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold transition-all ${
                                          isCompleted
                                            ? 'bg-[var(--accent)] text-white'
                                            : isCurrent
                                            ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white ring-2 ring-orange-200'
                                            : 'bg-white border border-[var(--line)] text-[var(--ink-soft)]'
                                        }`}
                                      >
                                        {isCompleted ? '✓' : i + 1}
                                      </div>
                                      <span
                                        className={`text-[9px] mt-1 font-semibold leading-none ${
                                          isCurrent
                                            ? 'text-[var(--accent-2)] font-bold'
                                            : isCompleted
                                            ? 'text-[var(--ink)]'
                                            : 'text-[var(--ink-soft)]'
                                        }`}
                                      >
                                        {stepLabel}
                                      </span>
                                    </div>
                                  )
                                }
                              )}
                            </div>
                          </div>
                        )}

                        {/* Pengantaran aktif alert */}
                        {order.status === 'siap_diambil' && isDelivery && (
                          <div className="mb-2 p-2 rounded-xl bg-blue-50 border border-blue-200/80 text-[11px] text-blue-900 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-semibold">
                              <Truck size={13} className="text-blue-700 shrink-0" />
                              <span>Sedang Diantar ke Alamat Anda</span>
                            </div>
                            {order.estimasi_menit && (
                              <span className="font-bold text-blue-800 bg-blue-200/80 px-2 py-0.5 rounded-md text-[10px]">
                                ±{order.estimasi_menit} mnt
                              </span>
                            )}
                          </div>
                        )}

                        {/* Pickup Deadline alert */}
                        {order.status === 'siap_diambil' && !isDelivery && order.batas_waktu_ambil && (
                          <div className="mb-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-900 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-semibold">
                              <Clock size={13} className="text-emerald-700 shrink-0" />
                              <span>Ambil s/d {formatBatasWaktu(order.batas_waktu_ambil)}</span>
                            </div>
                            <span className="font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-md text-[10px]">
                              {getPickupCountdown(order.batas_waktu_ambil).text}
                            </span>
                          </div>
                        )}

                        {/* Items summary */}
                        <p className="text-xs text-[var(--ink-soft)] leading-relaxed line-clamp-2 mb-2 font-medium">
                          {order.order_items?.map((i) => `${i.nama_produk} (${i.qty})`).join(', ') ||
                            'Rincian produk'}
                        </p>

                        {/* Total Tagihan */}
                        <div className="receipt-dashed pt-2 flex justify-between items-center text-xs">
                          <span className="text-[var(--ink-soft)] font-medium">
                            Total Pembayaran (COD)
                          </span>
                          <span className="font-sora font-bold text-[var(--accent-2)] text-sm tabular-nums">
                            {formatRupiah(order.total)}
                          </span>
                        </div>
                      </Link>

                      {/* Tombol Aksi: Lacak Status, Beli Lagi, Hapus */}
                      {!isSelectMode && (
                        <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/pesanan/${order.id}`}
                              className="press inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-[rgba(232,214,205,0.9)] hover:border-[var(--accent)] text-[var(--ink)] font-sora font-bold text-xs shadow-2xs transition-all"
                            >
                              <ExternalLink size={12} className="text-[var(--accent)]" />
                              <span>Lacak / Detail</span>
                            </Link>

                            <button
                              type="button"
                              onClick={async (e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setReorderingId(order.id)
                                try {
                                  const res = await reorderItems(order.id)
                                  if (res.success) {
                                    setFeedbackMsg({
                                      type: 'success',
                                      text: `${res.count} produk berhasil dimasukkan ke keranjang!`,
                                    })
                                    router.push('/keranjang')
                                  } else {
                                    setFeedbackMsg({
                                      type: 'error',
                                      text: res.error || 'Gagal menambahkan produk',
                                    })
                                  }
                                } catch {
                                  setFeedbackMsg({ type: 'error', text: 'Terjadi kesalahan sistem' })
                                } finally {
                                  setReorderingId(null)
                                }
                              }}
                              disabled={reorderingId === order.id}
                              className="press inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[var(--accent-bg)] text-[var(--accent-2)] hover:bg-[var(--accent)] hover:text-white font-sora font-bold text-xs shadow-2xs transition-all"
                            >
                              {reorderingId === order.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <RotateCcw className="w-3.5 h-3.5" />
                              )}
                              <span>Beli Lagi</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setConfirmModal({
                                isOpen: true,
                                mode: 'single',
                                targetId: order.id,
                              })
                            }}
                            className="press p-1.5 text-[var(--ink-soft)] hover:text-[var(--danger)] hover:bg-[var(--paper)] rounded-lg transition-colors"
                            title="Hapus riwayat pesanan"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Confirmation Delete Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300">
          <div className="card-3d bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[rgba(232,214,205,0.9)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-bg)] text-[var(--danger)] flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-sora font-bold text-base text-[var(--ink)]">
                {confirmModal.mode === 'all'
                  ? 'Hapus Semua Riwayat Pesanan?'
                  : confirmModal.mode === 'selected'
                  ? `Hapus ${confirmModal.count} Pesanan Terpilih?`
                  : 'Hapus Riwayat Pesanan Ini?'}
              </h3>
              <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                Tindakan ini akan menghapus riwayat transaksi dari daftar pesanan Anda.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, mode: 'selected' })}
                disabled={isPending}
                className="cancel-btn w-full py-2.5 text-xs font-sora font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={isPending}
                className="w-full py-2.5 rounded-xl bg-[var(--danger)] hover:brightness-95 text-white text-xs font-sora font-bold shadow-md inline-flex items-center justify-center gap-1.5 transition-all"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

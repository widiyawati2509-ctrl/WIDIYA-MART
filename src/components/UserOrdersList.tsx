// @ts-nocheck
'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import { formatRupiah, getOrderStatusLabel } from '@/lib/utils'
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
  SlidersHorizontal,
  RotateCcw
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
  order_items: OrderItem[]
}

interface UserOrdersListProps {
  initialOrders: Order[]
}

export default function UserOrdersList({ initialOrders }: UserOrdersListProps) {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>(initialOrders)
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

  // Sync if initialOrders changes
  if (initialOrders !== orders && initialOrders.length !== orders.length) {
    setOrders(initialOrders)
  }

  const allSelected = orders.length > 0 && orders.every((o) => selectedIds.has(o.id))
  const someSelected = orders.some((o) => selectedIds.has(o.id)) && !allSelected

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)))
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

  const handleClearSelection = () => {
    setSelectedIds(new Set())
    setIsSelectMode(false)
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
            text: `${idsToDelete.length} riwayat pesanan berhasil dihapus.` 
          })
        }
      }

      if (res.error) {
        setFeedbackMsg({ type: 'error', text: res.error })
      }

      setConfirmModal({ isOpen: false, mode: 'selected' })
      router.refresh()

      setTimeout(() => {
        setFeedbackMsg(null)
      }, 4000)
    })
  }

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <PageHeader
        title="Pesanan Saya"
        subtitle={orders.length > 0 ? `${orders.length} riwayat pesanan` : 'Lacak status pesanan'}
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

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="px-4">
          <div
            className={`p-3 rounded-2xl text-xs font-medium flex items-center justify-between shadow-sm animate-bounce-short ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="p-1 text-gray-500 hover:text-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Batch Select Toolbar when Selection Mode or Checkbox active */}
      {orders.length > 0 && isSelectMode && (
        <div className="px-4">
          <div className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-2xl p-3 shadow-3d flex items-center justify-between gap-2">
            {/* Kotak Centang Pilih Semua */}
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
                <Square className="w-5 h-5 text-gray-400" />
              )}
              <span>Pilih Semua ({orders.length})</span>
            </button>

            {/* Tombol Aksi Hapus */}
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
                  className="press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-sora font-bold shadow-md active:scale-95 transition-all"
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
                  className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1 rounded-lg"
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
        {orders.length === 0 ? (
          <EmptyState
            icon={Package}
            message="Kamu belum memiliki riwayat pesanan."
            actionHref="/"
            actionLabel="Mulai Belanja"
          />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const isSelected = selectedIds.has(order.id)

              return (
                <div
                  key={order.id}
                  className={`card-3d bg-card border rounded-[20px] transition-all overflow-hidden relative shadow-3d ${
                    isSelected
                      ? 'border-[var(--accent)] bg-orange-50/40'
                      : 'border-[rgba(232,214,205,0.9)] hover:border-[var(--accent)]'
                  }`}
                >
                  <div className="flex items-start">
                    {/* Kotak Centang Baris (Saat Select Mode Aktif) */}
                    {isSelectMode && (
                      <div
                        onClick={(e) => handleToggleSelectOne(order.id, e)}
                        className="p-4 pr-1 cursor-pointer select-none flex items-center justify-center self-stretch"
                        title="Pilih pesanan ini"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-[var(--accent)]" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-300 hover:text-gray-500" />
                        )}
                      </div>
                    )}

                    {/* Order Info (Click opens details unless in select mode) */}
                    <div className="flex-1 min-w-0 p-4">
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
                          <span className="text-xs font-semibold text-[var(--ink-soft)]">
                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10.5px] font-bold bg-[var(--accent-bg)] text-[var(--accent-2)] px-2.5 py-0.5 rounded-full">
                              {getOrderStatusLabel(order.status)}
                            </span>
                            {!isSelectMode && (
                              <ChevronRight size={14} className="text-[var(--ink-soft)]" />
                            )}
                          </div>
                        </div>

                        {/* Items summary */}
                        <p className="text-xs text-[var(--ink-soft)] leading-relaxed line-clamp-2 mb-2 font-medium">
                          {order.order_items?.map((i) => `${i.nama_produk} (${i.qty})`).join(', ') ||
                            'Rincian pesanan'}
                        </p>

                        {/* Total Pesanan */}
                        <div className="receipt-dashed pt-2.5 flex justify-between items-center text-xs">
                          <span className="text-[var(--ink-soft)] font-medium">
                            Total Pesanan
                          </span>
                          <span className="font-sora font-bold text-[var(--accent-2)] text-sm tabular-nums">
                            {formatRupiah(order.total)}
                          </span>
                        </div>
                      </Link>

                      {/* Tombol Aksi: Beli Lagi + Hapus Satuan Cepat */}
                      {!isSelectMode && (
                        <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
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
                                    text: `${res.count} produk berhasil ditambahkan ke keranjang!`,
                                  })
                                  router.push('/keranjang')
                                } else {
                                  setFeedbackMsg({
                                    type: 'error',
                                    text: res.error || 'Gagal menambahkan produk ke keranjang',
                                  })
                                }
                              } catch {
                                setFeedbackMsg({ type: 'error', text: 'Terjadi kesalahan sistem' })
                              } finally {
                                setReorderingId(null)
                              }
                            }}
                            disabled={reorderingId === order.id}
                            className="press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent-bg)] text-[var(--accent-2)] hover:bg-[var(--accent)] hover:text-white font-sora font-bold text-xs shadow-xs active:scale-95 transition-all"
                            title="Beli produk dalam pesanan ini lagi"
                          >
                            {reorderingId === order.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3.5 h-3.5" />
                            )}
                            <span>Beli Lagi</span>
                          </button>

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
                            className="press inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-all active:scale-95"
                            title="Hapus dari riwayat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Riwayat</span>
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

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="card-3d bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[rgba(232,214,205,0.9)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
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
                className="w-full py-2.5 rounded-xl border border-[var(--line)] text-xs font-sora font-semibold text-[var(--ink-soft)] hover:bg-[var(--paper)] transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={isPending}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-sora font-bold shadow-md inline-flex items-center justify-center gap-1.5 transition-all"
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

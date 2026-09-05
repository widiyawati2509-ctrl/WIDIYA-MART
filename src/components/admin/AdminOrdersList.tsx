// @ts-nocheck
'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  formatRupiah, 
  getOrderStatusLabel, 
  getOrderStatusColor 
} from '@/lib/utils'
import { 
  deleteOrders, 
  deleteAllOrders, 
  deleteSingleOrder 
} from '@/lib/actions/orders'
import { 
  Search, 
  Trash2, 
  CheckSquare, 
  Square, 
  MinusSquare,
  AlertTriangle, 
  ChevronRight, 
  Loader2, 
  X,
  PackageOpen,
  Filter
} from 'lucide-react'
import AdminPageTitle from './AdminPageTitle'

interface OrderItem {
  count?: number
}

interface Order {
  id: string
  nama_pemesan: string
  no_hp_pemesan: string
  total: number
  status: string
  created_at: string
  order_items?: OrderItem[]
}

interface AdminOrdersListProps {
  initialOrders: Order[]
  initialStatus?: string
}

const statusFilters = [
  { value: 'all', label: 'Semua' },
  { value: 'menunggu_diproses', label: 'Menunggu' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'siap_diambil', label: 'Siap Diambil' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'dibatalkan', label: 'Dibatalkan' },
]

export default function AdminOrdersList({ initialOrders, initialStatus }: AdminOrdersListProps) {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(initialStatus || 'all')
  const [isPending, startTransition] = useTransition()

  // Modal confirm state
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

  // Sync state if initialOrders prop changes
  if (initialOrders !== orders && initialOrders.length !== orders.length) {
    setOrders(initialOrders)
  }

  // Filter orders based on search & status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.nama_pemesan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.no_hp_pemesan.includes(searchQuery) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Selection helpers
  const allFilteredSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((o) => selectedIds.has(o.id))

  const someFilteredSelected =
    filteredOrders.some((o) => selectedIds.has(o.id)) && !allFilteredSelected

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      // Unselect all currently filtered
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filteredOrders.forEach((o) => next.delete(o.id))
        return next
      })
    } else {
      // Select all currently filtered
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filteredOrders.forEach((o) => next.add(o.id))
        return next
      })
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
  }

  // Execute Deletion
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
          setFeedbackMsg({ type: 'success', text: '1 riwayat transaksi berhasil dihapus.' })
        }
      } else if (confirmModal.mode === 'all') {
        res = await deleteAllOrders('all')
        if (res.success) {
          setOrders([])
          setSelectedIds(new Set())
          setFeedbackMsg({ type: 'success', text: 'Semua riwayat transaksi berhasil dihapus.' })
        }
      } else {
        // 'selected'
        const idsToDelete = Array.from(selectedIds)
        res = await deleteOrders(idsToDelete)
        if (res.success) {
          setOrders((prev) => prev.filter((o) => !selectedIds.has(o.id)))
          setSelectedIds(new Set())
          setFeedbackMsg({ 
            type: 'success', 
            text: `${idsToDelete.length} riwayat transaksi berhasil dihapus.` 
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
      {/* Header & Page Title */}
      <AdminPageTitle
        title="Kelola Pesanan"
        subtitle={`Total ${orders.length} riwayat transaksi masuk`}
        className="mb-0"
        rightSlot={
          orders.length > 0 ? (
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
              className="self-start sm:self-auto press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-sora font-semibold transition-all active:scale-95"
              title="Hapus seluruh riwayat pesanan"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua Riwayat</span>
            </button>
          ) : null
        }
      />

      {/* Notification Toast */}
      {feedbackMsg && (
        <div
          className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between animate-bounce-short ${
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
      )}

      {/* Filter and Search Bar */}
      <div className="card-3d bg-card border border-[rgba(232,214,205,0.9)] rounded-[20px] p-3 shadow-3d space-y-3">
        {/* Kasir Quick Access: Pesanan Siap Diambil */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'siap_diambil' ? 'all' : 'siap_diambil')}
          className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
            statusFilter === 'siap_diambil'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-400'
              : 'bg-emerald-50/80 text-emerald-950 border-emerald-200/80 hover:bg-emerald-100/70'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
              statusFilter === 'siap_diambil' ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-800'
            }`}>
              ⚡
            </span>
            <div>
              <p className="font-sora font-bold text-xs leading-tight">
                Pesanan Siap Diambil (Kasir)
              </p>
              <p className={`text-[10px] font-medium ${statusFilter === 'siap_diambil' ? 'text-emerald-100' : 'text-emerald-700'}`}>
                Filter cepat untuk pembeli yang tiba di toko
              </p>
            </div>
          </div>
          <span className={`font-sora font-extrabold text-xs px-2 py-0.5 rounded-full ${
            statusFilter === 'siap_diambil'
              ? 'bg-white text-emerald-800'
              : 'bg-emerald-600 text-white'
          }`}>
            {orders.filter((o) => o.status === 'siap_diambil').length}
          </span>
        </button>

        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama pemesan, no HP, atau ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-[var(--paper)]/60 rounded-xl text-xs text-[var(--ink)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] border border-[rgba(232,214,205,0.6)]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          {statusFilters.map((f) => {
            const count = f.value === 'all' ? orders.length : orders.filter((o) => o.status === f.value).length
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={`press whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  statusFilter === f.value
                    ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white shadow-xs'
                    : 'bg-[var(--paper)] text-[var(--ink-soft)] hover:bg-[var(--line)]/50'
                }`}
              >
                <span>{f.label}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    statusFilter === f.value ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Batch Actions Toolbar (Kotak Centang & Hapus Terpilih) */}
      <div className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-2xl p-3 shadow-3d flex flex-wrap items-center justify-between gap-2.5">
        {/* Checkbox Pilih Semua */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSelectAll}
            disabled={filteredOrders.length === 0}
            className="press flex items-center gap-2 text-xs font-sora font-semibold text-[var(--ink)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {allFilteredSelected ? (
              <CheckSquare className="w-5 h-5 text-[var(--accent)]" />
            ) : someFilteredSelected ? (
              <MinusSquare className="w-5 h-5 text-[var(--accent)]" />
            ) : (
              <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            )}
            <span>Pilih Semua {filteredOrders.length > 0 ? `(${filteredOrders.length})` : ''}</span>
          </button>

          {selectedIds.size > 0 && (
            <span className="text-[11px] font-bold bg-[var(--accent-bg)] text-[var(--accent-2)] px-2 py-0.5 rounded-full">
              {selectedIds.size} dipilih
            </span>
          )}
        </div>

        {/* Action Button: Hapus Terpilih */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg"
            >
              Batal
            </button>
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
              <span>Hapus Terpilih ({selectedIds.size})</span>
            </button>
          </div>
        )}
      </div>

      {/* Orders List with Checkboxes */}
      <div className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-2xl overflow-hidden shadow-3d divide-y divide-gray-100">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-14 px-4 space-y-2">
            <PackageOpen className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="font-sora font-semibold text-sm text-[var(--ink)]">
              {searchQuery || statusFilter !== 'all'
                ? 'Tidak ada pesanan yang sesuai kriteria'
                : 'Belum ada riwayat transaksi'}
            </p>
            <p className="text-xs text-[var(--ink-soft)]">
              Transaksi baru yang masuk akan muncul secara otomatis di sini.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isSelected = selectedIds.has(order.id)

            return (
              <div
                key={order.id}
                className={`flex items-center transition-colors ${
                  isSelected ? 'bg-orange-50/70' : 'hover:bg-gray-50/80'
                }`}
              >
                {/* Checkbox Baris */}
                <div
                  onClick={(e) => handleToggleSelectOne(order.id, e)}
                  className="pl-4 pr-2 py-4 cursor-pointer select-none flex items-center justify-center"
                  title="Pilih transaksi ini"
                >
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-[var(--accent)]" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-300 hover:text-gray-500" />
                  )}
                </div>

                {/* Konten Transaksi (Klik untuk buka detail) */}
                <Link
                  href={`/admin/pesanan/${order.id}`}
                  className="flex-1 min-w-0 py-3.5 pr-2 flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-sora font-bold text-sm text-[var(--ink)] truncate">
                        {order.nama_pemesan}
                      </p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getOrderStatusColor(
                          order.status
                        )}`}
                      >
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--ink-soft)] font-medium">
                      #{order.id.slice(0, 8).toUpperCase()} ·{' '}
                      {new Date(order.created_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                      WA: {order.no_hp_pemesan}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-sora font-bold text-sm text-[var(--accent-2)]">
                      {formatRupiah(order.total)}
                    </p>
                  </div>
                </Link>

                {/* Tombol Hapus Satuan Cepat */}
                <div className="pr-3 pl-1 flex items-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setConfirmModal({
                        isOpen: true,
                        mode: 'single',
                        targetId: order.id,
                      })
                    }}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 active:scale-95 transition-all"
                    title="Hapus transaksi ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/admin/pesanan/${order.id}`}
                    className="p-1 text-gray-300 hover:text-gray-600"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal Konfirmasi Hapus */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="card-3d bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[rgba(232,214,205,0.9)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-sora font-bold text-base text-[var(--ink)]">
                {confirmModal.mode === 'all'
                  ? 'Hapus Semua Riwayat Transaksi?'
                  : confirmModal.mode === 'selected'
                  ? `Hapus ${confirmModal.count} Transaksi Terpilih?`
                  : 'Hapus Riwayat Transaksi Ini?'}
              </h3>
              <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                Tindakan ini akan menghapus data transaksi dari sistem secara permanen. Data yang telah dihapus tidak dapat dipulihkan.
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

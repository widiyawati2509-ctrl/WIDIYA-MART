// @ts-nocheck
'use client'

import { useState } from 'react'
import { 
  Download, 
  X, 
  Calendar, 
  FileSpreadsheet, 
  Filter, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react'
import { getOrderStatusLabel } from '@/lib/utils'

interface OrderItem {
  id?: string
  nama_produk?: string
  qty?: number
  harga_saat_beli?: number
  subtotal?: number
}

interface Order {
  id: string
  nama_pemesan: string
  no_hp_pemesan: string
  subtotal?: number
  ongkir?: number
  total: number
  status: string
  created_at: string
  metode_pengiriman?: string
  alamat_pengiriman?: string
  order_items?: OrderItem[]
}

interface AdminOrderExportCsvModalProps {
  isOpen: boolean
  onClose: () => void
  orders: Order[]
}

function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return ''
  const str = String(val).trim()
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export default function AdminOrderExportCsvModal({
  isOpen,
  onClose,
  orders,
}: AdminOrderExportCsvModalProps) {
  const todayStr = new Date().toISOString().split('T')[0]
  
  // Default to first day of current month
  const firstDayStr = (() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
  })()

  const [startDate, setStartDate] = useState(firstDayStr)
  const [endDate, setEndDate] = useState(todayStr)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  // Calculate preview count
  const matchingOrders = orders.filter((order) => {
    const orderDateStr = order.created_at ? order.created_at.split('T')[0] : ''
    const matchDate = (!startDate || orderDateStr >= startDate) && (!endDate || orderDateStr <= endDate)
    const matchStatus = selectedStatus === 'all' || order.status === selectedStatus
    return matchDate && matchStatus
  })

  const handleExport = () => {
    setErrorMsg(null)
    setDownloadSuccess(false)

    if (matchingOrders.length === 0) {
      setErrorMsg('Tidak ada data pesanan yang sesuai dengan filter rentang tanggal dan status yang dipilih.')
      return
    }

    try {
      const headers = [
        'No',
        'ID Pesanan',
        'Tanggal & Waktu',
        'Nama Pembeli',
        'No WhatsApp / HP',
        'Metode Pengiriman',
        'Alamat Pengiriman',
        'Item Pesanan',
        'Subtotal (Rp)',
        'Ongkir (Rp)',
        'Total Belanja (Rp)',
        'Status Pesanan',
      ]

      const rows = matchingOrders.map((order, idx) => {
        const orderDate = new Date(order.created_at).toLocaleString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })

        const itemDetails = order.order_items && order.order_items.length > 0
          ? order.order_items.map((item) => `${item.nama_produk || 'Produk'} (${item.qty || 1})`).join('; ')
          : '-'

        const metodePengirimanLabel = order.metode_pengiriman === 'antar_alamat' ? 'Diantar ke Alamat' : 'Ambil di Toko'
        const alamatPengiriman = order.alamat_pengiriman || '-'

        return [
          idx + 1,
          order.id.slice(0, 8).toUpperCase(),
          orderDate,
          order.nama_pemesan || 'Pelanggan',
          order.no_hp_pemesan || '-',
          metodePengirimanLabel,
          alamatPengiriman,
          itemDetails,
          order.subtotal ?? (order.total - (order.ongkir || 0)),
          order.ongkir ?? 0,
          order.total,
          getOrderStatusLabel(order.status),
        ]
      })

      // Generate CSV string with UTF-8 BOM for Microsoft Excel compatibility
      const csvString =
        '\uFEFF' +
        [
          headers.map(escapeCsvCell).join(','),
          ...rows.map((r) => r.map(escapeCsvCell).join(',')),
        ].join('\r\n')

      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const downloadLink = document.createElement('a')
      downloadLink.href = url
      downloadLink.setAttribute('download', `pesanan_pengenjek_mart_${startDate}_sd_${endDate}.csv`)
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(url)

      setDownloadSuccess(true)
      setTimeout(() => {
        setDownloadSuccess(false)
        onClose()
      }, 1800)
    } catch (err: any) {
      console.error('Error exporting CSV:', err)
      setErrorMsg('Gagal menghasilkan file CSV: ' + (err?.message || 'Kesalahan sistem'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-xl)] w-full max-w-md p-5 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <FileSpreadsheet size={17} />
            </span>
            <div>
              <h3 className="font-sora font-bold text-sm text-[var(--ink)]">Export Data Pesanan CSV</h3>
              <p className="text-[var(--text-caption)] text-[var(--ink-soft)] font-medium">
                Unduh rekap penjualan untuk Excel / Spreadsheet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-[var(--ink-soft)] hover:bg-[var(--paper)] flex items-center justify-center transition-colors"
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-3.5 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-[var(--radius-md)] flex items-center gap-2">
            <AlertCircle size={15} className="text-rose-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {downloadSuccess && (
          <div className="mb-3.5 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-[var(--radius-md)] flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span className="font-bold">File CSV berhasil diunduh!</span>
          </div>
        )}

        {/* Filter Inputs */}
        <div className="space-y-3.5 text-xs">
          {/* Date range grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-sora font-bold text-[var(--ink)] mb-1">
                Dari Tanggal
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-[var(--radius-md)] border border-[rgba(232,214,205,0.9)] bg-white text-[var(--ink)] focus:outline-hidden focus:border-[var(--accent-2)]"
                />
              </div>
            </div>

            <div>
              <label className="block font-sora font-bold text-[var(--ink)] mb-1">
                Sampai Tanggal
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-[var(--radius-md)] border border-[rgba(232,214,205,0.9)] bg-white text-[var(--ink)] focus:outline-hidden focus:border-[var(--accent-2)]"
                />
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block font-sora font-bold text-[var(--ink)] mb-1">
              Filter Status Pesanan
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-[var(--radius-md)] border border-[rgba(232,214,205,0.9)] bg-white text-[var(--ink)] focus:outline-hidden focus:border-[var(--accent-2)]"
            >
              <option value="all">Semua Status Pesanan</option>
              <option value="selesai">Hanya Selesai</option>
              <option value="siap_diambil">Hanya Siap Diambil</option>
              <option value="diproses">Hanya Diproses</option>
              <option value="menunggu_diproses">Hanya Menunggu Diproses</option>
              <option value="dibatalkan">Hanya Dibatalkan</option>
            </select>
          </div>

          {/* Export Summary Card */}
          <div className="p-3 rounded-[var(--radius-md)] bg-[var(--paper)] border border-[var(--line)] flex items-center justify-between">
            <div>
              <p className="text-[var(--text-caption)] text-[var(--ink-soft)] font-medium">Pesanan Terpilih</p>
              <p className="font-sora font-extrabold text-sm text-[var(--ink)]">
                {matchingOrders.length} <span className="text-xs font-normal text-[var(--ink-soft)]">pesanan</span>
              </p>
            </div>

            <span className="text-[10px] text-emerald-800 bg-emerald-100/70 font-bold px-2.5 py-1 rounded-full border border-emerald-300">
              Format CSV UTF-8
            </span>
          </div>

          <p className="text-[10px] text-[var(--ink-soft)] italic">
            *Kolom CSV: No, ID Pesanan, Tanggal, Nama Pembeli, No HP, Metode, Alamat, Item, Subtotal, Ongkir, Total, Status.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 mt-4 flex gap-2 justify-end border-t border-[var(--line)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-sora font-semibold text-[var(--ink)] bg-white border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-md)] hover:bg-[var(--paper)] transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={matchingOrders.length === 0}
            className="px-4 py-2 text-xs font-sora font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-[var(--radius-md)] shadow-3d press active:scale-95 transition-all inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            <span>Unduh File CSV ({matchingOrders.length})</span>
          </button>
        </div>
      </div>
    </div>
  )
}

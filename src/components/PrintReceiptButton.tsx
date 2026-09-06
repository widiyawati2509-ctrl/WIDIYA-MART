// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Printer } from 'lucide-react'
import { parseOrderShippingInfo } from '@/lib/utils'

interface OrderItem {
  id?: string
  nama_produk: string
  harga_saat_beli: number
  qty: number
  subtotal: number
}

interface OrderData {
  id: string
  nama_pemesan: string
  no_hp_pemesan: string
  catatan?: string | null
  total: number
  status: string
  created_at: string
  metode_pengiriman?: string | null
  estimasi_menit?: number | null
  order_items?: OrderItem[]
}

interface StoreData {
  nama_toko?: string
  alamat_toko?: string
  kota?: string
  whatsapp?: string
  no_hp_toko?: string
}

interface PrintReceiptButtonProps {
  order?: OrderData | null
  store?: StoreData | null
}

function getStatusLabel(status: string, metodePengiriman?: string | null) {
  if (status === 'siap_diambil') {
    return metodePengiriman === 'antar_alamat' ? 'Pesanan Proses Pengantaran' : 'Siap Diambil'
  }
  switch (status) {
    case 'menunggu_diproses':
      return 'Menunggu Diproses'
    case 'diproses':
      return 'Sedang Diproses'
    case 'siap_diambil':
      return 'Siap Diambil'
    case 'selesai':
      return 'Selesai'
    case 'dibatalkan':
      return 'Dibatalkan'
    case 'tidak_diambil':
      return 'Tidak Diambil'
    default:
      return status || 'Diproses'
  }
}

function formatRp(val: number) {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID')
}

function formatWaktu(isoStr: string) {
  try {
    const d = new Date(isoStr)
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(/\./g, ':')
  } catch {
    return isoStr
  }
}

export default function PrintReceiptButton({ order, store }: PrintReceiptButtonProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const shipping = parseOrderShippingInfo(order)

  const receiptContent = (
    <aside
      id="receipt-print-area"
      aria-label="Struk Belanja"
      className="hidden print:block text-black bg-white font-mono"
    >
      {/* Header Toko */}
      <div className="text-center mb-1.5">
        <h1 className="text-xs font-black tracking-wider uppercase">
          {store?.nama_toko || 'PENGENJEK MART'}
        </h1>
        {store?.alamat_toko && (
          <p className="text-[9.5px] leading-tight text-gray-800 mt-0.5 break-words">
            {store.alamat_toko}
            {store.kota ? `, ${store.kota}` : ''}
          </p>
        )}
        {(store?.whatsapp || store?.no_hp_toko) && (
          <p className="text-[9.5px] text-gray-800">
            Telp/WA: {store.whatsapp || store.no_hp_toko}
          </p>
        )}
      </div>

      <div className="border-b border-dashed border-black my-1.5" />

      {/* Info Transaksi Resi */}
      <div className="text-[10px] space-y-0.5 leading-tight">
        <div className="flex justify-between gap-1">
          <span className="shrink-0">No. Resi</span>
          <span className="font-bold text-right truncate">
            #{order?.id ? order.id.slice(0, 8).toUpperCase() : 'WM-STRUK'}
          </span>
        </div>
        <div className="flex justify-between gap-1">
          <span className="shrink-0">Waktu</span>
          <span className="text-right">{order?.created_at ? formatWaktu(order.created_at) : '-'}</span>
        </div>
        <div className="flex justify-between gap-1">
          <span className="shrink-0">Pelanggan</span>
          <span className="font-semibold text-right break-words">{order?.nama_pemesan || '-'}</span>
        </div>
        <div className="flex justify-between gap-1">
          <span className="shrink-0">No. HP</span>
          <span className="text-right">{order?.no_hp_pemesan || '-'}</span>
        </div>
        <div className="flex justify-between gap-1">
          <span className="shrink-0">Status</span>
          <span className="font-bold text-right">{getStatusLabel(order?.status || '', shipping.metode)}</span>
        </div>
        <div className="flex justify-between gap-1">
          <span className="shrink-0">Pengiriman</span>
          <span className="font-semibold text-right">{shipping.isDelivery ? 'Diantar' : 'Ambil di Toko'}</span>
        </div>
        {shipping.isDelivery && (
          <>
            {shipping.alamat && (
              <div className="pt-0.5">
                <span className="block text-[9px] text-gray-700">Tujuan Antar:</span>
                <span className="font-medium text-[9.5px] leading-tight block break-words">{shipping.alamat}</span>
              </div>
            )}
            {shipping.estimasiMenit ? (
              <div className="flex justify-between gap-1 font-bold">
                <span className="shrink-0">Estimasi Tiba</span>
                <span className="text-right">±{shipping.estimasiMenit} Menit</span>
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="border-b border-dashed border-black my-1.5" />

      {/* Kolom Judul Item */}
      <div className="text-[10px] font-bold flex justify-between pb-1 border-b border-black">
        <span>PRODUK</span>
        <span className="text-right">SUBTOTAL</span>
      </div>

      {/* Daftar Item Pesanan */}
      <div className="text-[10px] py-1 space-y-1.5">
        {order?.order_items && order.order_items.length > 0 ? (
          order.order_items.map((item, idx) => (
            <div key={item.id || idx} className="space-y-0.5">
              <div className="font-semibold text-black leading-tight break-words">
                {item.nama_produk}
              </div>
              <div className="flex justify-between items-baseline text-[9.5px] text-gray-800">
                <span>
                  {item.qty} × {formatRp(item.harga_saat_beli)}
                </span>
                <span className="font-bold text-black shrink-0 text-right ml-1">{formatRp(item.subtotal)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-[10px] py-1">Item belanja</div>
        )}
      </div>

      <div className="border-b border-dashed border-black my-1.5" />

      {/* Rincian Total */}
      <div className="text-[10px] space-y-0.5">
        <div className="flex justify-between gap-1">
          <span className="shrink-0">Subtotal</span>
          <span className="text-right">{formatRp(order?.subtotal || order?.total || 0)}</span>
        </div>
        <div className="flex justify-between gap-1">
          <span className="shrink-0">Ongkir ({shipping.isDelivery ? 'Diantar' : 'Ambil Toko'})</span>
          <span className="text-right">{formatRp(shipping.ongkir || order?.ongkir || 0)}</span>
        </div>
        <div className="flex justify-between font-bold text-[10.5px] pt-1 border-t border-black">
          <span>TOTAL BAYAR</span>
          <span className="text-right">{formatRp(order?.total || 0)}</span>
        </div>
        <div className="flex justify-between gap-1 pt-0.5 text-[9.5px] text-gray-800">
          <span className="shrink-0">Metode Bayar</span>
          <span className="text-right">{shipping.isDelivery ? 'COD (Saat Tiba)' : 'COD Kasir Toko'}</span>
        </div>
        {shipping.cleanCatatan && (
          <div className="text-[9px] text-gray-800 pt-0.5 italic break-words">
            Catatan: {shipping.cleanCatatan}
          </div>
        )}
      </div>

      <div className="border-b border-dashed border-black my-2" />

      {/* Footer Struk Ringkas 1 Baris */}
      <div className="text-center text-[10px] font-bold tracking-wide py-0.5">
        Terima kasih!
      </div>
    </aside>
  )

  return (
    <>
      <button
        type="button"
        onClick={handlePrint}
        className="press inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-white border border-[rgba(232,214,205,0.9)] text-[var(--ink)] hover:bg-[var(--paper)] shadow-xs print:hidden cursor-pointer active:scale-95 transition-all"
        title="Cetak struk / resi pesanan"
      >
        <Printer className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
        <span>Cetak Struk</span>
      </button>

      {mounted && typeof document !== 'undefined'
        ? createPortal(receiptContent, document.body)
        : null}
    </>
  )
}

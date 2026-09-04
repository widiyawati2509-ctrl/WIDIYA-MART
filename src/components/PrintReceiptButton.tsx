// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Printer } from 'lucide-react'

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

function getStatusLabel(status: string) {
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

  const receiptContent = (
    <aside
      id="receipt-print-area"
      aria-label="Struk Belanja"
      className="hidden print:block text-black bg-white font-mono"
    >
      {/* Header Toko */}
      <div className="text-center mb-2">
        <h1 className="text-sm font-black tracking-wider uppercase">
          {store?.nama_toko || 'TOKO MIRING'}
        </h1>
        {store?.alamat_toko && (
          <p className="text-[11px] leading-tight text-gray-800 mt-0.5">
            {store.alamat_toko}
            {store.kota ? `, ${store.kota}` : ''}
          </p>
        )}
        {(store?.whatsapp || store?.no_hp_toko) && (
          <p className="text-[11px] text-gray-800">
            Telp/WA: {store.whatsapp || store.no_hp_toko}
          </p>
        )}
      </div>

      <div className="border-b border-dashed border-black my-2" />

      {/* Info Transaksi Resi */}
      <div className="text-[11px] space-y-0.5 leading-tight">
        <div className="flex justify-between">
          <span>No. Resi</span>
          <span className="font-bold">
            #{order?.id ? order.id.slice(0, 8).toUpperCase() : 'WM-STRUK'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Waktu</span>
          <span>{order?.created_at ? formatWaktu(order.created_at) : '-'}</span>
        </div>
        <div className="flex justify-between">
          <span>Pelanggan</span>
          <span className="font-semibold">{order?.nama_pemesan || '-'}</span>
        </div>
        <div className="flex justify-between">
          <span>No. HP</span>
          <span>{order?.no_hp_pemesan || '-'}</span>
        </div>
        <div className="flex justify-between">
          <span>Status</span>
          <span className="font-bold">{getStatusLabel(order?.status || '')}</span>
        </div>
      </div>

      <div className="border-b border-dashed border-black my-2" />

      {/* Kolom Judul Item */}
      <div className="text-[11px] font-bold flex justify-between pb-1 border-b border-black">
        <span>PRODUK</span>
        <span>SUBTOTAL</span>
      </div>

      {/* Daftar Item Pesanan */}
      <div className="text-[11px] py-1.5 space-y-2">
        {order?.order_items && order.order_items.length > 0 ? (
          order.order_items.map((item, idx) => (
            <div key={item.id || idx} className="space-y-0.5">
              <div className="font-semibold text-black leading-tight">
                {item.nama_produk}
              </div>
              <div className="flex justify-between text-gray-900 text-[10.5px]">
                <span>
                  {item.qty} × {formatRp(item.harga_saat_beli)}
                </span>
                <span className="font-bold">{formatRp(item.subtotal)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-xs py-1">Item belanja</div>
        )}
      </div>

      <div className="border-b border-dashed border-black my-2" />

      {/* Rincian Total */}
      <div className="text-[11px] space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatRp(order?.total || 0)}</span>
        </div>
        <div className="flex justify-between">
          <span>Biaya Layanan</span>
          <span>Rp 0</span>
        </div>
        <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
          <span>TOTAL BAYAR</span>
          <span>{formatRp(order?.total || 0)}</span>
        </div>
        <div className="flex justify-between pt-0.5 text-[10.5px] text-gray-800">
          <span>Metode Bayar</span>
          <span>Tunai / COD di Toko</span>
        </div>
        {order?.catatan && (
          <div className="text-[10px] text-gray-800 pt-1 italic">
            Catatan: {order.catatan}
          </div>
        )}
      </div>

      <div className="border-b border-dashed border-black my-2.5" />

      {/* Footer Struk */}
      <div className="text-center text-[10.5px] leading-tight space-y-1">
        <div className="font-bold">TERIMA KASIH ATAS KUNJUNGAN ANDA</div>
        <div className="text-gray-800">
          Harap simpan struk ini saat mengambil pesanan di kasir toko.
        </div>
      </div>
    </aside>
  )

  return (
    <>
      <button
        type="button"
        onClick={handlePrint}
        className="btn-3d btn-3d-white inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl text-gray-700 print:hidden cursor-pointer active:scale-95 transition-transform"
        title="Cetak struk / resi pesanan"
      >
        <Printer className="w-3.5 h-3.5 text-gray-600" />
        <span>Cetak Struk</span>
      </button>

      {mounted && typeof document !== 'undefined'
        ? createPortal(receiptContent, document.body)
        : null}
    </>
  )
}

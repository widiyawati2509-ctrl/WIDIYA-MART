// @ts-nocheck
import { formatRupiah } from './formatting'

export function formatWhatsAppUrl(phone: string, text?: string): string {
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1)
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned
  }
  const baseUrl = `https://wa.me/${cleaned}`
  if (text) {
    return `${baseUrl}?text=${encodeURIComponent(text)}`
  }
  return baseUrl
}

export function buildOrderWhatsAppMessage(
  order: any,
  store?: { nama_toko?: string } | null
): string {
  if (!order) return ''

  const orderId = order.id ? `#${order.id.slice(0, 8).toUpperCase()}` : ''
  const storeName = store?.nama_toko || 'PENGENJEK MART'

  const dateStr = order.created_at
    ? new Date(order.created_at).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WITA'
    : '-'

  const isDelivery =
    order.metode_pengiriman === 'antar_alamat' ||
    (order.alamat_pengiriman && order.alamat_pengiriman.trim().length > 0)

  const itemsList =
    order.order_items && order.order_items.length > 0
      ? order.order_items
          .map(
            (item: any, idx: number) =>
              `${idx + 1}. ${item.nama_produk || 'Produk'} (${item.qty}x) - ${formatRupiah(
                item.subtotal || item.harga_saat_beli * item.qty
              )}`
          )
          .join('\n')
      : '- Tidak ada item -'

  const subtotalStr = formatRupiah(order.subtotal || order.total)
  const ongkirVal = Number(order.ongkir || 0)
  const ongkirStr = isDelivery
    ? ongkirVal === 0
      ? 'Rp 0 (Gratis Ongkir)'
      : formatRupiah(ongkirVal)
    : 'Rp 0 (Ambil di Toko)'

  const lines = [
    `*PESANAN BARU - ${storeName.toUpperCase()}*`,
    '----------------------------------------',
    `*ID Pesanan:* ${orderId}`,
    `*Waktu:* ${dateStr}`,
    '',
    '*DATA PEMESAN:*',
    `Nama: ${order.nama_pemesan || 'Pelanggan'}`,
    `No. HP: ${order.no_hp_pemesan || '-'}`,
    `Metode: ${isDelivery ? 'Diantar ke Alamat (COD)' : 'Ambil di Toko (COD)'}`,
  ]

  if (isDelivery) {
    if (order.dusun_pengiriman) {
      lines.push(`Dusun / Area: ${order.dusun_pengiriman}`)
    }
    lines.push(`Alamat Lengkap: ${order.alamat_pengiriman || '-'}`)
    if (order.estimasi_menit) {
      lines.push(`Target Pengantaran: ±${order.estimasi_menit} Menit`)
    }
  }

  lines.push('')
  lines.push('*RINCIAN PRODUK:*')
  lines.push(itemsList)
  lines.push('----------------------------------------')
  lines.push(`Subtotal Produk: ${subtotalStr}`)
  lines.push(`Biaya Pengiriman: ${ongkirStr}`)

  if (order.kode_kupon || order.diskon_kupon > 0) {
    const couponCode = order.kode_kupon ? ` (${order.kode_kupon})` : ''
    lines.push(`Voucher Diskon${couponCode}: -${formatRupiah(order.diskon_kupon || 0)}`)
  }

  if (order.diskon_poin > 0) {
    const points = order.poin_digunakan ? ` (${order.poin_digunakan} poin)` : ''
    lines.push(`Diskon Poin${points}: -${formatRupiah(order.diskon_poin)}`)
  }

  lines.push('----------------------------------------')
  lines.push(`*TOTAL PEMBAYARAN (COD): ${formatRupiah(order.total)}*`)
  lines.push('----------------------------------------')

  if (order.catatan) {
    lines.push(`Catatan: ${order.catatan}`)
    lines.push('')
  }

  lines.push(`Halo Admin ${storeName}, mohon konfirmasi dan proses pesanan saya di atas ya. Terima kasih! 🙏`)

  return lines.join('\n')
}

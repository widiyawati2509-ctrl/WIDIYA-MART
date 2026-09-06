// @ts-nocheck
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getOrderStatusLabel(status: string, metodePengiriman?: string | null): string {
  if (status === 'siap_diambil') {
    return metodePengiriman === 'antar_alamat' ? 'Pesanan Proses Pengantaran' : 'Siap Diambil'
  }
  const labels: Record<string, string> = {
    menunggu_diproses: 'Menunggu Diproses',
    diproses: 'Sedang Diproses',
    siap_diambil: 'Siap Diambil',
    selesai: 'Selesai',
    dibatalkan: 'Dibatalkan',
    tidak_diambil: 'Tidak Diambil',
  }
  return labels[status] ?? status
}

export function getOrderStatusColor(status: string, metodePengiriman?: string | null): string {
  if (status === 'siap_diambil' && metodePengiriman === 'antar_alamat') {
    return 'bg-blue-100 text-blue-800'
  }
  const colors: Record<string, string> = {
    menunggu_diproses: 'bg-yellow-100 text-yellow-800',
    diproses: 'bg-blue-100 text-blue-800',
    siap_diambil: 'bg-green-100 text-green-800',
    selesai: 'bg-gray-100 text-gray-800',
    dibatalkan: 'bg-red-100 text-red-800',
    tidak_diambil: 'bg-rose-100 text-rose-800 border-rose-200',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-800'
}

// Batas waktu pengambilan COD (default 2x24 jam = 48 jam)
export const ORDER_PICKUP_EXPIRATION_HOURS = 48

export function formatBatasWaktu(dateStr?: string | null): string {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export function getPickupCountdown(dateStr?: string | null): {
  isExpired: boolean
  remainingMs: number
  text: string
  formattedDate: string
} {
  if (!dateStr) {
    return { isExpired: false, remainingMs: 0, text: '-', formattedDate: '-' }
  }
  const deadline = new Date(dateStr).getTime()
  const now = Date.now()
  const diff = deadline - now
  const formattedDate = formatBatasWaktu(dateStr)

  if (diff <= 0) {
    return {
      isExpired: true,
      remainingMs: diff,
      text: 'Batas waktu telah lewat',
      formattedDate,
    }
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    const remHours = hours % 24
    return {
      isExpired: false,
      remainingMs: diff,
      text: `Sisa ${days} hari ${remHours} jam`,
      formattedDate,
    }
  }

  if (hours > 0) {
    return {
      isExpired: false,
      remainingMs: diff,
      text: `Sisa ${hours} jam ${minutes} menit`,
      formattedDate,
    }
  }

  return {
    isExpired: false,
    remainingMs: diff,
    text: `Sisa ${minutes} menit`,
    formattedDate,
  }
}

/**
 * Ambil waktu saat ini dalam zona waktu WITA (Waktu Indonesia Tengah / Asia/Makassar / UTC+8).
 * Menjamin konsistensi jam baik dieksekusi di server (UTC) maupun di browser/klien.
 */
export function getWitaTime(date: Date = new Date()): {
  hours: number
  minutes: number
  timeString: string
} {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Makassar',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
    const parts = formatter.formatToParts(date)
    const h = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10)
    const m = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10)
    return {
      hours: h,
      minutes: m,
      timeString: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
    }
  } catch {
    // Fallback perhitungan manual: UTC + 8 jam
    const utcMs = date.getTime() + date.getTimezoneOffset() * 60 * 1000
    const witaMs = utcMs + 8 * 60 * 60 * 1000
    const witaDate = new Date(witaMs)
    const h = witaDate.getHours()
    const m = witaDate.getMinutes()
    return {
      hours: h,
      minutes: m,
      timeString: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
    }
  }
}

/**
 * Parsing jam dari string (mendukung format '07:00', '07.00', '7:00', dll).
 */
export function parseTimeString(
  val: string | null | undefined,
  fallbackH: number,
  fallbackM: number
): { hours: number; minutes: number; formatted: string } {
  if (!val) {
    return {
      hours: fallbackH,
      minutes: fallbackM,
      formatted: `${String(fallbackH).padStart(2, '0')}:${String(fallbackM).padStart(2, '0')}`,
    }
  }
  const match = val.match(/(\d{1,2})[:.](\d{2})/)
  if (match) {
    const h = parseInt(match[1], 10)
    const m = parseInt(match[2], 10)
    return {
      hours: h,
      minutes: m,
      formatted: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
    }
  }
  return {
    hours: fallbackH,
    minutes: fallbackM,
    formatted: `${String(fallbackH).padStart(2, '0')}:${String(fallbackM).padStart(2, '0')}`,
  }
}

/**
 * Cek status apakah toko sedang buka atau tutup berdasarkan jam operasional dan waktu nyata WITA.
 */
export function isStoreOpen(
  jamBuka?: string | null,
  jamTutup?: string | null,
  jamOperasionalFallback?: string | null
): {
  isOpen: boolean
  statusText: string
  timeRange: string
  currentWitaTime: string
  jamBukaFormatted: string
  jamTutupFormatted: string
} {
  try {
    let bukaStr = jamBuka?.trim() || null
    let tutupStr = jamTutup?.trim() || null

    // Jika jamBuka / jamTutup kosong, coba ekstrak dari teks jam_operasional (mis: 'Senin–Minggu, 07.00–21.00')
    if ((!bukaStr || !tutupStr) && jamOperasionalFallback) {
      const matches = [...jamOperasionalFallback.matchAll(/(\d{1,2})[:.](\d{2})/g)]
      if (matches.length >= 2) {
        if (!bukaStr) bukaStr = matches[0][0]
        if (!tutupStr) tutupStr = matches[1][0]
      }
    }

    const buka = parseTimeString(bukaStr, 7, 0)
    const tutup = parseTimeString(tutupStr, 21, 0)
    const timeRange = `${buka.formatted} – ${tutup.formatted} WITA`

    const now = getWitaTime()
    const currentMinutes = now.hours * 60 + now.minutes
    const startMinutes = buka.hours * 60 + buka.minutes
    const endMinutes = tutup.hours * 60 + tutup.minutes

    let isOpen = false
    if (endMinutes >= startMinutes) {
      isOpen = currentMinutes >= startMinutes && currentMinutes < endMinutes
    } else {
      // Menangani jam operasional lewat tengah malam (mis: 20:00 - 04:00)
      isOpen = currentMinutes >= startMinutes || currentMinutes < endMinutes
    }

    return {
      isOpen,
      statusText: isOpen ? 'Toko Buka' : 'Toko Tutup',
      timeRange,
      currentWitaTime: now.timeString,
      jamBukaFormatted: buka.formatted,
      jamTutupFormatted: tutup.formatted,
    }
  } catch {
    return {
      isOpen: true,
      statusText: 'Toko Buka',
      timeRange: '07:00 – 21:00 WITA',
      currentWitaTime: '12:00',
      jamBukaFormatted: '07:00',
      jamTutupFormatted: '21:00',
    }
  }
}

export function getSupabaseImageUrl(
  bucket: string,
  path: string
): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}

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

export interface ProductVariant {
  id?: string
  nama: string
  harga?: number
  stok?: number
  image_url?: string
}

const VARIANTS_DELIMITER = '\n\n<!--__VARIANTS__\n'
const VARIANTS_DELIMITER_END = '\n__VARIANTS__-->'

export function parseProductVariants(deskripsi: string | null | undefined): {
  cleanDeskripsi: string
  variants: ProductVariant[]
} {
  if (!deskripsi) return { cleanDeskripsi: '', variants: [] }
  const startIdx = deskripsi.indexOf('<!--__VARIANTS__')
  const endIdx = deskripsi.indexOf('__VARIANTS__-->')

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const rawJson = deskripsi.slice(startIdx + '<!--__VARIANTS__\n'.length, endIdx).trim()
    const cleanDeskripsi = deskripsi.slice(0, startIdx).trim()
    try {
      const parsed = JSON.parse(rawJson)
      if (Array.isArray(parsed)) {
        return { cleanDeskripsi, variants: parsed }
      }
    } catch {
      // ignore json parse error
    }
  }

  return { cleanDeskripsi: deskripsi, variants: [] }
}

export function serializeProductVariants(
  cleanDeskripsi: string,
  variants: ProductVariant[]
): string {
  const trimmed = (cleanDeskripsi || '').trim()
  if (!variants || variants.length === 0) {
    return trimmed
  }
  return `${trimmed}${VARIANTS_DELIMITER}${JSON.stringify(variants)}${VARIANTS_DELIMITER_END}`
}

export interface ParsedShippingInfo {
  metode: 'antar_alamat' | 'ambil_di_toko'
  isDelivery: boolean
  alamat: string | null
  jarakKm: number | null
  ongkir: number
  estimasiMenit: number | null
  cleanCatatan: string | null
}

export function parseOrderShippingInfo(order?: {
  metode_pengiriman?: string | null
  alamat_pengiriman?: string | null
  jarak_km?: number | null
  ongkir?: number | null
  estimasi_menit?: number | null
  catatan?: string | null
} | null): ParsedShippingInfo {
  if (!order) {
    return {
      metode: 'ambil_di_toko',
      isDelivery: false,
      alamat: null,
      jarakKm: null,
      ongkir: 0,
      estimasiMenit: null,
      cleanCatatan: null,
    }
  }

  let metode: 'antar_alamat' | 'ambil_di_toko' =
    order.metode_pengiriman === 'antar_alamat' ? 'antar_alamat' : 'ambil_di_toko'
  let alamat = order.alamat_pengiriman?.trim() || null
  let jarakKm = typeof order.jarak_km === 'number' && !isNaN(order.jarak_km) ? order.jarak_km : null
  let ongkir = typeof order.ongkir === 'number' && !isNaN(order.ongkir) ? order.ongkir : 0
  let estimasiMenit = typeof order.estimasi_menit === 'number' && !isNaN(order.estimasi_menit) ? order.estimasi_menit : null
  let rawCatatan = order.catatan?.trim() || null

  // If order was created during schema fallback, parse legacy bracket format
  if (rawCatatan) {
    if (rawCatatan.includes('[Pengantaran ke:') || rawCatatan.includes('[Metode: Diantar')) {
      metode = 'antar_alamat'
      if (!alamat) {
        const addrMatch = rawCatatan.match(/\[Pengantaran ke:\s*([^|\]]+)/i)
        if (addrMatch && addrMatch[1]?.trim() && addrMatch[1].trim() !== '-') {
          alamat = addrMatch[1].trim()
        }
      }
      if (jarakKm === null) {
        const jarakMatch = rawCatatan.match(/Jarak:\s*([0-9.]+)\s*km/i)
        if (jarakMatch) {
          jarakKm = parseFloat(jarakMatch[1])
        }
      }
      if (ongkir === 0) {
        const ongkirMatch = rawCatatan.match(/Ongkir:\s*Rp\s*([0-9.]+)/i)
        if (ongkirMatch) {
          ongkir = parseInt(ongkirMatch[1].replace(/\./g, ''), 10) || 0
        }
      }
      if (!estimasiMenit) {
        const estMatch = rawCatatan.match(/Estimasi:\s*±?([0-9]+)\s*mnt/i)
        if (estMatch) {
          estimasiMenit = parseInt(estMatch[1], 10)
        }
      }
    } else if (rawCatatan.includes('[Metode: Ambil di Toko]')) {
      metode = 'ambil_di_toko'
    }

    // Clean customer note from embedded tags
    const cleaned = rawCatatan
      .replace(/\[Pengantaran ke:[^\]]*\]/gi, '')
      .replace(/\[Metode:[^\]]*\]/gi, '')
      .replace(/\[Poin Digunakan:[^\]]*\]/gi, '')
      .replace(/^Catatan:\s*/i, '')
      .replace(/\n\s*Catatan:\s*/gi, '\n')
      .trim()

    rawCatatan = cleaned || null
  }

  return {
    metode,
    isDelivery: metode === 'antar_alamat',
    alamat,
    jarakKm,
    ongkir,
    estimasiMenit,
    cleanCatatan: rawCatatan,
  }
}



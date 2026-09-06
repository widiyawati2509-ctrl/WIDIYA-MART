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

export function getOrderStatusLabel(status: string): string {
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

export function getOrderStatusColor(status: string): string {
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

export function isStoreOpen(
  jamBuka?: string | null,
  jamTutup?: string | null
): { isOpen: boolean; statusText: string; timeRange: string } {
  const buka = (jamBuka || '07:00').trim()
  const tutup = (jamTutup || '21:00').trim()
  const timeRange = `${buka} - ${tutup}`

  try {
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const [bukaH, bukaM] = buka.split(':').map((v) => parseInt(v, 10))
    const [tutupH, tutupM] = tutup.split(':').map((v) => parseInt(v, 10))

    if (isNaN(bukaH) || isNaN(tutupH)) {
      return { isOpen: true, statusText: 'Toko Buka', timeRange }
    }

    const startMinutes = bukaH * 60 + (bukaM || 0)
    const endMinutes = tutupH * 60 + (tutupM || 0)

    let isOpen = false
    if (endMinutes >= startMinutes) {
      isOpen = currentMinutes >= startMinutes && currentMinutes < endMinutes
    } else {
      isOpen = currentMinutes >= startMinutes || currentMinutes < endMinutes
    }

    return {
      isOpen,
      statusText: isOpen ? 'Toko Buka' : 'Toko Tutup',
      timeRange,
    }
  } catch {
    return { isOpen: true, statusText: 'Toko Buka', timeRange }
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


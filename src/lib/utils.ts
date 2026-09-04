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
  }
  return colors[status] ?? 'bg-gray-100 text-gray-800'
}

export function getSupabaseImageUrl(
  bucket: string,
  path: string
): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}

export interface ProductVariant {
  id?: string
  nama: string
  harga?: number
  stok?: number
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


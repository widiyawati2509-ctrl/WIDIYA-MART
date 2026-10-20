// @ts-nocheck
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

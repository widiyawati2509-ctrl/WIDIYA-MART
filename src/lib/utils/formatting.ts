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

export function getSupabaseImageUrl(
  bucket: string,
  path: string | null | undefined
): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}

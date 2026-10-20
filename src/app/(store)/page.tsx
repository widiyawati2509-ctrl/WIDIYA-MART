// @ts-nocheck
import { createPublicClient } from '@/lib/supabase/server'
import { getPublicPromos } from '@/lib/actions/promos'
import { TelegramMiniAppView } from '@/components/telegram/TelegramMiniAppView'

export const revalidate = 60

// In-memory cache to eliminate remote database roundtrip latency (< 5ms response)
let homeCache: {
  data: {
    categories: any
    products: any
    storeInfo: any
    promos: any
  }
  timestamp: number
} | null = null

const HOME_CACHE_TTL = 60 * 1000 // 60 seconds

export default async function HomePage() {
  let homeData = homeCache
  const now = Date.now()

  if (!homeData || now - homeData.timestamp > HOME_CACHE_TTL) {
    const supabase = createPublicClient()
    const [{ data: categories }, { data: products }, { data: storeInfo }, promos] =
      await Promise.all([
        supabase
          .from('categories')
          .select('id, nama, slug, icon_url, urutan')
          .order('urutan'),
        supabase
          .from('products')
          .select('id, nama, slug, harga, stok, image_url, category_id, created_at, categories(id, nama, slug)')
          .eq('is_active', true)
          .gt('stok', 0)
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('store_info')
          .select('*')
          .single(),
        getPublicPromos(),
      ])

    homeData = {
      data: { categories, products, storeInfo, promos },
      timestamp: now,
    }
    homeCache = homeData
  }

  const { categories, products, storeInfo, promos } = homeData.data

  return (
    <TelegramMiniAppView
      categories={categories || []}
      products={products || []}
      storeInfo={storeInfo || null}
      promos={promos || []}
    />
  )
}

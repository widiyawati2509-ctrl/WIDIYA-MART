// @ts-nocheck
import type { Product } from '@/types/database'

const CATALOG_CACHE_KEY_PREFIX = 'pengenjek_catalog_cache_'
const CACHE_TTL_MS = 3 * 60 * 1000 // 3 minutes

interface CacheEntry<T> {
  data: T
  timestamp: number
}

// In-memory runtime cache for 0ms retrieval
const memoryCache = new Map<string, CacheEntry<any>>()

export function getCachedCatalogData<T>(key: string): { data: T | null; isStale: boolean } {
  // 1. Check memory cache
  const memEntry = memoryCache.get(key)
  if (memEntry) {
    const isStale = Date.now() - memEntry.timestamp > CACHE_TTL_MS
    return { data: memEntry.data as T, isStale }
  }

  // 2. Check sessionStorage if browser environment
  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(CATALOG_CACHE_KEY_PREFIX + key)
      if (raw) {
        const parsed: CacheEntry<T> = JSON.parse(raw)
        const isStale = Date.now() - parsed.timestamp > CACHE_TTL_MS
        memoryCache.set(key, parsed)
        return { data: parsed.data, isStale }
      }
    } catch {
      // Ignore storage errors
    }
  }

  return { data: null, isStale: true }
}

export function setCachedCatalogData<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
  }

  memoryCache.set(key, entry)

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(CATALOG_CACHE_KEY_PREFIX + key, JSON.stringify(entry))
    } catch {
      // Storage might be full or blocked
    }
  }
}

/**
 * Fetch catalog products with Stale-While-Revalidate caching pattern
 */
export async function fetchCatalogProductsWithSWR(params: {
  q?: string
  kategori?: string
  urutan?: string
  filter?: string
  offset?: number
  limit?: number
}): Promise<{ products: Product[]; totalCount: number; fromCache: boolean }> {
  const cacheKey = JSON.stringify(params)
  const cached = getCachedCatalogData<{ products: Product[]; totalCount: number }>(cacheKey)

  // Function to fetch fresh data from the optimized API
  const fetchFresh = async () => {
    const query = new URLSearchParams()
    if (params.q) query.set('q', params.q)
    if (params.kategori) query.set('kategori', params.kategori)
    if (params.urutan) query.set('urutan', params.urutan)
    if (params.filter) query.set('filter', params.filter)
    if (params.offset !== undefined) query.set('offset', String(params.offset))
    if (params.limit !== undefined) query.set('limit', String(params.limit))

    const res = await fetch(`/api/catalog?${query.toString()}`)
    if (!res.ok) throw new Error('Catalog fetch error')
    const json = await res.json()
    setCachedCatalogData(cacheKey, json)
    return json
  }

  // If we have fresh cached data, return it directly
  if (cached.data && !cached.isStale) {
    return { ...cached.data, fromCache: true }
  }

  // If we have stale cache, trigger background revalidation and return stale
  if (cached.data && cached.isStale) {
    fetchFresh().catch(() => {})
    return { ...cached.data, fromCache: true }
  }

  // No cache at all: fetch immediately
  try {
    const fresh = await fetchFresh()
    return { ...fresh, fromCache: false }
  } catch (err) {
    console.error('[CatalogCache] fetch error:', err)
    return { products: [], totalCount: 0, fromCache: false }
  }
}

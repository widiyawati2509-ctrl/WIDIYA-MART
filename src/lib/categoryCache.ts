import type { Category } from '@/types/database'

const CACHE_KEY = 'pengenjek_categories_cache'
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

interface CachePayload {
  data: Category[]
  timestamp: number
}

export function getCachedCategories(): { data: Category[] | null; isStale: boolean } {
  if (typeof window === 'undefined') {
    return { data: null, isStale: true }
  }

  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return { data: null, isStale: true }

    const parsed: CachePayload = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.data)) {
      return { data: null, isStale: true }
    }

    const isStale = Date.now() - parsed.timestamp > CACHE_TTL_MS
    return { data: parsed.data, isStale }
  } catch {
    return { data: null, isStale: true }
  }
}

export function setCachedCategories(categories: Category[]): void {
  if (typeof window === 'undefined' || !Array.isArray(categories) || categories.length === 0) {
    return
  }

  try {
    const payload: CachePayload = {
      data: categories,
      timestamp: Date.now(),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch (err) {
    console.warn('[CategoryCache] Error saving to localStorage:', err)
  }
}

export async function fetchCategoriesWithCache(): Promise<Category[]> {
  const cached = getCachedCategories()

  // If we have valid fresh cache, return immediately
  if (cached.data && !cached.isStale) {
    return cached.data
  }

  // If stale cache exists, kick off background revalidation and return stale
  if (cached.data && cached.isStale) {
    // Background revalidate
    fetch('/api/categories')
      .then((res) => res.json())
      .then((fresh) => {
        if (Array.isArray(fresh) && fresh.length > 0) {
          setCachedCategories(fresh)
          window.dispatchEvent(new CustomEvent('pengenjek_categories_updated', { detail: fresh }))
        }
      })
      .catch(() => {})
    return cached.data
  }

  // If no cache, fetch from API
  try {
    const res = await fetch('/api/categories')
    const fresh = await res.json()
    if (Array.isArray(fresh)) {
      setCachedCategories(fresh)
      return fresh
    }
  } catch (err) {
    console.error('[CategoryCache] Fetch error:', err)
  }

  return cached.data || []
}

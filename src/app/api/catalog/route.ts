// @ts-nocheck
import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/server'
import { getActivePromoProductIds } from '@/lib/actions/promos'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''
    const kategori = searchParams.get('kategori')?.trim() || ''
    const urutan = searchParams.get('urutan')?.trim() || 'nama'
    const filter = searchParams.get('filter')?.trim() || ''
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '12', 10), 50)

    const supabase = createPublicClient()

    let query = supabase
      .from('products')
      .select('id, nama, slug, deskripsi, harga, stok, image_url, category_id, categories(id, nama, slug)', {
        count: 'exact',
      })
      .eq('is_active', true)

    // Stock / Promo filter
    if (filter === 'promo') {
      const promoIds = await getActivePromoProductIds()
      if (promoIds.length > 0) {
        query = query.in('id', promoIds)
      } else {
        query = query.eq('id', '00000000-0000-0000-0000-000000000000')
      }
    } else if (filter === 'ready' || !filter) {
      query = query.gt('stok', 0)
    }

    // Search query
    if (q) {
      query = query.ilike('nama', `%${q}%`)
    }

    // Category filter
    if (kategori) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', kategori)
        .maybeSingle()

      if (cat) {
        query = query.eq('category_id', cat.id)
      }
    }

    // Sorting
    if (urutan === 'termurah') {
      query = query.order('harga', { ascending: true })
    } else if (urutan === 'termahal') {
      query = query.order('harga', { ascending: false })
    } else if (urutan === 'terbaru') {
      query = query.order('created_at', { ascending: false })
    } else {
      query = query.order('nama', { ascending: true })
    }

    const { data: products, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        products: products || [],
        totalCount: count ?? products?.length ?? 0,
        hasMore: (products?.length || 0) === limit && (offset + limit < (count ?? 0)),
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=300',
        },
      }
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Gagal memuat katalog produk' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createPublicClient()
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, nama, slug, icon_url, urutan')
      .order('urutan')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Cache-Control: public for browser & CDN, 5 min fresh, 10 min CDN, 1 hr stale-while-revalidate
    return NextResponse.json(categories || [], {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

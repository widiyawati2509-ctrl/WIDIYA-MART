// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAllPromosAdmin } from '@/lib/actions/promos'
import AdminPromoList from '@/components/admin/AdminPromoList'

export const metadata = {
  title: 'Kelola Promo | Admin PENGENJEK MART',
}

export default async function AdminPromoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/masuk')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const [promos, { data: products }] = await Promise.all([
    getAllPromosAdmin(),
    supabase.from('products').select('id, nama, slug, harga, image_url').eq('is_active', true).order('nama'),
  ])

  return (
    <div>
      <AdminPromoList
        initialPromos={promos || []}
        products={products || []}
      />
    </div>
  )
}

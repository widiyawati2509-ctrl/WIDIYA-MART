// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getLoyaltySummaryAdmin } from '@/lib/actions/loyalty'
import AdminLoyaltyManager from '@/components/admin/AdminLoyaltyManager'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Kelola Poin Loyalitas | Admin PENGENJEK MART',
}

export default async function AdminPoinPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/masuk')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const loyaltyData = await getLoyaltySummaryAdmin()

  return (
    <div>
      <AdminLoyaltyManager
        config={loyaltyData.config}
        transactions={loyaltyData.transactions || []}
      />
    </div>
  )
}

// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getLoyaltyConfig } from '@/lib/actions/loyalty'
import AdminLoyaltyManager from '@/components/admin/AdminLoyaltyManager'

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

  const [config, { data: transactions }] = await Promise.all([
    getLoyaltyConfig(),
    supabase
      .from('loyalty_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  return (
    <div className="p-4 max-w-4xl mx-auto pb-20">
      <AdminLoyaltyManager
        config={config}
        transactions={transactions || []}
      />
    </div>
  )
}

// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import AdminPageTitle from '@/components/admin/AdminPageTitle'
import AdminStoreSettingsForm from '@/components/admin/AdminStoreSettingsForm'

export default async function AdminPengaturanPage() {
  const supabase = await createClient()
  const { data: store } = await supabase.from('store_info').select('*').single()

  return (
    <div>
      <AdminPageTitle
        title="Pengaturan Toko"
        subtitle="Informasi toko, kontak WhatsApp, dan sinkronisasi jam operasional real-time"
      />

      <AdminStoreSettingsForm store={store} />
    </div>
  )
}

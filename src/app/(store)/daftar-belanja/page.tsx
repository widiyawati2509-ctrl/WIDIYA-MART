// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import { getShoppingList } from '@/lib/actions/shopping-list'
import ShoppingListClient from '@/components/ShoppingListClient'
import { Heart } from 'lucide-react'

export const metadata = {
  title: 'Daftar Belanja & Favorit | PENGENJEK MART',
}

export default async function DaftarBelanjaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/masuk')

  const { data: items } = await getShoppingList()

  return (
    <div className="w-full pb-28">
      {/* Top Header */}
      <PageHeader
        title="Daftar Belanja & Favorit"
        subtitle="Produk yang disukai & dicatat"
        showBack={true}
        backHref="/profil"
        rightSlot={
          <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
            <Heart size={16} className="fill-rose-500/30" />
          </span>
        }
      />

      <div className="p-4">
        <ShoppingListClient initialItems={items || []} />
      </div>
    </div>
  )
}

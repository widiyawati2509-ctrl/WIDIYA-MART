// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getShoppingList } from '@/lib/actions/shopping-list'
import ShoppingListClient from '@/components/ShoppingListClient'
import { ChevronLeft, Bookmark } from 'lucide-react'

export const metadata = {
  title: 'Daftar Belanja | PENGENJEK MART',
}

export default async function DaftarBelanjaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/masuk')

  const { data: items } = await getShoppingList()

  return (
    <div className="w-full pb-28">
      {/* Top Header */}
      <div className="top-header sticky top-0 z-40 bg-[rgba(250,240,235,0.92)] backdrop-blur-md px-4 py-3.5 flex items-center justify-between border-b border-[rgba(232,214,205,0.8)] shadow-[0_4px_20px_-2px_rgba(43,24,16,0.06)]">
        <div className="flex items-center gap-2">
          <Link href="/profil" className="press p-1.5 -ml-1 rounded-full hover:bg-[var(--line)]/50 text-[var(--ink)]">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-sora font-bold text-sm text-[var(--ink)]">Daftar Belanja</h1>
            <p className="text-[10.5px] text-[var(--ink-soft)] font-medium">Catatan belanja yang disimpan</p>
          </div>
        </div>
        <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
          <Bookmark size={16} />
        </span>
      </div>

      <div className="p-4">
        <ShoppingListClient initialItems={items || []} />
      </div>
    </div>
  )
}

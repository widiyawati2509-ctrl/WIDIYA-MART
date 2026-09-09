// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { UserAddress } from '@/types/database'
import { getUserAddresses } from '@/lib/actions/addresses'
import { isStoreOpen } from '@/lib/utils'

// Dynamically import heavy AddressModal with ssr: false so it does not bloat initial JS bundle
const AddressModal = dynamic(() => import('./AddressModal'), { ssr: false })

interface AddressSelectorProps {
  initialAddresses?: UserAddress[]
  storeInfo?: {
    jam_buka?: string | null
    jam_tutup?: string | null
    jam_operasional?: string | null
  } | null
}

export default function AddressSelector({ initialAddresses, storeInfo }: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<UserAddress[]>(initialAddresses || [])
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(!initialAddresses)

  // Store open/close status state
  const [storeStatus, setStoreStatus] = useState(() =>
    isStoreOpen(storeInfo?.jam_buka, storeInfo?.jam_tutup, storeInfo?.jam_operasional)
  )

  useEffect(() => {
    setStoreStatus(isStoreOpen(storeInfo?.jam_buka, storeInfo?.jam_tutup, storeInfo?.jam_operasional))
    const interval = setInterval(() => {
      setStoreStatus(isStoreOpen(storeInfo?.jam_buka, storeInfo?.jam_tutup, storeInfo?.jam_operasional))
    }, 10000)
    return () => clearInterval(interval)
  }, [storeInfo?.jam_buka, storeInfo?.jam_tutup, storeInfo?.jam_operasional])

  // Load addresses & initialize active address
  useEffect(() => {
    let isMounted = true

    const initAddresses = async () => {
      let list = initialAddresses || []
      if (!initialAddresses) {
        setIsLoading(true)
        const res = await getUserAddresses()
        list = res.data || []
        if (isMounted) {
          setAddresses(list)
          setIsLoading(false)
        }
      }

      // Read from localStorage
      try {
        const saved = localStorage.getItem('pengenjek_selected_address')
        if (saved) {
          const parsed = JSON.parse(saved)
          const matched = list.find((a) => a.id === parsed.id)
          if (matched) {
            if (isMounted) setSelectedAddress(matched)
            return
          }
        }
      } catch (e) {
        console.error('Error reading saved address:', e)
      }

      // Default fallback: find default address or first address
      if (list.length > 0) {
        const def = list.find((a) => a.is_default) || list[0]
        if (isMounted) {
          setSelectedAddress(def)
          try {
            localStorage.setItem('pengenjek_selected_address', JSON.stringify(def))
          } catch (e) {}
        }
      } else {
        if (isMounted) setSelectedAddress(null)
      }
    }

    initAddresses()

    // Listen for custom address update events from other components
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<UserAddress>
      if (customEvent.detail) {
        setSelectedAddress(customEvent.detail)
      } else {
        getUserAddresses().then((res) => {
          if (isMounted && res.data) {
            setAddresses(res.data)
            const def = res.data.find((a) => a.is_default) || res.data[0] || null
            setSelectedAddress(def)
          }
        })
      }
    }

    window.addEventListener('pengenjek_address_changed', handleSync)
    return () => {
      isMounted = false
      window.removeEventListener('pengenjek_address_changed', handleSync)
    }
  }, [initialAddresses])

  // Select an address and persist in localStorage
  const handleSelectAddress = (addr: UserAddress) => {
    setSelectedAddress(addr)
    try {
      localStorage.setItem('pengenjek_selected_address', JSON.stringify(addr))
      window.dispatchEvent(new CustomEvent('pengenjek_address_changed', { detail: addr }))
    } catch (e) {
      console.error('Error saving selected address:', e)
    }
    setIsOpen(false)
  }

  // Handle address default changed
  const handleAddressDefaultChanged = (updated: UserAddress) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        is_default: a.id === updated.id,
      }))
    )
    setSelectedAddress(updated)
    try {
      localStorage.setItem('pengenjek_selected_address', JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('pengenjek_address_changed', { detail: updated }))
    } catch (e) {}
  }

  // Handle newly created address
  const handleAddressCreated = (added: UserAddress) => {
    setAddresses((prev) => {
      const next = added.is_default ? prev.map((a) => ({ ...a, is_default: false })) : [...prev]
      return [added, ...next]
    })
    handleSelectAddress(added)
  }

  return (
    <>
      {/* 1. SATU BARIS RINGKAS: ALAMAT & JAM BUKA TOKO */}
      <div className="flex flex-wrap items-center justify-between gap-x-2.5 gap-y-1 text-xs pt-2 border-t border-[rgba(232,214,205,0.7)] text-[var(--ink-soft)] font-medium leading-tight">
        {/* Info Alamat (Klik untuk buka modal ganti alamat) */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 min-w-0 flex-1 text-left cursor-pointer hover:opacity-85 transition-opacity focus:outline-none"
          title="Klik untuk memilih atau mengubah alamat pengiriman"
        >
          <span className="shrink-0 text-xs select-none">📍</span>
          {isLoading ? (
            <span className="h-3 w-24 bg-stone-200/80 animate-pulse rounded" />
          ) : selectedAddress ? (
            <div className="flex items-center gap-1 min-w-0 text-xs">
              <span className="font-sora font-bold text-[var(--ink)] shrink-0">
                {selectedAddress.label}
              </span>
              <span className="text-[var(--ink-soft)] shrink-0">·</span>
              <span className="text-[var(--ink-soft)] truncate max-w-[120px] xs:max-w-[160px]">
                {selectedAddress.alamat_lengkap}
              </span>
            </div>
          ) : (
            <span className="text-[var(--ink-soft)] text-xs truncate">
              Pilih Alamat Pengiriman
            </span>
          )}
        </button>

        {/* Info Jam Buka & Tombol [Ganti] */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/tentang"
            className="flex items-center gap-1 hover:underline text-[11px] font-medium transition-colors"
            title="Lihat detail info toko & jam operasional"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                storeStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className={storeStatus.isOpen ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
              {storeStatus.isOpen ? 'Buka' : 'Tutup'}
            </span>
            <span className="text-[var(--ink-soft)] font-medium">
              {storeStatus.timeRange.replace(/\s*-\s*/, '-')}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="text-[11px] font-sora font-bold text-[var(--accent-2)] hover:underline press shrink-0 ml-0.5"
            title="Ganti alamat pengiriman"
          >
            [Ganti]
          </button>
        </div>
      </div>

      {/* 2. DYNAMICALLY LOADED BOTTOM SHEET MODAL */}
      {isOpen && (
        <AddressModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          addresses={addresses}
          selectedAddress={selectedAddress}
          onSelectAddress={handleSelectAddress}
          onAddressCreated={handleAddressCreated}
          onAddressDefaultChanged={handleAddressDefaultChanged}
        />
      )}
    </>
  )
}

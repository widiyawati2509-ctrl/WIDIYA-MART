// @ts-nocheck
'use client'

import { Printer } from 'lucide-react'

export default function PrintReceiptButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn-3d btn-3d-white inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl text-gray-700 print:hidden"
    >
      <Printer className="w-3.5 h-3.5" />
      Cetak Struk
    </button>
  )
}

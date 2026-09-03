// @ts-nocheck
'use client'

import { Printer } from 'lucide-react'

export default function PrintReceiptButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 print:hidden"
    >
      <Printer className="w-3.5 h-3.5" />
      Cetak Struk
    </button>
  )
}

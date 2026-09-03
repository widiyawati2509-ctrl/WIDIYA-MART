// @ts-nocheck
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Widiya Mart',
    template: '%s | Widiya Mart',
  },
  description: 'Belanja kebutuhan sehari-hari di Widiya Mart. Pesan online, ambil di toko, bayar COD.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="font-sans bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}

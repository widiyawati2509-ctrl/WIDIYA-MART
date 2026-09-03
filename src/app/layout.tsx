// @ts-nocheck
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Widiya Mart',
    template: '%s | Widiya Mart',
  },
  description: 'Belanja kebutuhan sehari-hari di Widiya Mart. Pesan online, ambil di toko, bayar COD.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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

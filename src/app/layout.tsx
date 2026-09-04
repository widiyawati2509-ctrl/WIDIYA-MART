// @ts-nocheck
import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import TopProgressBar from '@/components/TopProgressBar'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#FF6B35',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  applicationName: 'Widiya Mart',
  title: {
    default: 'Widiya Mart',
    template: '%s | Widiya Mart',
  },
  description: 'Belanja kebutuhan sehari-hari di Widiya Mart. Pesan online, ambil di toko, bayar COD.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Widiya Mart',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/icon.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="font-sans antialiased bg-[var(--paper)] text-[var(--ink)] selection:bg-[var(--accent)]/20 min-h-screen">
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        {children}
      </body>
    </html>
  )
}

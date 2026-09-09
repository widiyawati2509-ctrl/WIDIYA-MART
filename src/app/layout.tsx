// @ts-nocheck
import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { Sora, Inter } from 'next/font/google'
import TopProgressBar from '@/components/TopProgressBar'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
  preload: true,
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

export const viewport: Viewport = {
  themeColor: '#FAF0EB',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  applicationName: 'PENGENJEK MART',
  title: {
    default: 'PENGENJEK MART',
    template: '%s | PENGENJEK MART',
  },
  description: 'Belanja kebutuhan sehari-hari di PENGENJEK MART. Pesan online, ambil di toko, bayar COD.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PENGENJEK MART',
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
    <html lang="id" className={`${sora.variable} ${inter.variable}`}>
      <head>
        <link
          rel="preconnect"
          href="https://byhpcdgehartffitbrde.supabase.co"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://byhpcdgehartffitbrde.supabase.co" />
      </head>
      <body className="font-sans antialiased bg-[var(--paper)] text-[var(--ink)] selection:bg-[var(--accent)]/20 min-h-screen">
        <ServiceWorkerRegister />
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        {children}
      </body>
    </html>
  )
}

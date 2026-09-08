'use client'

import { useEffect } from 'react'

interface AdminThemeColorProps {
  isAdmin?: boolean
}

export default function AdminThemeColor({ isAdmin = false }: AdminThemeColorProps) {
  useEffect(() => {
    const targetColor = isAdmin ? '#FF6B35' : '#FAF0EB'
    let meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'theme-color')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', targetColor)

    return () => {
      if (isAdmin) {
        const resetMeta = document.querySelector('meta[name="theme-color"]')
        if (resetMeta) {
          resetMeta.setAttribute('content', '#FAF0EB')
        }
      }
    }
  }, [isAdmin])

  return null
}

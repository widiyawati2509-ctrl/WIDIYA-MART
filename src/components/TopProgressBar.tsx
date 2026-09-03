'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function TopProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // When route changes complete, fill and fade out
    if (loading) {
      setProgress(100)
      const timer = setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [pathname, searchParams])

  useEffect(() => {
    // Intercept internal clicks to start bar immediately (0ms visual feedback)
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        target.target !== '_blank' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        // Same path without search params doesn't need bar
        if (href === window.location.pathname + window.location.search) return

        setLoading(true)
        setProgress(30)
        const t1 = setTimeout(() => setProgress(70), 100)
        const t2 = setTimeout(() => setProgress(85), 300)
        return () => {
          clearTimeout(t1)
          clearTimeout(t2)
        }
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  if (!loading && progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-[2.5px]">
      <div
        className="h-full bg-accent transition-all duration-200 ease-out shadow-[0_0_8px_var(--color-accent)]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 ? 'width 100ms ease-out, opacity 150ms 100ms' : 'width 250ms cubic-bezier(0.1, 0.9, 0.2, 1)',
        }}
      />
    </div>
  )
}

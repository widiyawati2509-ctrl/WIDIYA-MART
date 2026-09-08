'use client'

import { useEffect, useLayoutEffect } from 'react'

interface AdminThemeColorProps {
  isAdmin?: boolean
}

export default function AdminThemeColor({ isAdmin = false }: AdminThemeColorProps) {
  const syncThemeColor = () => {
    const targetColor = isAdmin ? '#FF6B35' : '#FAF0EB'
    const metas = document.querySelectorAll('meta[name="theme-color"]')
    if (metas.length > 0) {
      metas.forEach((el) => el.setAttribute('content', targetColor))
    } else {
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = targetColor
      document.head.appendChild(meta)
    }
  }

  useLayoutEffect(() => {
    syncThemeColor()
  }, [isAdmin])

  useEffect(() => {
    syncThemeColor()
    return () => {
      if (isAdmin) {
        document.querySelectorAll('meta[name="theme-color"]').forEach((el) => {
          el.setAttribute('content', '#FAF0EB')
        })
      }
    }
  }, [isAdmin])

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){
          var color = ${JSON.stringify(isAdmin ? '#FF6B35' : '#FAF0EB')};
          var metas = document.querySelectorAll('meta[name="theme-color"]');
          if (metas.length > 0) {
            for (var i = 0; i < metas.length; i++) {
              metas[i].setAttribute('content', color);
            }
          } else {
            var m = document.createElement('meta');
            m.name = 'theme-color';
            m.content = color;
            document.head.appendChild(m);
          }
        })();`,
      }}
    />
  )
}

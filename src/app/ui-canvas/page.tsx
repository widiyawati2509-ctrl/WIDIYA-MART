// @ts-nocheck
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button, Badge, Card, Input, Field, EmptyState } from '@/components/ui'
import StoreStatusBadge from '@/components/StoreStatusBadge'
import AlertBanner from '@/components/AlertBanner'
import { ShoppingBag, Maximize2, RotateCcw, ZoomIn, ZoomOut, Check } from 'lucide-react'

const STORAGE_KEY = 'widiya-mart-ui-canvas:v1'
const MIN_ZOOM = 0.4
const MAX_ZOOM = 2.2

interface CameraState {
  x: number
  y: number
  zoom: number
}

const DEFAULT_CAMERA: CameraState = { x: 48, y: 48, zoom: 1 }

export default function UIComponentCanvasPage() {
  const [camera, setCamera] = useState<CameraState>(DEFAULT_CAMERA)
  const [copiedName, setCopiedName] = useState<string | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const isPanningRef = useRef(false)
  const spaceHeldRef = useRef(false)
  const panStartRef = useRef({ x: 0, y: 0, camX: 0, camY: 0 })

  // Load versioned camera state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (
          parsed?.version === 1 &&
          Number.isFinite(parsed.x) &&
          Number.isFinite(parsed.y) &&
          Number.isFinite(parsed.zoom)
        ) {
          setCamera({
            x: Math.max(-2000, Math.min(2000, parsed.x)),
            y: Math.max(-2000, Math.min(2000, parsed.y)),
            zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, parsed.zoom)),
          })
        }
      }
    } catch {
      // safe fallback
    }
  }, [])

  // Persist camera state with debounce
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ version: 1, x: camera.x, y: camera.y, zoom: camera.zoom })
        )
      } catch {
        // ignore quota errors
      }
    }, 180)
    return () => clearTimeout(id)
  }, [camera])

  // Prevent horizontal history swipe while active
  useEffect(() => {
    const prevOverscroll = document.documentElement.style.overscrollBehaviorX
    document.documentElement.style.overscrollBehaviorX = 'none'
    return () => {
      document.documentElement.style.overscrollBehaviorX = prevOverscroll
    }
  }, [])

  // Keyboard shortcuts on canvas shell
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInteractive =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'BUTTON' ||
          target.isContentEditable)
      if (e.code === 'Space' && !isInteractive) {
        spaceHeldRef.current = true
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceHeldRef.current = false
      }
    }
    const handleBlur = () => {
      spaceHeldRef.current = false
      isPanningRef.current = false
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  const handleCopyName = (name: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(name).then(() => {
        setCopiedName(name)
        setTimeout(() => setCopiedName((cur) => (cur === name ? null : cur)), 1400)
      }).catch(() => {})
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    const isInteractive = target.closest('button, a, input, select, textarea, [data-preview-interactive]')
    if (e.button === 1 || spaceHeldRef.current || (!isInteractive && e.button === 0)) {
      isPanningRef.current = true
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        camX: camera.x,
        camY: camera.y,
      }
      e.currentTarget.setPointerCapture(e.pointerId)
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanningRef.current) return
    const dx = e.clientX - panStartRef.current.x
    const dy = e.clientY - panStartRef.current.y
    setCamera((prev) => ({
      ...prev,
      x: Math.max(-2400, Math.min(2400, panStartRef.current.camX + dx)),
      y: Math.max(-2400, Math.min(2400, panStartRef.current.camY + dy)),
    }))
  }

  const handlePointerUp = () => {
    isPanningRef.current = false
  }

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const rect = viewportRef.current?.getBoundingClientRect()
      if (!rect) return
      const pointerX = e.clientX - rect.left
      const pointerY = e.clientY - rect.top
      setCamera((prev) => {
        const factor = e.deltaY < 0 ? 1.08 : 0.92
        const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number((prev.zoom * factor).toFixed(3))))
        const scaleChange = nextZoom / prev.zoom
        const nextX = pointerX - (pointerX - prev.x) * scaleChange
        const nextY = pointerY - (pointerY - prev.y) * scaleChange
        return { x: nextX, y: nextY, zoom: nextZoom }
      })
    } else {
      setCamera((prev) => ({
        ...prev,
        x: Math.max(-2400, Math.min(2400, prev.x - e.deltaX)),
        y: Math.max(-2400, Math.min(2400, prev.y - e.deltaY)),
      }))
    }
  }, [])

  const zoomAroundCenter = (factor: number) => {
    const rect = viewportRef.current?.getBoundingClientRect()
    const cx = rect ? rect.width / 2 : 400
    const cy = rect ? rect.height / 2 : 300
    setCamera((prev) => {
      const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number((prev.zoom * factor).toFixed(3))))
      const scaleChange = nextZoom / prev.zoom
      return {
        x: cx - (cx - prev.x) * scaleChange,
        y: cy - (cy - prev.y) * scaleChange,
        zoom: nextZoom,
      }
    })
  }

  const handleFitAll = () => {
    const vp = viewportRef.current?.getBoundingClientRect()
    const content = contentRef.current
    if (!vp || !content) {
      setCamera(DEFAULT_CAMERA)
      return
    }
    const w = content.offsetWidth || 960
    const h = content.offsetHeight || 680
    const pad = 64
    const fitZoom = Math.max(
      MIN_ZOOM,
      Math.min(1, Number(Math.min((vp.width - pad) / w, (vp.height - pad) / h).toFixed(2)))
    )
    setCamera({
      x: Math.round((vp.width - w * fitZoom) / 2),
      y: Math.round((vp.height - h * fitZoom) / 2),
      zoom: fitZoom,
    })
  }

  const handleResetCamera = () => {
    setCamera(DEFAULT_CAMERA)
  }

  return (
    <div
      ref={viewportRef}
      tabIndex={0}
      aria-label="Widiya Mart Component Canvas"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return
        if (e.key === 'ArrowLeft') setCamera((c) => ({ ...c, x: c.x + 40 }))
        if (e.key === 'ArrowRight') setCamera((c) => ({ ...c, x: c.x - 40 }))
        if (e.key === 'ArrowUp') setCamera((c) => ({ ...c, y: c.y + 40 }))
        if (e.key === 'ArrowDown') setCamera((c) => ({ ...c, y: c.y - 40 }))
        if (e.key === '+' || e.key === '=') zoomAroundCenter(1.12)
        if (e.key === '-') zoomAroundCenter(0.88)
        if (e.key === '0') handleResetCamera()
      }}
      className="fixed inset-0 overflow-hidden bg-[var(--paper)] text-[var(--ink)] select-none outline-none"
      style={{ cursor: 'default' }}
    >
      {/*Transformed Canvas Stage */}
      <div
        ref={contentRef}
        style={{
          transform: `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.zoom})`,
          transformOrigin: '0 0',
        }}
        className="w-[1040px] space-y-10 p-4"
      >
        {/* Group 1: Button Variants & Sizes */}
        <div>
          <button
            type="button"
            onClick={() => handleCopyName('Button · variants & sizes')}
            title="Klik untuk menyalin nama grup"
            className="mb-2 text-xs font-sora font-bold text-[var(--ink-soft)] hover:text-[var(--ink)] flex items-center gap-1.5"
          >
            <span>Button · variants &amp; sizes</span>
            {copiedName === 'Button · variants & sizes' && (
              <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold">
                <Check size={12} aria-hidden="true" /> Copied
              </span>
            )}
          </button>
          <div
            data-preview-interactive
            className="rounded-2xl border border-dashed border-[var(--ink-soft)]/25 p-5 bg-white/50 grid grid-cols-2 gap-6"
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[var(--ink-soft)]">Style Comparison (size=&quot;md&quot;)</p>
              <div className="flex flex-wrap items-center gap-2.5">
                <Button variant="primary" size="md">Lanjutkan</Button>
                <Button variant="navy" size="md">Lanjutkan</Button>
                <Button variant="secondary" size="md">Lanjutkan</Button>
                <Button variant="ghost" size="md">Lanjutkan</Button>
                <Button variant="danger" size="md">Lanjutkan</Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[var(--ink-soft)]">Size &amp; Disabled Comparison (variant=&quot;primary&quot;)</p>
              <div className="flex flex-wrap items-center gap-2.5">
                <Button variant="primary" size="sm">Lanjutkan</Button>
                <Button variant="primary" size="md">Lanjutkan</Button>
                <Button variant="primary" size="lg">Lanjutkan</Button>
                <Button variant="primary" size="md" disabled>Lanjutkan</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Group 2: Badges & Store Status */}
        <div>
          <button
            type="button"
            onClick={() => handleCopyName('Badge & StoreStatusBadge · variants')}
            title="Klik untuk menyalin nama grup"
            className="mb-2 text-xs font-sora font-bold text-[var(--ink-soft)] hover:text-[var(--ink)] flex items-center gap-1.5"
          >
            <span>Badge &amp; StoreStatusBadge · variants</span>
            {copiedName === 'Badge & StoreStatusBadge · variants' && (
              <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold">
                <Check size={12} aria-hidden="true" /> Copied
              </span>
            )}
          </button>
          <div
            data-preview-interactive
            className="rounded-2xl border border-dashed border-[var(--ink-soft)]/25 p-5 bg-white/50 grid grid-cols-2 gap-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">Promo Desa</Badge>
              <Badge variant="navy">Terlaris</Badge>
              <Badge variant="neutral">Sembako</Badge>
              <Badge variant="positive">Gratis Ongkir</Badge>
              <Badge variant="danger">Stok Terbatas</Badge>
            </div>
            <div className="flex items-center gap-3">
              <StoreStatusBadge />
            </div>
          </div>
        </div>

        {/* Group 3: Cards, Form Fields, & Empty States */}
        <div>
          <button
            type="button"
            onClick={() => handleCopyName('Card, Field & EmptyState · surfaces')}
            title="Klik untuk menyalin nama grup"
            className="mb-2 text-xs font-sora font-bold text-[var(--ink-soft)] hover:text-[var(--ink)] flex items-center gap-1.5"
          >
            <span>Card, Field &amp; EmptyState · surfaces</span>
            {copiedName === 'Card, Field & EmptyState · surfaces' && (
              <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold">
                <Check size={12} aria-hidden="true" /> Copied
              </span>
            )}
          </button>
          <div
            data-preview-interactive
            className="rounded-2xl border border-dashed border-[var(--ink-soft)]/25 p-5 bg-white/50 grid grid-cols-3 gap-5"
          >
            <Card className="space-y-2.5">
              <h3 className="font-sora font-bold text-sm text-[var(--ink)]">Kartu Seragam Widiya Mart</h3>
              <p className="text-xs text-[var(--ink-soft)]">
                Seluruh kartu menggunakan radius <code className="px-1 py-0.5 rounded bg-[var(--paper)]">rounded-2xl</code>, border hangat, dan <code className="px-1 py-0.5 rounded bg-[var(--paper)]">tabular-nums</code>.
              </p>
              <p className="font-sora font-extrabold text-base text-[var(--accent-2)] tabular-nums">Rp 72.500</p>
            </Card>

            <Card className="space-y-2.5">
              <Field label="Nama Penerima" htmlFor="canvas-demo-input" helper="Data contoh terisolasi (aman)">
                <Input id="canvas-demo-input" defaultValue="Ibu Siti Rahma" />
              </Field>
              <AlertBanner type="success" message="Gratis ongkir dusun Pengenjek aktif" />
            </Card>

            <EmptyState
              icon={ShoppingBag}
              message="Keranjang belanja contoh masih kosong"
              action={<Button size="sm" variant="primary">Mulai Belanja</Button>}
            />
          </div>
        </div>
      </div>

      {/* Fixed Camera Controls */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-[var(--line)] rounded-2xl p-1.5 shadow-sm">
        <button
          type="button"
          onClick={() => zoomAroundCenter(0.88)}
          aria-label="Perkecil tampilan kanvas"
          className="press size-8 rounded-xl flex items-center justify-center text-[var(--ink)] hover:bg-[var(--paper)]"
        >
          <ZoomOut size={15} aria-hidden="true" />
        </button>
        <span className="px-2 text-xs font-sora font-bold text-[var(--ink)] tabular-nums">
          {Math.round(camera.zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => zoomAroundCenter(1.12)}
          aria-label="Perbesar tampilan kanvas"
          className="press size-8 rounded-xl flex items-center justify-center text-[var(--ink)] hover:bg-[var(--paper)]"
        >
          <ZoomIn size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleFitAll}
          aria-label="Tampilkan semua komponen (Fit All)"
          className="press size-8 rounded-xl flex items-center justify-center text-[var(--ink)] hover:bg-[var(--paper)]"
        >
          <Maximize2 size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleResetCamera}
          aria-label="Reset posisi kamera kanvas"
          className="press size-8 rounded-xl flex items-center justify-center text-[var(--ink)] hover:bg-[var(--paper)]"
        >
          <RotateCcw size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

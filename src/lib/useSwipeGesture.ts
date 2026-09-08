import { useState, useCallback } from 'react'

interface UseSwipeGestureOptions {
  /** Callback triggered on swipe left (next slide) */
  onSwipeLeft?: () => void
  /** Callback triggered on swipe right (previous slide) */
  onSwipeRight?: () => void
  /** Minimum horizontal delta required to count as a swipe (default 45px) */
  threshold?: number
  /** Ratio by which horizontal distance must exceed vertical distance (default 1.2) */
  verticalToleranceRatio?: number
  /** Optional extra action when touch starts (e.g. pause autoplay) */
  onTouchStartExtra?: () => void
  /** Optional extra action when touch ends (e.g. resume autoplay) */
  onTouchEndExtra?: () => void
}

/**
 * Standard touch gesture hook for media carousels, video players, and galleries
 * in Widiya Mart / Pengenjek Mart.
 * 
 * CORE RULES:
 * 1. NEVER intercept or block vertical scroll (ZERO onTouchMove, ZERO preventDefault).
 * 2. Compares gesture coordinates strictly between touchstart and touchend.
 * 3. Enforces horizontal dominance (diffX vs diffY) so natural vertical page
 *    scrolling over media NEVER triggers accidental slide transitions.
 * 4. Supplies 'touch-pan-y' so mobile browser gesture engines prioritize
 *    smooth 120fps vertical page scrolling without delay.
 */
export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  threshold = 45,
  verticalToleranceRatio = 1.2,
  onTouchStartExtra,
  onTouchEndExtra,
}: UseSwipeGestureOptions) {
  const [startX, setStartX] = useState<number | null>(null)
  const [startY, setStartY] = useState<number | null>(null)

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        setStartX(e.touches[0].clientX)
        setStartY(e.touches[0].clientY)
      }
      onTouchStartExtra?.()
    },
    [onTouchStartExtra]
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      onTouchEndExtra?.()
      if (startX === null || startY === null || !e.changedTouches || e.changedTouches.length === 0) {
        setStartX(null)
        setStartY(null)
        return
      }

      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY
      const diffX = startX - endX
      const diffY = startY - endY

      // Strictly verify horizontal intent vs vertical scrolling
      if (
        Math.abs(diffX) >= threshold &&
        Math.abs(diffX) > Math.abs(diffY) * verticalToleranceRatio
      ) {
        if (diffX > 0) {
          onSwipeLeft?.()
        } else {
          onSwipeRight?.()
        }
      }

      setStartX(null)
      setStartY(null)
    },
    [startX, startY, threshold, verticalToleranceRatio, onSwipeLeft, onSwipeRight, onTouchEndExtra]
  )

  return {
    handleTouchStart,
    handleTouchEnd,
    /** Apply this class to media containers so mobile browsers prioritize vertical page scroll */
    touchClassName: 'touch-pan-y',
  }
}

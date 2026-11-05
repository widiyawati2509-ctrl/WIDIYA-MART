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
 * Apple WWDC Momentum Projection formula (§6 apple-design):
 * Projects resting distance based on release velocity (px/s) and deceleration rate.
 */
export function projectMomentum(initialVelocity: number, decelerationRate = 0.996): number {
  return ((initialVelocity / 1000) * decelerationRate) / (1 - decelerationRate)
}

/**
 * Apple Rubber-Band boundary resistance formula (§9 apple-design):
 * Progressively dampens displacement when dragging past a boundary.
 */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}

/**
 * Standard touch gesture hook for media carousels, video players, and galleries
 * in Widiya Mart, enhanced with Apple momentum projection (§5 & §6).
 * 
 * CORE RULES:
 * 1. NEVER intercept or block vertical scroll (ZERO onTouchMove, ZERO preventDefault).
 * 2. Compares gesture coordinates + release velocity between touchstart and touchend.
 * 3. Projects resting endpoint using Apple's exponential decay formula so short,
 *    high-velocity flicks advance slides naturally alongside regular drags.
 * 4. Enforces horizontal dominance (diffX vs diffY) so vertical scrolling never triggers slides.
 * 5. Supplies 'touch-pan-y' so mobile browser gesture engines prioritize smooth 120fps scroll.
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
  const [startTime, setStartTime] = useState<number | null>(null)

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        setStartX(e.touches[0].clientX)
        setStartY(e.touches[0].clientY)
        setStartTime(performance.now())
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
        setStartTime(null)
        return
      }

      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY
      const diffX = startX - endX
      const diffY = startY - endY
      const elapsedSec = Math.max(0.016, (performance.now() - (startTime ?? performance.now())) / 1000)
      const velocityX = diffX / elapsedSec // px/s
      const projectedDiffX = diffX + projectMomentum(velocityX, 0.994)

      // Hysteresis (>10px) + horizontal dominance + either direct threshold OR projected momentum threshold
      const isHorizontalIntent =
        Math.abs(diffX) >= 12 &&
        Math.abs(diffX) > Math.abs(diffY) * verticalToleranceRatio

      if (
        isHorizontalIntent &&
        (Math.abs(diffX) >= threshold || Math.abs(projectedDiffX) >= threshold * 1.35)
      ) {
        // Decide direction by velocity sign (§7/Quick Reference)
        if (velocityX > 0) {
          onSwipeLeft?.()
        } else {
          onSwipeRight?.()
        }
      }

      setStartX(null)
      setStartY(null)
      setStartTime(null)
    },
    [startX, startY, startTime, threshold, verticalToleranceRatio, onSwipeLeft, onSwipeRight, onTouchEndExtra]
  )

  return {
    handleTouchStart,
    handleTouchEnd,
    /** Apply this class to media containers so mobile browsers prioritize vertical page scroll */
    touchClassName: 'touch-pan-y',
  }
}


import { useEffect, useRef, useState } from 'react'

interface TouchGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: (scale: number) => void
  threshold?: number
}

export function useTouchGestures(options: TouchGestureOptions) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [startTouch, setStartTouch] = useState<Touch | null>(null)
  const [isGesturing, setIsGesturing] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const threshold = options.threshold || 50

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        setStartTouch(e.touches[0])
        setIsGesturing(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!startTouch || !isGesturing) return

      if (e.touches.length === 2 && options.onPinch) {
        // Handle pinch gesture
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        )
        // Calculate scale based on initial distance (simplified)
        options.onPinch(distance / 100)
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startTouch || !isGesturing) return

      const endTouch = e.changedTouches[0]
      const deltaX = endTouch.clientX - startTouch.clientX
      const deltaY = endTouch.clientY - startTouch.clientY

      if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0 && options.onSwipeRight) {
            options.onSwipeRight()
          } else if (deltaX < 0 && options.onSwipeLeft) {
            options.onSwipeLeft()
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && options.onSwipeDown) {
            options.onSwipeDown()
          } else if (deltaY < 0 && options.onSwipeUp) {
            options.onSwipeUp()
          }
        }
      }

      setStartTouch(null)
      setIsGesturing(false)
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [options, startTouch, isGesturing])

  return elementRef
}

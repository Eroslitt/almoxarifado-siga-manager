
import * as React from "react"
import { useMobile } from "@/hooks/use-mobile"

interface ViewportProviderProps {
  children: React.ReactNode
}

export const ViewportProvider: React.FC<ViewportProviderProps> = ({ children }) => {
  const isMobile = useMobile()

  React.useEffect(() => {
    // Set viewport meta tag for mobile optimization
    const viewport = document.querySelector('meta[name="viewport"]')
    if (viewport) {
      if (isMobile) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        )
      } else {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, viewport-fit=cover'
        )
      }
    }

    // Prevent zoom on input focus for iOS
    if (isMobile && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
      const inputs = document.querySelectorAll('input, select, textarea')
      inputs.forEach(input => {
        if (input instanceof HTMLElement) {
          input.style.fontSize = '16px'
        }
      })
    }

    // Add touch-action optimization
    document.body.style.touchAction = 'manipulation'
    
    return () => {
      document.body.style.touchAction = ''
    }
  }, [isMobile])

  React.useEffect(() => {
    // Add mobile-specific CSS classes to body
    if (isMobile) {
      document.body.classList.add('mobile-device')
    } else {
      document.body.classList.remove('mobile-device')
    }

    return () => {
      document.body.classList.remove('mobile-device')
    }
  }, [isMobile])

  return <>{children}</>
}

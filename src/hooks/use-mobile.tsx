
import * as React from 'react'

export function useMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 768
  })

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const mql = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile('matches' in e ? e.matches : (e as MediaQueryList).matches)

    // Initial set
    setIsMobile(mql.matches)

    // Subscribe to media query changes
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler as EventListener)
    } else {
      // @ts-ignore - Safari <14
      mql.addListener(handler)
    }

    // Fallback on resize
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)

    return () => {
      if (typeof mql.removeEventListener === 'function') {
        mql.removeEventListener('change', handler as EventListener)
      } else {
        // @ts-ignore - Safari <14
        mql.removeListener(handler)
      }
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return isMobile
}


import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  connectionType: string
  isSlowConnection: boolean
  deviceMemory: number
  isLowEndDevice: boolean
}

export function useMobilePerformance(): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    connectionType: 'unknown',
    isSlowConnection: false,
    deviceMemory: 4,
    isLowEndDevice: false
  })

  useEffect(() => {
    const updateMetrics = () => {
      // Check connection type
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      let connectionType = 'unknown'
      let isSlowConnection = false

      if (connection) {
        connectionType = connection.effectiveType || 'unknown'
        isSlowConnection = ['slow-2g', '2g', '3g'].includes(connectionType)
      }

      // Check device memory
      const deviceMemory = (navigator as any).deviceMemory || 4
      const isLowEndDevice = deviceMemory <= 2

      setMetrics({
        connectionType,
        isSlowConnection,
        deviceMemory,
        isLowEndDevice
      })
    }

    updateMetrics()

    // Listen for connection changes
    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', updateMetrics)
      return () => connection.removeEventListener('change', updateMetrics)
    }
  }, [])

  return metrics
}

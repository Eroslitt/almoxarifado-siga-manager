
import { lazy, Suspense } from 'react';
import { MobileLoading } from '@/components/ui/mobile-loading';

// Lazy load heavy components
export const LazyAnalyticsDashboard = lazy(() => 
  import('@/components/analytics/AnalyticsDashboard').then(module => ({
    default: module.AnalyticsDashboard
  }))
);

export const LazyReservationCalendar = lazy(() => 
  import('@/components/reservations/ReservationCalendar').then(module => ({
    default: module.ReservationCalendar
  }))
);

export const LazyMaintenanceDashboard = lazy(() => 
  import('@/components/maintenance/MaintenanceDashboard').then(module => ({
    default: module.MaintenanceDashboard
  }))
);

export const LazyKittingCheckout = lazy(() => 
  import('@/components/kitting/KittingCheckout').then(module => ({
    default: module.KittingCheckout
  }))
);

export const LazyWorkTemplateManager = lazy(() => 
  import('@/components/kitting/WorkTemplateManager').then(module => ({
    default: module.WorkTemplateManager
  }))
);

export const LazyNotificationCenter = lazy(() => 
  import('@/components/notifications/NotificationCenter').then(module => ({
    default: module.NotificationCenter
  }))
);

// Wrapper component with loading state
interface LazyWrapperProps {
  children: React.ReactNode;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ children }) => (
  <Suspense fallback={
    <div className="flex items-center justify-center p-8">
      <MobileLoading 
        size="lg" 
        text="Carregando módulo..."
      />
    </div>
  }>
    {children}
  </Suspense>
);


import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { MobileLayout } from '@/components/layout/MobileLayout';
import DashboardMain from '@/components/DashboardMain';
import { MasterDataModule } from '@/components/MasterDataModule';
import { StockModule } from '@/components/StockModule';
import { ToolsQRModule } from '@/components/ToolsQRModule';
import { ReceivingModule } from '@/components/ReceivingModule';
import { ShippingModule } from '@/components/ShippingModule';
import { ReportsModule } from '@/components/ReportsModule';
import { MoreOptionsModule } from '@/components/MoreOptionsModule';
import { AdvancedNotificationCenter } from '@/components/notifications/AdvancedNotificationCenter';
import { GlobalSearchV2 } from '@/components/search/GlobalSearchV2';
import { PersonalizedDashboard } from '@/components/dashboard/PersonalizedDashboard';
import { AIAnalyticsDashboard } from '@/components/analytics/AIAnalyticsDashboard';
import { PerformanceMonitor } from '@/components/system/PerformanceMonitor';
import { APIManager } from '@/components/integration/APIManager';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';
import { RealTimeAnalyticsDashboard } from '@/components/analytics/RealTimeAnalyticsDashboard';
import { WorkflowManager } from '@/components/workflow/WorkflowManager';
import { ConnectorHub } from '@/components/integration/ConnectorHub';
import { PWAInstaller } from '@/components/mobile/PWAInstaller';
import { AccessibilityMenu } from '@/components/accessibility/AccessibilityMenu';
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext';
import { AuthProvider } from '@/components/AuthProvider';
import { ViewportProvider } from '@/components/ui/viewport-provider';
import { useMobile } from '@/hooks/use-mobile';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

const IndexContent = () => {
  const { user, loading } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');

  // Redirect if not authenticated or no subscription
  useEffect(() => {
    if (!loading) {
      if (!user) {
        window.location.href = '/auth';
        return;
      }
      if (user.subscription_status !== 'active') {
        window.location.href = '/pricing';
        return;
      }
    }
  }, [user, loading]);
  const { setSidebarCollapsed, setBreadcrumbs } = useNavigation();
  const isMobile = useMobile();

  useEffect(() => {
    // Update breadcrumbs when module changes
    const updateBreadcrumbs = () => {
      switch (activeModule) {
        case 'dashboard':
          setBreadcrumbs([]);
          break;
        case 'more':
          setBreadcrumbs([{ label: 'Mais Opções', path: '/more' }]);
          break;
        case 'personalized-dashboard':
          setBreadcrumbs([{ label: 'Dashboard Personalizado', path: '/personalized-dashboard' }]);
          break;
        case 'ai-analytics':
          setBreadcrumbs([{ label: 'Analytics IA', path: '/ai-analytics' }]);
          break;
        case 'realtime-analytics':
          setBreadcrumbs([{ label: 'Analytics Tempo Real', path: '/realtime-analytics' }]);
          break;
        case 'workflow-manager':
          setBreadcrumbs([{ label: 'Gestão de Workflows', path: '/workflow-manager' }]);
          break;
        case 'connector-hub':
          setBreadcrumbs([{ label: 'Hub de Conectores', path: '/connector-hub' }]);
          break;
        case 'performance-monitor':
          setBreadcrumbs([{ label: 'Monitor de Performance', path: '/performance-monitor' }]);
          break;
        case 'api-manager':
          setBreadcrumbs([{ label: 'Gerenciamento de APIs', path: '/api-manager' }]);
          break;
        case 'security-dashboard':
          setBreadcrumbs([{ label: 'Dashboard de Segurança', path: '/security-dashboard' }]);
          break;
        case 'masterdata':
          setBreadcrumbs([{ label: 'Master Data', path: '/masterdata' }]);
          break;
        case 'stock':
          setBreadcrumbs([{ label: 'Gestão de Estoque', path: '/stock' }]);
          break;
        case 'tools-qr':
          setBreadcrumbs([{ label: 'Ferramentas QR', path: '/tools-qr' }]);
          break;
        case 'receiving':
          setBreadcrumbs([{ label: 'Recebimento', path: '/receiving' }]);
          break;
        case 'shipping':
          setBreadcrumbs([{ label: 'Expedição', path: '/shipping' }]);
          break;
        case 'reports':
          setBreadcrumbs([{ label: 'Relatórios', path: '/reports' }]);
          break;
        default:
          setBreadcrumbs([]);
      }
    };

    updateBreadcrumbs();
  }, [activeModule, setBreadcrumbs]);

  const handleModuleChange = (module: string) => {
    setActiveModule(module);
    setSidebarCollapsed(true); // Close sidebar on mobile after selection
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardMain onModuleChange={setActiveModule} />;
      case 'more':
        return <MoreOptionsModule onModuleChange={handleModuleChange} />;
      case 'personalized-dashboard':
        return <PersonalizedDashboard />;
      case 'ai-analytics':
        return <AIAnalyticsDashboard />;
      case 'realtime-analytics':
        return <RealTimeAnalyticsDashboard />;
      case 'workflow-manager':
        return <WorkflowManager />;
      case 'connector-hub':
        return <ConnectorHub />;
      case 'performance-monitor':
        return <PerformanceMonitor />;
      case 'api-manager':
        return <APIManager />;
      case 'security-dashboard':
        return <SecurityDashboard />;
      case 'masterdata':
        return <MasterDataModule />;
      case 'stock':
        return <StockModule />;
      case 'tools-qr':
        return <ToolsQRModule />;
      case 'receiving':
        return <ReceivingModule />;
      case 'shipping':
        return <ShippingModule />;
      case 'reports':
        return <ReportsModule />;
      default:
        return <DashboardMain onModuleChange={setActiveModule} />;
    }
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <AuthProvider>
        <ViewportProvider>
          <MobileLayout 
            activeModule={activeModule}
            onModuleChange={handleModuleChange}
          >
            {renderModule()}
          </MobileLayout>
          <PWAInstaller />
          <AccessibilityMenu />
          <Toaster />
          <Sonner />
        </ViewportProvider>
      </AuthProvider>
    );
  }

  // Desktop Layout
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar activeModule={activeModule} onModuleChange={handleModuleChange} />
        <div className="flex-1 flex flex-col min-w-0">
          <div className="border-b bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 max-w-2xl">
                <GlobalSearchV2 />
              </div>
              <div className="flex items-center gap-2">
                <AdvancedNotificationCenter />
              </div>
            </div>
          </div>
          <main className="flex-1 overflow-auto">
            {renderModule()}
          </main>
        </div>
        <PWAInstaller />
        <AccessibilityMenu />
        <Toaster />
        <Sonner />
      </div>
    </AuthProvider>
  );
};

const Index = () => {
  return (
    <NavigationProvider>
      <IndexContent />
    </NavigationProvider>
  );
};

export default Index;

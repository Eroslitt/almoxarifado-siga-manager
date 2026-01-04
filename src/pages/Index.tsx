import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Dashboard } from '@/components/Dashboard';
import { MasterDataModule } from '@/components/MasterDataModule';
import { StockModule } from '@/components/StockModule';
import { ToolsQRModule } from '@/components/ToolsQRModule';
import { ReceivingModule } from '@/components/ReceivingModule';
import { ShippingModule } from '@/components/ShippingModule';
import { ReportsModule } from '@/components/ReportsModule';
import { MoreOptionsModule } from '@/components/MoreOptionsModule';
import { MaterialVerificationModule } from '@/components/MaterialVerificationModule';
import { EPIControlModule } from '@/components/EPIControlModule';
import { MaterialRequestModule } from '@/components/MaterialRequestModule';
import PatrimoniosModule from '@/components/PatrimoniosModule';
import { AdvancedNotificationCenter } from '@/components/notifications/AdvancedNotificationCenter';
import { GlobalSearchV2 } from '@/components/search/GlobalSearchV2';
import { PersonalizedDashboard } from '@/components/dashboard/PersonalizedDashboard';
import { AIAnalyticsDashboard } from '@/components/analytics/AIAnalyticsDashboard';
import { PerformanceMonitor } from '@/components/system/PerformanceMonitor';
import { SyncMonitor } from '@/components/system/SyncMonitor';
import { APIManager } from '@/components/integration/APIManager';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';
import { RealTimeAnalyticsDashboard } from '@/components/analytics/RealTimeAnalyticsDashboard';
import { WorkflowManager } from '@/components/workflow/WorkflowManager';
import { ConnectorHub } from '@/components/integration/ConnectorHub';
import { PWAInstaller } from '@/components/mobile/PWAInstaller';
import { AccessibilityMenu } from '@/components/accessibility/AccessibilityMenu';
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext';
import { AuthProvider } from '@/components/AuthProvider';
import { AuthButton } from '@/components/AuthButton';
import { ViewportProvider } from '@/components/ui/viewport-provider';
import { useMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { isDemoMode } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, User } from 'lucide-react';

const IndexContent = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(!isDemoMode);
  const { setSidebarCollapsed, setBreadcrumbs } = useNavigation();
  const isMobile = useMobile();

  // Set up demo user immediately if in demo mode
  useEffect(() => {
    if (isDemoMode) {
      setCurrentUser({
        id: 'demo-user-123',
        email: 'demo@siga.com',
        user_metadata: { full_name: 'Usuário Demo' }
      });
      setLoadingUser(false);
      return;
    }

    let mounted = true;

    const getCurrentUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setCurrentUser(session?.user || null);
          setLoadingUser(false);
        }
      } catch (error) {
        console.error('Error getting user:', error);
        if (mounted) {
          setLoadingUser(false);
        }
      }
    };

    getCurrentUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setCurrentUser(session?.user || null);
        setLoadingUser(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleRefreshUser = useCallback(async () => {
    if (isDemoMode) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  useEffect(() => {
    const breadcrumbMap: Record<string, { label: string; path: string }[]> = {
      'dashboard': [],
      'more': [{ label: 'Mais Opções', path: '/more' }],
      'personalized-dashboard': [{ label: 'Dashboard Personalizado', path: '/personalized-dashboard' }],
      'ai-analytics': [{ label: 'Analytics IA', path: '/ai-analytics' }],
      'realtime-analytics': [{ label: 'Analytics Tempo Real', path: '/realtime-analytics' }],
      'workflow-manager': [{ label: 'Gestão de Workflows', path: '/workflow-manager' }],
      'connector-hub': [{ label: 'Hub de Conectores', path: '/connector-hub' }],
      'performance-monitor': [{ label: 'Monitor de Performance', path: '/performance-monitor' }],
      'sync-monitor': [{ label: 'Monitor de Sincronização', path: '/sync-monitor' }],
      'api-manager': [{ label: 'Gerenciamento de APIs', path: '/api-manager' }],
      'security-dashboard': [{ label: 'Dashboard de Segurança', path: '/security-dashboard' }],
      'masterdata': [{ label: 'Master Data', path: '/masterdata' }],
      'stock': [{ label: 'Gestão de Estoque', path: '/stock' }],
      'tools-qr': [{ label: 'Ferramentas QR', path: '/tools-qr' }],
      'receiving': [{ label: 'Recebimento', path: '/receiving' }],
      'shipping': [{ label: 'Expedição', path: '/shipping' }],
      'reports': [{ label: 'Relatórios', path: '/reports' }],
      'material-verification': [{ label: 'Verificação de Materiais', path: '/material-verification' }],
      'epi-control': [{ label: 'Controle de EPIs', path: '/epi-control' }],
      'material-request': [{ label: 'Requisição de Materiais', path: '/material-request' }],
      'patrimonios': [{ label: 'Patrimônios', path: '/patrimonios' }],
    };

    setBreadcrumbs(breadcrumbMap[activeModule] || []);
  }, [activeModule, setBreadcrumbs]);

  const handleModuleChange = (module: string) => {
    setActiveModule(module);
    setSidebarCollapsed(true);
  };

  const renderModule = () => {
    const modules: Record<string, React.ReactNode> = {
      'dashboard': <Dashboard />,
      'more': <MoreOptionsModule onModuleChange={handleModuleChange} />,
      'personalized-dashboard': <PersonalizedDashboard />,
      'ai-analytics': <AIAnalyticsDashboard />,
      'realtime-analytics': <RealTimeAnalyticsDashboard />,
      'workflow-manager': <WorkflowManager />,
      'connector-hub': <ConnectorHub />,
      'performance-monitor': <PerformanceMonitor />,
      'sync-monitor': <SyncMonitor />,
      'api-manager': <APIManager />,
      'security-dashboard': <SecurityDashboard />,
      'masterdata': <MasterDataModule />,
      'stock': <StockModule />,
      'tools-qr': <ToolsQRModule />,
      'receiving': <ReceivingModule />,
      'shipping': <ShippingModule />,
      'reports': <ReportsModule />,
      'material-verification': <MaterialVerificationModule />,
      'epi-control': <EPIControlModule />,
      'material-request': <MaterialRequestModule />,
      'patrimonios': <PatrimoniosModule />,
    };

    return modules[activeModule] || <Dashboard />;
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
        </ViewportProvider>
      </AuthProvider>
    );
  }

  // Desktop Layout
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background flex">
        <Sidebar activeModule={activeModule} onModuleChange={handleModuleChange} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="border-b bg-card px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 max-w-2xl">
                <GlobalSearchV2 />
              </div>
              <div className="flex items-center gap-3">
                {isDemoMode && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
                    <User className="h-4 w-4" />
                    <span>Modo Demo</span>
                  </div>
                )}
                {!loadingUser && !currentUser && !isDemoMode && (
                  <Link to="/auth">
                    <Button variant="outline" size="sm">
                      <LogIn className="h-4 w-4 mr-2" />
                      Entrar
                    </Button>
                  </Link>
                )}
                {(currentUser || isDemoMode) && (
                  <AuthButton user={currentUser} onAuthChange={handleRefreshUser} />
                )}
                <AdvancedNotificationCenter />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {renderModule()}
          </main>
        </div>
        <PWAInstaller />
        <AccessibilityMenu />
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

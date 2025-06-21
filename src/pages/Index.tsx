
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Dashboard } from '@/components/Dashboard';
import { MasterDataModule } from '@/components/MasterDataModule';
import { StockModule } from '@/components/StockModule';
import { ToolsQRModule } from '@/components/ToolsQRModule';
import { ReceivingModule } from '@/components/ReceivingModule';
import { ShippingModule } from '@/components/ShippingModule';
import { ReportsModule } from '@/components/ReportsModule';
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

const IndexContent = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const { setSidebarCollapsed, setBreadcrumbs } = useNavigation();

  useEffect(() => {
    // Update breadcrumbs when module changes
    const updateBreadcrumbs = () => {
      switch (activeModule) {
        case 'dashboard':
          setBreadcrumbs([]);
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
        return <Dashboard />;
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
        return <Dashboard />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar activeModule={activeModule} onModuleChange={handleModuleChange} />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          <main className="flex-1 overflow-auto">
            {renderModule()}
          </main>
        </div>
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

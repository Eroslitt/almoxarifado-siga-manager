import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { StockModule } from '@/components/StockModule';
import { ToolsQRModule } from '@/components/ToolsQRModule';
import { ReceivingModule } from '@/components/ReceivingModule';
import { ShippingModule } from '@/components/ShippingModule';
import { ReportsModule } from '@/components/ReportsModule';
import { MasterDataModule } from '@/components/MasterDataModule';

const Index = () => {
  const [activeModule, setActiveModule] = useState('dashboard');

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
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
      <main className="flex-1 overflow-auto">
        {renderModule()}
      </main>
    </div>
  );
};

export default Index;

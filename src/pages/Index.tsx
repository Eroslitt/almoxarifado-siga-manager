
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { StockModule } from '@/components/StockModule';
import { ReceivingModule } from '@/components/ReceivingModule';
import { ShippingModule } from '@/components/ShippingModule';
import { ReportsModule } from '@/components/ReportsModule';

const Index = () => {
  const [activeModule, setActiveModule] = useState('dashboard');

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'stock':
        return <StockModule />;
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

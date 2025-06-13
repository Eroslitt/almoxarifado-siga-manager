
import React from 'react';
import { ResponsiveTabs, ResponsiveTabsContent, ResponsiveTabsList, ResponsiveTabsTrigger } from '@/components/ui/responsive-tabs';
import { BlueprintQRScanner } from './BlueprintQRScanner';
import { BlueprintLivePanel } from './BlueprintLivePanel';
import { ToolsOverview } from './ToolsOverview';
import { ToolsManagement } from './ToolsManagement';
import { QRScanner } from './QRScanner';
import { SmartQRScanner } from './SmartQRScanner';
import { RealTimeMovementsDashboard } from './RealTimeMovementsDashboard';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { KittingCheckout } from '@/components/kitting/KittingCheckout';
import { WorkTemplateManager } from '@/components/kitting/WorkTemplateManager';
import { QRCodeGenerator } from './QRCodeGenerator';
import { LabelPrinter } from './LabelPrinter';
import { RealTimeMovements } from './RealTimeMovements';

export const ToolsTabsContainer: React.FC = () => {
  // Mock tools para o gerador/impressora
  const mockTools = [
    {
      id: 'FER-08172',
      name: 'Furadeira de Impacto Makita',
      category: 'Elétrica',
      status: 'available' as const,
      location: 'A-01-05',
      qr_code: 'FER-08172-QR',
      registration_date: '2024-01-15',
      last_maintenance: '2024-05-10',
      next_maintenance: '2024-11-10',
      current_user_id: null,
      usage_hours: 150,
      maintenance_interval_hours: 200,
      purchase_price: 450.00,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: 'FER-03945',
      name: 'Chave de Fenda Philips 6mm',
      category: 'Manual',
      status: 'available' as const,
      location: 'B-02-12',
      qr_code: 'FER-03945-QR',
      registration_date: '2024-02-20',
      last_maintenance: null,
      next_maintenance: null,
      current_user_id: null,
      usage_hours: 0,
      maintenance_interval_hours: 0,
      purchase_price: 15.50,
      created_at: '2024-02-20T00:00:00Z',
      updated_at: '2024-02-20T00:00:00Z'
    }
  ];

  return (
    <ResponsiveTabs defaultValue="blueprint-scanner" className="space-y-4">
      <ResponsiveTabsList>
        <ResponsiveTabsTrigger value="blueprint-scanner">SGF-QR v2.0</ResponsiveTabsTrigger>
        <ResponsiveTabsTrigger value="blueprint-panel">Painel Gestor</ResponsiveTabsTrigger>
        <ResponsiveTabsTrigger value="overview">Visão Geral</ResponsiveTabsTrigger>
        <ResponsiveTabsTrigger value="management">Gestão</ResponsiveTabsTrigger>
        <ResponsiveTabsTrigger value="scanner">QR Scanner</ResponsiveTabsTrigger>
        <ResponsiveTabsTrigger value="smart-scanner">Smart Scanner</ResponsiveTabsTrigger>
        <ResponsiveTabsTrigger value="dashboard">Dashboard</ResponsiveTabsTrigger>
        <ResponsiveTabsTrigger value="notifications">Notificações</ResponsiveTabsTrigger>
        <ResponsiveTabsTrigger value="kitting">Kitting</ResponsiveTabsTrigger>
        <ResponsiveTabsTrigger value="templates">Templates</ResponsiveTabsTrigger>
        <ResponsiveTabsTrigger value="qr-generator">Gerar QR</ResponsiveTabsTrigger>
        <ResponsiveTabsTrigger value="labels">Etiquetas</ResponsiveTabsTrigger>
      </ResponsiveTabsList>

      <ResponsiveTabsContent value="blueprint-scanner" className="space-y-4">
        <BlueprintQRScanner />
      </ResponsiveTabsContent>

      <ResponsiveTabsContent value="blueprint-panel" className="space-y-4">
        <BlueprintLivePanel />
      </ResponsiveTabsContent>

      <ResponsiveTabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          <ToolsOverview />
          <RealTimeMovements />
        </div>
      </ResponsiveTabsContent>

      <ResponsiveTabsContent value="management" className="space-y-4">
        <ToolsManagement />
      </ResponsiveTabsContent>

      <ResponsiveTabsContent value="scanner" className="space-y-4">
        <QRScanner />
      </ResponsiveTabsContent>

      <ResponsiveTabsContent value="smart-scanner" className="space-y-4">
        <SmartQRScanner />
      </ResponsiveTabsContent>

      <ResponsiveTabsContent value="dashboard" className="space-y-4">
        <RealTimeMovementsDashboard />
      </ResponsiveTabsContent>

      <ResponsiveTabsContent value="notifications" className="space-y-4">
        <NotificationCenter />
      </ResponsiveTabsContent>

      <ResponsiveTabsContent value="kitting" className="space-y-4">
        <KittingCheckout />
      </ResponsiveTabsContent>

      <ResponsiveTabsContent value="templates" className="space-y-4">
        <WorkTemplateManager />
      </ResponsiveTabsContent>

      <ResponsiveTabsContent value="qr-generator" className="space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          <QRCodeGenerator />
          <QRCodeGenerator tool={mockTools[0]} />
        </div>
      </ResponsiveTabsContent>

      <ResponsiveTabsContent value="labels" className="space-y-4">
        <LabelPrinter tools={mockTools} />
      </ResponsiveTabsContent>
    </ResponsiveTabs>
  );
};

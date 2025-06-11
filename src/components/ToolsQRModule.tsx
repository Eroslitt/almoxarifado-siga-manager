
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolsHeader } from '@/components/tools/ToolsHeader';
import { ToolsStats } from '@/components/tools/ToolsStats';
import { ToolsOverview } from '@/components/tools/ToolsOverview';
import { ToolsManagement } from '@/components/tools/ToolsManagement';
import { QRScanner } from '@/components/tools/QRScanner';
import { ToolsReports } from '@/components/tools/ToolsReports';
import { RecentMovements } from '@/components/tools/RecentMovements';

export const ToolsQRModule = () => {
  // Mock data para demonstração
  const toolsStats = {
    total: 145,
    available: 98,
    inUse: 35,
    maintenance: 12
  };

  const recentMovements = [
    {
      id: 1,
      tool: 'Furadeira de Impacto Makita',
      toolId: 'FER-08172',
      user: 'João Silva',
      action: 'Retirada',
      timestamp: '2024-06-11 14:30',
      status: 'in-use'
    },
    {
      id: 2,
      tool: 'Chave de Fenda Philips',
      toolId: 'FER-03945',
      user: 'Maria Santos',
      action: 'Devolução',
      timestamp: '2024-06-11 14:15',
      status: 'available',
      condition: 'Perfeita'
    },
    {
      id: 3,
      tool: 'Alicate Universal',
      toolId: 'FER-05621',
      user: 'Carlos Oliveira',
      action: 'Devolução',
      timestamp: '2024-06-11 13:45',
      status: 'maintenance',
      condition: 'Cabo com mau contato'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <ToolsHeader />

      <ToolsStats stats={toolsStats} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="management">Gestão</TabsTrigger>
          <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ToolsOverview />
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <ToolsManagement />
        </TabsContent>

        <TabsContent value="scanner" className="space-y-4">
          <QRScanner />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ToolsReports />
        </TabsContent>
      </Tabs>

      <RecentMovements movements={recentMovements} />
    </div>
  );
};

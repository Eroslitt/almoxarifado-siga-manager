
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolsHeader } from '@/components/tools/ToolsHeader';
import { ToolsStats } from '@/components/tools/ToolsStats';
import { ToolsOverview } from '@/components/tools/ToolsOverview';
import { ToolsManagement } from '@/components/tools/ToolsManagement';
import { QRScanner } from '@/components/tools/QRScanner';
import { ToolsReports } from '@/components/tools/ToolsReports';
import { RecentMovements } from '@/components/tools/RecentMovements';
import { QRCodeGenerator } from '@/components/tools/QRCodeGenerator';
import { LabelPrinter } from '@/components/tools/LabelPrinter';

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
      current_user_id: null,
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
      current_user_id: null,
      created_at: '2024-02-20T00:00:00Z',
      updated_at: '2024-02-20T00:00:00Z'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <ToolsHeader />

      <ToolsStats stats={toolsStats} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="management">Gestão</TabsTrigger>
          <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
          <TabsTrigger value="qr-generator">Gerar QR</TabsTrigger>
          <TabsTrigger value="labels">Etiquetas</TabsTrigger>
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

        <TabsContent value="qr-generator" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QRCodeGenerator />
            <QRCodeGenerator tool={mockTools[0]} />
          </div>
        </TabsContent>

        <TabsContent value="labels" className="space-y-4">
          <LabelPrinter tools={mockTools} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ToolsReports />
        </TabsContent>
      </Tabs>

      <RecentMovements movements={recentMovements} />
    </div>
  );
};

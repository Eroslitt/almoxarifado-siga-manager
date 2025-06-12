import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolsHeader } from '@/components/tools/ToolsHeader';
import { ToolsStats } from '@/components/tools/ToolsStats';
import { ToolsOverview } from '@/components/tools/ToolsOverview';
import { ToolsManagement } from '@/components/tools/ToolsManagement';
import { QRScanner } from '@/components/tools/QRScanner';
import { SmartQRScanner } from '@/components/tools/SmartQRScanner';
import { ToolsReports } from '@/components/tools/ToolsReports';
import { RealTimeMovements } from '@/components/tools/RealTimeMovements';
import { RealTimeMovementsDashboard } from '@/components/tools/RealTimeMovementsDashboard';
import { QRCodeGenerator } from '@/components/tools/QRCodeGenerator';
import { LabelPrinter } from '@/components/tools/LabelPrinter';
import { AlertsManagement } from '@/components/tools/AlertsManagement';
import { ReservationsManagement } from '@/components/tools/ReservationsManagement';
import { MaintenanceManagement } from '@/components/tools/MaintenanceManagement';
import { WorkTemplateManager } from '@/components/kitting/WorkTemplateManager';
import { KittingCheckout } from '@/components/kitting/KittingCheckout';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { TraceabilityReports } from '@/components/reports/TraceabilityReports';
import { cacheService } from '@/services/cacheService';
import { notificationService } from '@/services/notificationService';
import { reservationService } from '@/services/reservationService';
import { webSocketService } from '@/services/webSocketService';
import { BlueprintQRScanner } from '@/components/tools/BlueprintQRScanner';
import { BlueprintLivePanel } from '@/components/tools/BlueprintLivePanel';

export const ToolsQRModule = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize all services
  useEffect(() => {
    const initializeServices = async () => {
      console.log('🚀 Initializing SIGA Advanced Services...');
      
      try {
        // Initialize services in parallel
        await Promise.all([
          cacheService.init(),
          notificationService.init(),
          reservationService.init(),
          webSocketService.connect()
        ]);

        // Register service worker for PWA
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js')
            .then(registration => {
              console.log('✅ Service Worker registered:', registration);
            })
            .catch(error => {
              console.error('Service Worker registration failed:', error);
            });
        }

        // Setup real-time event handlers
        webSocketService.subscribe('tool_movement', (data) => {
          console.log('🔧 Real-time tool movement:', data);
          notificationService.showToolMovement(data.tool.name, data.user.name, data.type);
        });

        webSocketService.subscribe('stock_alert', (data) => {
          console.log('📦 Real-time stock alert:', data);
          notificationService.showStockAlert(data.item, data.currentStock, data.minStock);
        });

        setIsInitialized(true);
        console.log('✅ All SIGA services initialized successfully');

        // Show initialization notification
        await notificationService.show({
          title: '🚀 SIGA Inicializado',
          body: 'Sistema SGF-QR carregado com todos os recursos avançados',
          tag: 'siga-initialized'
        });

      } catch (error) {
        console.error('❌ Error initializing services:', error);
        setIsInitialized(true); // Continue anyway
      }
    };

    initializeServices();

    // Cleanup on unmount
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  // Mock data para demonstração
  const toolsStats = {
    total: 145,
    available: 98,
    inUse: 35,
    maintenance: 12
  };

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

  if (!isInitialized) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando SGF-QR Avançado...</p>
          <p className="text-sm text-gray-500 mt-1">Carregando cache, notificações e serviços em tempo real</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <ToolsHeader />

      <ToolsStats stats={toolsStats} />

      <Tabs defaultValue="blueprint-scanner" className="space-y-4">
        <TabsList className="grid w-full grid-cols-12">
          <TabsTrigger value="blueprint-scanner">SGF-QR v2.0</TabsTrigger>
          <TabsTrigger value="blueprint-panel">Painel Gestor</TabsTrigger>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="management">Gestão</TabsTrigger>
          <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
          <TabsTrigger value="smart-scanner">Smart Scanner</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard Tempo Real</TabsTrigger>
          <TabsTrigger value="notifications">Central Notificações</TabsTrigger>
          <TabsTrigger value="kitting">Kitting</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="qr-generator">Gerar QR</TabsTrigger>
          <TabsTrigger value="labels">Etiquetas</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="reservations">Reservas</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
          <TabsTrigger value="traceability">Rastreabilidade</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="blueprint-scanner" className="space-y-4">
          <BlueprintQRScanner />
        </TabsContent>

        <TabsContent value="blueprint-panel" className="space-y-4">
          <BlueprintLivePanel />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ToolsOverview />
            <RealTimeMovements />
          </div>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <ToolsManagement />
        </TabsContent>

        <TabsContent value="scanner" className="space-y-4">
          <QRScanner />
        </TabsContent>

        <TabsContent value="smart-scanner" className="space-y-4">
          <SmartQRScanner />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <RealTimeMovementsDashboard />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationCenter />
        </TabsContent>

        <TabsContent value="kitting" className="space-y-4">
          <KittingCheckout />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <WorkTemplateManager />
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

        <TabsContent value="alerts" className="space-y-4">
          <AlertsManagement />
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4">
          <ReservationsManagement />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <MaintenanceManagement />
        </TabsContent>

        <TabsContent value="traceability" className="space-y-4">
          <TraceabilityReports />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ToolsReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};


import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  QrCode, 
  Search, 
  Plus, 
  Wrench, 
  AlertTriangle, 
  Clock,
  User,
  Settings,
  Eye,
  Download
} from 'lucide-react';
import { ToolsOverview } from '@/components/tools/ToolsOverview';
import { ToolsManagement } from '@/components/tools/ToolsManagement';
import { QRScanner } from '@/components/tools/QRScanner';
import { ToolsReports } from '@/components/tools/ToolsReports';

export const ToolsQRModule = () => {
  const [searchTerm, setSearchTerm] = useState('');

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in-use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponível';
      case 'in-use': return 'Em Uso';
      case 'maintenance': return 'Manutenção';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SGF-QR - Gestão de Ferramentas</h1>
          <p className="text-gray-600 mt-1">Sistema de rastreabilidade por QR Code</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <QrCode className="h-4 w-4 mr-2" />
            Scanner Mobile
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Ferramenta
          </Button>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wrench className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Ferramentas</p>
                <p className="text-2xl font-bold">{toolsStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Disponíveis</p>
                <p className="text-2xl font-bold text-green-600">{toolsStats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Em Uso</p>
                <p className="text-2xl font-bold text-blue-600">{toolsStats.inUse}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Em Manutenção</p>
                <p className="text-2xl font-bold text-red-600">{toolsStats.maintenance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Abas Principais */}
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

      {/* Movimentações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Movimentações Recentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentMovements.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h4 className="font-medium">{movement.tool}</h4>
                      <p className="text-sm text-gray-600">
                        ID: {movement.toolId} • {movement.action} por {movement.user}
                      </p>
                      <p className="text-xs text-gray-500">{movement.timestamp}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(movement.status)}>
                    {getStatusText(movement.status)}
                  </Badge>
                  {movement.condition && (
                    <span className="text-xs text-gray-500">
                      Condição: {movement.condition}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

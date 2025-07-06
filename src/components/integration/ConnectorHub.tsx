
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, X, Bell, Search, Package } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface Connector {
  id: string;
  name: string;
  description: string;
  category: 'erp' | 'ecommerce' | 'iot' | 'analytics' | 'other';
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  lastSync: string;
  syncFrequency: string;
  dataPoints: number;
  icon: string;
  config?: Record<string, any>;
}

const mockConnectors: Connector[] = [
  {
    id: '1',
    name: 'SAP ERP',
    description: 'Integração completa com SAP para sincronização de dados de estoque e ordens',
    category: 'erp',
    status: 'connected',
    lastSync: '2024-01-20 15:30',
    syncFrequency: 'A cada 15 minutos',
    dataPoints: 12847,
    icon: '🏢'
  },
  {
    id: '2',
    name: 'Shopify',
    description: 'Sincronização de produtos e estoque com loja virtual',
    category: 'ecommerce',
    status: 'connected',
    lastSync: '2024-01-20 15:25',
    syncFrequency: 'A cada 5 minutos',
    dataPoints: 5243,
    icon: '🛒'
  },
  {
    id: '3',
    name: 'IoT Sensors',
    description: 'Coleta de dados de sensores IoT para monitoramento em tempo real',
    category: 'iot',
    status: 'error',
    lastSync: '2024-01-20 14:15',
    syncFrequency: 'Tempo real',
    dataPoints: 0,
    icon: '📡'
  },
  {
    id: '4',
    name: 'Power BI',
    description: 'Exportação de dados para dashboards executivos',
    category: 'analytics',
    status: 'disconnected',
    lastSync: 'Nunca',
    syncFrequency: 'Diário',
    dataPoints: 0,
    icon: '📊'
  }
];

export const ConnectorHub: React.FC = () => {
  const [connectors, setConnectors] = useState<Connector[]>(mockConnectors);
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useMobile();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'configuring': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <X className="h-4 w-4 text-red-600" />;
      case 'configuring': return <Bell className="h-4 w-4 text-yellow-600" />;
      default: return <Package className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryName = (category: string) => {
    const names = {
      erp: 'ERP',
      ecommerce: 'E-commerce',
      iot: 'IoT',
      analytics: 'Analytics',
      other: 'Outros'
    };
    return names[category as keyof typeof names] || 'Outros';
  };

  const filteredConnectors = connectors.filter(connector =>
    connector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    connector.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleConnection = (connectorId: string) => {
    setConnectors(prev => prev.map(conn => {
      if (conn.id === connectorId) {
        return {
          ...conn,
          status: conn.status === 'connected' ? 'disconnected' : 'connected'
        };
      }
      return conn;
    }));
  };

  const handleTestConnection = (connectorId: string) => {
    console.log(`Testando conexão para ${connectorId}`);
    // Implementar teste de conexão
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn(
            "font-bold",
            isMobile ? "text-xl" : "text-2xl"
          )}>Hub de Conectores</h2>
          <p className="text-muted-foreground text-sm">
            Gerencie integrações com sistemas externos
          </p>
        </div>
        <Button size={isMobile ? "sm" : "default"}>
          Adicionar Conector
        </Button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar conectores..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className={cn(
          "grid w-full",
          isMobile ? "grid-cols-3 h-8" : "grid-cols-6 h-10"
        )}>
          <TabsTrigger value="all" className={isMobile ? "text-xs" : "text-sm"}>
            Todos ({filteredConnectors.length})
          </TabsTrigger>
          <TabsTrigger value="connected" className={isMobile ? "text-xs" : "text-sm"}>
            Conectados ({filteredConnectors.filter(c => c.status === 'connected').length})
          </TabsTrigger>
          <TabsTrigger value="errors" className={isMobile ? "text-xs" : "text-sm"}>
            Erros ({filteredConnectors.filter(c => c.status === 'error').length})
          </TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger value="erp">ERP</TabsTrigger>
              <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
              <TabsTrigger value="iot">IoT</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
          )}>
            {filteredConnectors.map(connector => (
              <Card key={connector.id} className="hover:shadow-md transition-shadow">
                <CardHeader className={isMobile ? "pb-2" : "pb-4"}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{connector.icon}</span>
                      <div>
                        <CardTitle className={cn(
                          "mb-1",
                          isMobile ? "text-sm" : "text-lg"
                        )}>
                          {connector.name}
                        </CardTitle>
                        <Badge className={cn(
                          getCategoryName(connector.category),
                          "text-xs"
                        )}>
                          {getCategoryName(connector.category)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(connector.status)}
                      <Badge className={getStatusColor(connector.status)}>
                        {connector.status === 'connected' ? 'Conectado' :
                         connector.status === 'error' ? 'Erro' :
                         connector.status === 'configuring' ? 'Configurando' : 'Desconectado'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className={isMobile ? "pt-0" : ""}>
                  <div className="space-y-4">
                    <p className={cn(
                      "text-muted-foreground",
                      isMobile ? "text-xs" : "text-sm"
                    )}>
                      {connector.description}
                    </p>

                    {connector.status === 'connected' && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Última Sincronização</p>
                          <p className="text-muted-foreground text-xs">{connector.lastSync}</p>
                        </div>
                        <div>
                          <p className="font-medium">Frequência</p>
                          <p className="text-muted-foreground text-xs">{connector.syncFrequency}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="font-medium">Dados Sincronizados</p>
                          <p className="text-muted-foreground text-xs">
                            {connector.dataPoints.toLocaleString()} registros
                          </p>
                        </div>
                      </div>
                    )}

                    {connector.status === 'error' && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-red-800 text-sm font-medium">Erro de Conexão</p>
                        <p className="text-red-600 text-xs">
                          Falha na autenticação. Verifique as credenciais.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={connector.status === 'connected'}
                          onCheckedChange={() => handleToggleConnection(connector.id)}
                        />
                        <span className={cn(
                          "font-medium",
                          isMobile ? "text-xs" : "text-sm"
                        )}>
                          {connector.status === 'connected' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTestConnection(connector.id)}
                          className={isMobile ? "h-6 px-2 text-xs" : ""}
                        >
                          Testar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedConnector(connector)}
                          className={isMobile ? "h-6 px-2 text-xs" : ""}
                        >
                          Configurar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="connected">
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
          )}>
            {filteredConnectors
              .filter(connector => connector.status === 'connected')
              .map(connector => (
                // ... mesmo conteúdo do card acima
                <div key={connector.id}>Card do conector conectado</div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="errors">
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
          )}>
            {filteredConnectors
              .filter(connector => connector.status === 'error')
              .map(connector => (
                // ... mesmo conteúdo do card acima
                <div key={connector.id}>Card do conector com erro</div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className={isMobile ? "text-base" : "text-lg"}>
            Status Geral das Integrações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-2" : "grid-cols-4"
          )}>
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <p className="font-medium">Taxa de Sucesso</p>
              <p className="text-2xl font-bold text-green-600">98.5%</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🔄</div>
              <p className="font-medium">Sincronizações/Dia</p>
              <p className="text-2xl font-bold text-blue-600">2,847</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="font-medium">Dados Processados</p>
              <p className="text-2xl font-bold text-purple-600">1.2M</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⏱️</div>
              <p className="font-medium">Latência Média</p>
              <p className="text-2xl font-bold text-orange-600">125ms</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

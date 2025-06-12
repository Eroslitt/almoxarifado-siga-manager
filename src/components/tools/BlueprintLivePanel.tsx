
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { blueprintToolsService } from '@/services/blueprintToolsService';
import { blueprintWebSocketService } from '@/services/blueprintWebSocketService';
import { BlueprintLiveStatus } from '@/types/sgf-blueprint';
import { usePossessionTimer } from '@/hooks/usePossessionTimer';
import { 
  RefreshCw, 
  Activity, 
  Clock,
  User,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff
} from 'lucide-react';

export const BlueprintLivePanel = () => {
  const [statusData, setStatusData] = useState<BlueprintLiveStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({ connected: false, mode: 'demo' });
  const [highlightedRows, setHighlightedRows] = useState<Set<string>>(new Set());

  const loadStatusData = async () => {
    try {
      const data = await blueprintToolsService.obterStatusAoVivo();
      setStatusData(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar status ao vivo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatusData();
    
    blueprintWebSocketService.connect();
    
    const unsubscribeStatus = blueprintWebSocketService.subscribe('tool_status_change', (data) => {
      console.log('📡 Mudança de status recebida:', data);
      
      if (data.operacao === 'DEVOLUÇÃO') {
        setHighlightedRows(prev => new Set(prev).add(data.ferramenta_id));
        
        setTimeout(() => {
          setHighlightedRows(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.ferramenta_id);
            return newSet;
          });
        }, 3000);
      }
      
      loadStatusData();
    });

    const unsubscribeConnection = blueprintWebSocketService.subscribe('connection_status', (status) => {
      setConnectionStatus(status);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeConnection();
      blueprintWebSocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadStatusData();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusBadge = (status: BlueprintLiveStatus['status']) => {
    const configs = {
      'DISPONÍVEL': { 
        className: 'bg-green-100 text-green-800 border-green-300', 
        icon: CheckCircle 
      },
      'EM USO': { 
        className: 'bg-blue-100 text-blue-800 border-blue-300', 
        icon: User 
      },
      'EM MANUTENÇÃO': { 
        className: 'bg-red-100 text-red-800 border-red-300', 
        icon: AlertTriangle 
      }
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.className} border`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const stats = {
    total: statusData.length,
    disponiveis: statusData.filter(s => s.status === 'DISPONÍVEL').length,
    emUso: statusData.filter(s => s.status === 'EM USO').length,
    manutencao: statusData.filter(s => s.status === 'EM MANUTENÇÃO').length
  };

  const headers = ['Ferramenta', 'Status', 'Responsável Atual', 'Retirada em', 'Tempo de Posse'];

  const renderDesktopRow = (item: BlueprintLiveStatus, index: number) => {
    const isHighlighted = highlightedRows.has(item.ferramenta);
    
    return (
      <>
        <td className="p-3">
          <div className="flex items-center space-x-2">
            <Wrench className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{item.ferramenta}</span>
          </div>
        </td>
        <td className="p-3">
          {getStatusBadge(item.status)}
        </td>
        <td className="p-3">
          {item.responsavel_atual ? (
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-blue-500" />
              <span>{item.responsavel_atual}</span>
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>
        <td className="p-3">
          {item.retirada_em ? (
            <span className="text-sm">{item.retirada_em}</span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>
        <td className="p-3">
          <PossessionTimer item={item} />
        </td>
      </>
    );
  };

  const renderMobileCard = (item: BlueprintLiveStatus, index: number) => {
    const isHighlighted = highlightedRows.has(item.ferramenta);
    
    return (
      <div className={`space-y-3 ${isHighlighted ? 'bg-green-50 p-2 rounded animate-pulse' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Wrench className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="font-medium truncate">{item.ferramenta}</span>
          </div>
          {getStatusBadge(item.status)}
        </div>
        
        {item.responsavel_atual && (
          <div className="flex items-center space-x-2 text-sm">
            <User className="h-4 w-4 text-blue-500" />
            <span className="text-gray-600">Responsável:</span>
            <span className="font-medium">{item.responsavel_atual}</span>
          </div>
        )}
        
        {item.retirada_em && (
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Retirada:</span>
            <span>{item.retirada_em}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Tempo de Posse:</span>
          <PossessionTimer item={item} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header do Painel - Responsivo */}
      <Card className="border-blue-500 bg-blue-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex flex-col lg:flex-row lg:items-center lg:justify-between text-blue-800 space-y-3 lg:space-y-0">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 lg:h-6 lg:w-6" />
              <span className="text-lg lg:text-xl">SGF-QR v2.0 - Painel do Gestor</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                {connectionStatus.connected ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm text-blue-700">
                  {connectionStatus.connected ? 'Conectado' : 'Desconectado'} 
                  ({connectionStatus.mode})
                </span>
              </div>
              <div className="text-sm text-blue-700">
                Última atualização: {lastUpdate.toLocaleTimeString()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'bg-green-100 text-green-800' : 'bg-gray-100'}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Auto Refresh</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Estatísticas Rápidas - Grid Responsivo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-xl lg:text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs lg:text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-xl lg:text-2xl font-bold text-green-600">{stats.disponiveis}</div>
            <div className="text-xs lg:text-sm text-gray-600">Disponíveis</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-xl lg:text-2xl font-bold text-blue-600">{stats.emUso}</div>
            <div className="text-xs lg:text-sm text-gray-600">Em Uso</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-xl lg:text-2xl font-bold text-red-600">{stats.manutencao}</div>
            <div className="text-xs lg:text-sm text-gray-600">Manutenção</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Responsiva */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Status Ao Vivo (atualiza automaticamente)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              <span>Carregando dados em tempo real...</span>
            </div>
          ) : (
            <ResponsiveTable
              headers={headers}
              data={statusData}
              renderRow={renderDesktopRow}
              renderMobileCard={renderMobileCard}
              emptyMessage="Nenhuma ferramenta cadastrada no sistema"
            />
          )}
        </CardContent>
      </Card>

      {/* Informações do Sistema - Compacta em Mobile */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Sistema:</strong> SGF-QR v2.0 - Controle de Ativos em Tempo Real</p>
            <p><strong>Atualizações:</strong> Automáticas a cada 5 segundos via WebSocket</p>
            <p className="hidden lg:block"><strong>Recursos:</strong> Transações atômicas, controle de segurança, rastreabilidade completa</p>
            <p className="hidden lg:block"><strong>Efeitos Visuais:</strong> Linhas piscam em verde na devolução, tempo de posse em tempo real</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente Timer separado para reutilização
const PossessionTimer = ({ item }: { item: BlueprintLiveStatus }) => {
  const tempoPosse = usePossessionTimer({
    startTime: item.retirada_em,
    isActive: item.status === 'EM USO'
  });

  return tempoPosse ? (
    <Badge variant="outline" className="text-blue-700">
      <Clock className="h-3 w-3 mr-1" />
      {tempoPosse}
    </Badge>
  ) : (
    <span className="text-gray-400">-</span>
  );
};

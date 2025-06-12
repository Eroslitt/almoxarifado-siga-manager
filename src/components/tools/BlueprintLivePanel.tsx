
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { blueprintToolsService } from '@/services/blueprintToolsService';
import { BlueprintLiveStatus } from '@/types/sgf-blueprint';
import { 
  RefreshCw, 
  Activity, 
  Clock,
  User,
  Wrench,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

// SGF-QR v2.0 - Painel do Gestor: Controle em Tempo Real
export const BlueprintLivePanel = () => {
  const [statusData, setStatusData] = useState<BlueprintLiveStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

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
  }, []);

  // Auto refresh a cada 5 segundos
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
        className: 'bg-green-100 text-green-800', 
        icon: CheckCircle 
      },
      'EM USO': { 
        className: 'bg-blue-100 text-blue-800', 
        icon: User 
      },
      'EM MANUTENÇÃO': { 
        className: 'bg-red-100 text-red-800', 
        icon: AlertTriangle 
      }
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getRowClassName = (status: BlueprintLiveStatus['status']) => {
    // Efeito visual conforme blueprint - linha pisca em verde na devolução
    return status === 'DISPONÍVEL' ? 
      'bg-white hover:bg-green-50 transition-colors duration-200' :
      'bg-white hover:bg-gray-50';
  };

  const stats = {
    total: statusData.length,
    disponiveis: statusData.filter(s => s.status === 'DISPONÍVEL').length,
    emUso: statusData.filter(s => s.status === 'EM USO').length,
    manutencao: statusData.filter(s => s.status === 'EM MANUTENÇÃO').length
  };

  return (
    <div className="space-y-6">
      {/* Header do Painel */}
      <Card className="border-blue-500 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-blue-800">
            <div className="flex items-center space-x-2">
              <Activity className="h-6 w-6" />
              <span>SGF-QR v2.0 - Painel do Gestor: Controle em Tempo Real</span>
            </div>
            <div className="flex items-center space-x-4">
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
                Auto Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total de Ferramentas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.disponiveis}</div>
            <div className="text-sm text-gray-600">Disponíveis</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.emUso}</div>
            <div className="text-sm text-gray-600">Em Uso</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.manutencao}</div>
            <div className="text-sm text-gray-600">Em Manutenção</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela "Status Ao Vivo" - Conforme Blueprint */}
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-semibold">Ferramenta</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Responsável Atual</th>
                    <th className="text-left p-3 font-semibold">Retirada em</th>
                    <th className="text-left p-3 font-semibold">Tempo de Posse</th>
                  </tr>
                </thead>
                <tbody>
                  {statusData.map((item, index) => (
                    <tr 
                      key={index} 
                      className={`border-b ${getRowClassName(item.status)}`}
                    >
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
                        {item.tempo_posse ? (
                          <Badge variant="outline" className="text-blue-700">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.tempo_posse}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {statusData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma ferramenta cadastrada no sistema
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Sistema:</strong> SGF-QR v2.0 - Plataforma de Controle de Ativos em Tempo Real</p>
            <p><strong>Atualizações:</strong> Automáticas a cada 5 segundos via WebSocket</p>
            <p><strong>Recursos:</strong> Transações atômicas, controle de segurança, rastreabilidade completa</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

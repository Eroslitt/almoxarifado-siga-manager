
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Package,
  Scan,
  Plus
} from 'lucide-react';

export const ReceivingModule = () => {
  const [activeTab, setActiveTab] = useState('scheduled');

  const scheduledDeliveries = [
    {
      id: 'REC001',
      supplier: 'Fornecedor ABC Ltda',
      expectedTime: '09:00',
      status: 'scheduled',
      items: 15,
      orderNumber: 'PO-2024-001',
      driver: 'João Silva',
      vehicle: 'Caminhão - ABC-1234'
    },
    {
      id: 'REC002',
      supplier: 'Eletrônicos XYZ',
      expectedTime: '14:30',
      status: 'delayed',
      items: 8,
      orderNumber: 'PO-2024-002',
      driver: 'Maria Santos',
      vehicle: 'Van - XYZ-5678'
    }
  ];

  const receivingQueue = [
    {
      id: 'REC003',
      supplier: 'Ferramentas Pro',
      arrivedAt: '08:45',
      status: 'receiving',
      items: 12,
      operator: 'Carlos Oliveira',
      progress: 75
    },
    {
      id: 'REC004',
      supplier: 'Suprimentos Fast',
      arrivedAt: '10:15',
      status: 'waiting',
      items: 6,
      operator: null,
      progress: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      case 'receiving': return 'bg-yellow-100 text-yellow-800';
      case 'waiting': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'delayed': return 'Atrasado';
      case 'receiving': return 'Recebendo';
      case 'waiting': return 'Aguardando';
      case 'completed': return 'Concluído';
      default: return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recebimento</h1>
          <p className="text-gray-600 mt-1">Controle de entregas e conferência de materiais</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Métricas do Dia */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Agendados Hoje</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Recebidos</p>
                <p className="text-2xl font-bold text-green-600">5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Em Processo</p>
                <p className="text-2xl font-bold text-yellow-600">2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Atrasados</p>
                <p className="text-2xl font-bold text-red-600">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'scheduled'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Agendamentos
        </button>
        <button
          onClick={() => setActiveTab('receiving')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'receiving'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Fila de Recebimento
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'scheduled' && (
        <Card>
          <CardHeader>
            <CardTitle>Entregas Agendadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledDeliveries.map((delivery) => (
                <div key={delivery.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{delivery.supplier}</h3>
                        <Badge className={getStatusColor(delivery.status)}>
                          {getStatusText(delivery.status)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Horário:</span>
                          <p>{delivery.expectedTime}</p>
                        </div>
                        <div>
                          <span className="font-medium">Pedido:</span>
                          <p className="font-mono">{delivery.orderNumber}</p>
                        </div>
                        <div>
                          <span className="font-medium">Itens:</span>
                          <p>{delivery.items} itens</p>
                        </div>
                        <div>
                          <span className="font-medium">Motorista:</span>
                          <p>{delivery.driver}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Scan className="h-4 w-4 mr-2" />
                        Iniciar Recebimento
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'receiving' && (
        <Card>
          <CardHeader>
            <CardTitle>Fila de Recebimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {receivingQueue.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{item.supplier}</h3>
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusText(item.status)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Chegada:</span>
                          <p>{item.arrivedAt}</p>
                        </div>
                        <div>
                          <span className="font-medium">Itens:</span>
                          <p>{item.items} itens</p>
                        </div>
                        <div>
                          <span className="font-medium">Operador:</span>
                          <p>{item.operator || 'Não atribuído'}</p>
                        </div>
                        <div>
                          <span className="font-medium">Progresso:</span>
                          <p>{item.progress}%</p>
                        </div>
                      </div>
                      {item.status === 'receiving' && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {item.status === 'waiting' && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Package className="h-4 w-4 mr-2" />
                          Iniciar
                        </Button>
                      )}
                      {item.status === 'receiving' && (
                        <Button variant="outline" size="sm">
                          Ver Progresso
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  User, 
  Clock, 
  CheckCircle,
  MapPin,
  Route,
  Truck
} from 'lucide-react';

export const ShippingModule = () => {
  const [activeTab, setActiveTab] = useState('picking');

  const pickingOrders = [
    {
      id: 'PED001',
      customer: 'Departamento de Manutenção',
      priority: 'high',
      items: 8,
      operator: 'Ana Costa',
      progress: 75,
      estimatedTime: '15 min',
      route: 'A1→B3→C2→D1'
    },
    {
      id: 'PED002',
      customer: 'Setor Elétrico',
      priority: 'normal',
      items: 12,
      operator: 'Pedro Lima',
      progress: 30,
      estimatedTime: '25 min',
      route: 'A5→A8→B1→B6'
    },
    {
      id: 'PED003',
      customer: 'Almoxarifado Central',
      priority: 'low',
      items: 5,
      operator: null,
      progress: 0,
      estimatedTime: '12 min',
      route: 'C1→C4→D2'
    }
  ];

  const readyToShip = [
    {
      id: 'EXP001',
      customer: 'Setor de Produção',
      completedAt: '10:30',
      items: 6,
      weight: '2.5 kg',
      volume: '0.8 m³',
      status: 'packed'
    },
    {
      id: 'EXP002',
      customer: 'Departamento TI',
      completedAt: '11:15',
      items: 3,
      weight: '1.2 kg',
      volume: '0.3 m³',
      status: 'shipped'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'normal': return 'Normal';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'packed': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expedição</h1>
          <p className="text-gray-600 mt-1">Separação e expedição de pedidos</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Route className="h-4 w-4 mr-2" />
          Otimizar Rotas
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Em Separação</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Prontos</p>
                <p className="text-2xl font-bold text-green-600">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Operadores Ativos</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold">4.2 min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('picking')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'picking'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Separação
        </button>
        <button
          onClick={() => setActiveTab('ready')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'ready'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Prontos para Expedição
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'picking' && (
        <Card>
          <CardHeader>
            <CardTitle>Pedidos em Separação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pickingOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">{order.customer}</h3>
                      <Badge variant="outline">{order.id}</Badge>
                      <Badge className={getPriorityColor(order.priority)}>
                        {getPriorityText(order.priority)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Tempo estimado: {order.estimatedTime}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Itens:</span>
                      <p>{order.items} itens</p>
                    </div>
                    <div>
                      <span className="font-medium">Operador:</span>
                      <p>{order.operator || 'Não atribuído'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Progresso:</span>
                      <p>{order.progress}%</p>
                    </div>
                    <div>
                      <span className="font-medium">Rota:</span>
                      <p className="font-mono">{order.route}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <Progress value={order.progress} className="h-2" />
                  </div>

                  <div className="flex space-x-2">
                    {!order.operator && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <User className="h-4 w-4 mr-2" />
                        Atribuir Operador
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'ready' && (
        <Card>
          <CardHeader>
            <CardTitle>Prontos para Expedição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {readyToShip.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{item.customer}</h3>
                        <Badge variant="outline">{item.id}</Badge>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status === 'packed' ? 'Embalado' : 'Expedido'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Finalizado:</span>
                          <p>{item.completedAt}</p>
                        </div>
                        <div>
                          <span className="font-medium">Itens:</span>
                          <p>{item.items} itens</p>
                        </div>
                        <div>
                          <span className="font-medium">Peso:</span>
                          <p>{item.weight}</p>
                        </div>
                        <div>
                          <span className="font-medium">Volume:</span>
                          <p>{item.volume}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {item.status === 'packed' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Truck className="h-4 w-4 mr-2" />
                          Expedir
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Ver Romaneio
                      </Button>
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

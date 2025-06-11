
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  LogIn, 
  LogOut, 
  Package, 
  Wrench, 
  User, 
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

interface Movement {
  id: string;
  type: 'checkout' | 'checkin';
  item: {
    id: string;
    name: string;
    code: string;
    itemType: 'TOOL' | 'SKU';
    category: string;
  };
  user: {
    id: string;
    name: string;
    department: string;
  };
  timestamp: string;
  quantity?: number;
  condition?: string;
  location?: string;
  status: 'success' | 'warning' | 'error';
}

export const RealTimeMovements = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock real-time movements data
  useEffect(() => {
    const mockMovements: Movement[] = [
      {
        id: '1',
        type: 'checkout',
        item: {
          id: 'FER-08172',
          name: 'Furadeira de Impacto Makita',
          code: 'FER-08172',
          itemType: 'TOOL',
          category: 'Elétrica'
        },
        user: {
          id: 'user1',
          name: 'João Silva',
          department: 'Manutenção'
        },
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
        location: 'A-01-05',
        status: 'success'
      },
      {
        id: '2',
        type: 'checkin',
        item: {
          id: 'PAR-M6-20',
          name: 'Parafuso Sextavado M6 x 20mm',
          code: 'PAR-M6-20',
          itemType: 'SKU',
          category: 'Fixação'
        },
        user: {
          id: 'user2',
          name: 'Maria Santos',
          department: 'Produção'
        },
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
        quantity: 50,
        location: 'B-02-12',
        status: 'success'
      },
      {
        id: '3',
        type: 'checkin',
        item: {
          id: 'FER-03945',
          name: 'Chave de Fenda Philips',
          code: 'FER-03945',
          itemType: 'TOOL',
          category: 'Manual'
        },
        user: {
          id: 'user3',
          name: 'Carlos Oliveira',
          department: 'Elétrica'
        },
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 min ago
        condition: 'Cabo com mau contato detectado',
        location: 'A-03-08',
        status: 'warning'
      }
    ];

    setMovements(mockMovements);
  }, []);

  const refreshMovements = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const getMovementIcon = (type: string) => {
    return type === 'checkout' ? LogOut : LogIn;
  };

  const getItemIcon = (itemType: string) => {
    return itemType === 'TOOL' ? Wrench : Package;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMovementColor = (type: string) => {
    return type === 'checkout' ? 'text-blue-600' : 'text-green-600';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return time.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Movimentações em Tempo Real</span>
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshMovements}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {movements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma movimentação recente</p>
              </div>
            ) : (
              movements.map((movement) => {
                const MovementIcon = getMovementIcon(movement.type);
                const ItemIcon = getItemIcon(movement.item.itemType);
                
                return (
                  <div 
                    key={movement.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${movement.type === 'checkout' ? 'bg-blue-100' : 'bg-green-100'}`}>
                        <MovementIcon className={`h-4 w-4 ${getMovementColor(movement.type)}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900 truncate">
                            {movement.type === 'checkout' ? 'RETIRADA' : 'DEVOLUÇÃO'}
                          </h4>
                          <Badge className={getStatusColor(movement.status)}>
                            {movement.status === 'success' ? 'Sucesso' : 
                             movement.status === 'warning' ? 'Atenção' : 'Erro'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <ItemIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">{movement.item.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {movement.item.itemType === 'TOOL' ? 'Ferramenta' : 'Produto'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{movement.user.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatTimeAgo(movement.timestamp)}</span>
                          </div>
                          {movement.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{movement.location}</span>
                            </div>
                          )}
                          {movement.quantity && (
                            <div className="flex items-center space-x-1">
                              <Package className="h-3 w-3" />
                              <span>{movement.quantity} unidades</span>
                            </div>
                          )}
                        </div>
                        
                        {movement.condition && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                            <div className="flex items-center space-x-1 text-yellow-800">
                              <AlertTriangle className="h-3 w-3" />
                              <span className="font-medium">Observação:</span>
                            </div>
                            <p className="text-yellow-700 mt-1">{movement.condition}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};


import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
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
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Bell,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RealTimeMovement {
  id: string;
  type: 'checkout' | 'checkin';
  item: {
    id: string;
    name: string;
    code: string;
    itemType: 'TOOL' | 'SKU';
    category: string;
    specifications?: {
      weight?: number;
      brand?: string;
    };
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
  stock_impact?: {
    previous: number;
    current: number;
    alert_level?: 'low' | 'critical';
  };
}

interface MovementStats {
  total_today: number;
  checkouts_today: number;
  checkins_today: number;
  items_in_use: number;
  low_stock_alerts: number;
  maintenance_alerts: number;
}

export const RealTimeMovementsDashboard = () => {
  const [movements, setMovements] = useState<RealTimeMovement[]>([]);
  const [stats, setStats] = useState<MovementStats>({
    total_today: 0,
    checkouts_today: 0,
    checkins_today: 0,
    items_in_use: 0,
    low_stock_alerts: 0,
    maintenance_alerts: 0
  });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock real-time movements data with enhanced details
  useEffect(() => {
    loadMovements();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadMovements();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadMovements = () => {
    // Simulate real-time data
    const mockMovements: RealTimeMovement[] = [
      {
        id: '1',
        type: 'checkout',
        item: {
          id: 'FER-08172',
          name: 'Furadeira de Impacto Makita DHP453',
          code: 'FER-08172',
          itemType: 'TOOL',
          category: 'Elétrica',
          specifications: {
            weight: 1.8,
            brand: 'Makita'
          }
        },
        user: {
          id: 'user1',
          name: 'João Silva',
          department: 'Manutenção'
        },
        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        location: 'A-01-05',
        status: 'success'
      },
      {
        id: '2',
        type: 'checkin',
        item: {
          id: 'PAR-M6-20',
          name: 'Parafuso Sextavado M6 x 20mm Aço Inox',
          code: 'PAR-M6-20',
          itemType: 'SKU',
          category: 'Fixação',
          specifications: {
            weight: 0.015
          }
        },
        user: {
          id: 'user2',
          name: 'Maria Santos',
          department: 'Produção'
        },
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        quantity: 25,
        location: 'B-02-12',
        status: 'success',
        stock_impact: {
          previous: 2425,
          current: 2450,
          alert_level: undefined
        }
      },
      {
        id: '3',
        type: 'checkin',
        item: {
          id: 'FER-03945',
          name: 'Chave de Fenda Philips 6mm Stanley',
          code: 'FER-03945',
          itemType: 'TOOL',
          category: 'Manual',
          specifications: {
            brand: 'Stanley'
          }
        },
        user: {
          id: 'user3',
          name: 'Carlos Oliveira',
          department: 'Elétrica'
        },
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        condition: 'Cabo com desgaste detectado - necessário manutenção',
        location: 'A-03-08',
        status: 'warning'
      },
      {
        id: '4',
        type: 'checkout',
        item: {
          id: 'CAP-220UF',
          name: 'Capacitor Eletrolítico 220µF 25V',
          code: 'CAP-220UF',
          itemType: 'SKU',
          category: 'Eletrônicos'
        },
        user: {
          id: 'user4',
          name: 'Ana Costa',
          department: 'Eletrônica'
        },
        timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
        quantity: 5,
        location: 'C-01-03',
        status: 'success',
        stock_impact: {
          previous: 90,
          current: 85,
          alert_level: 'low'
        }
      }
    ];

    // Update stats
    const newStats: MovementStats = {
      total_today: 47,
      checkouts_today: 23,
      checkins_today: 24,
      items_in_use: 142,
      low_stock_alerts: 3,
      maintenance_alerts: 5
    };

    setMovements(mockMovements);
    setStats(newStats);
  };

  const refreshMovements = () => {
    setLoading(true);
    setTimeout(() => {
      loadMovements();
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

  const filteredMovements = movements.filter(movement => {
    const matchesFilter = filter === 'all' || movement.type === filter;
    const matchesSearch = movement.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard de Movimentações em Tempo Real</h2>
          <p className="text-gray-600">Monitoramento ao vivo de todas as operações</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Ao Vivo
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Manual
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshMovements}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total_today}</div>
              <div className="text-sm text-gray-600">Total Hoje</div>
              <div className="flex items-center justify-center mt-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.checkouts_today}</div>
              <div className="text-sm text-gray-600">Retiradas</div>
              <div className="flex items-center justify-center mt-1 text-xs text-blue-600">
                <LogOut className="h-3 w-3 mr-1" />
                Hoje
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.checkins_today}</div>
              <div className="text-sm text-gray-600">Devoluções</div>
              <div className="flex items-center justify-center mt-1 text-xs text-green-600">
                <LogIn className="h-3 w-3 mr-1" />
                Hoje
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.items_in_use}</div>
              <div className="text-sm text-gray-600">Em Uso</div>
              <div className="flex items-center justify-center mt-1 text-xs text-orange-600">
                <Activity className="h-3 w-3 mr-1" />
                Agora
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.low_stock_alerts}</div>
              <div className="text-sm text-gray-600">Estoque Baixo</div>
              <div className="flex items-center justify-center mt-1 text-xs text-yellow-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Alertas
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.maintenance_alerts}</div>
              <div className="text-sm text-gray-600">Manutenção</div>
              <div className="flex items-center justify-center mt-1 text-xs text-red-600">
                <Bell className="h-3 w-3 mr-1" />
                Pendente
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por item, código ou usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de Movimentação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="checkout">Retiradas</SelectItem>
                <SelectItem value="checkin">Devoluções</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avançados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Movements List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Movimentações em Tempo Real ({filteredMovements.length})</span>
            </CardTitle>
            {autoRefresh && (
              <Badge className="bg-green-100 text-green-800">
                <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse mr-2"></div>
                Ao Vivo
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredMovements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma movimentação encontrada</p>
                </div>
              ) : (
                filteredMovements.map((movement) => {
                  const MovementIcon = getMovementIcon(movement.type);
                  const ItemIcon = getItemIcon(movement.item.itemType);
                  
                  return (
                    <div 
                      key={movement.id} 
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-full ${movement.type === 'checkout' ? 'bg-blue-100' : 'bg-green-100'}`}>
                          <MovementIcon className={`h-5 w-5 ${getMovementColor(movement.type)}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-bold text-lg text-gray-900">
                              {movement.type === 'checkout' ? 'RETIRADA' : 'DEVOLUÇÃO'}
                            </h4>
                            <Badge className={getStatusColor(movement.status)}>
                              {movement.status === 'success' ? 'Sucesso' : 
                               movement.status === 'warning' ? 'Atenção' : 'Erro'}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatTimeAgo(movement.timestamp)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Item Details */}
                            <div className="bg-white p-3 rounded border">
                              <div className="flex items-center space-x-2 mb-2">
                                <ItemIcon className="h-4 w-4 text-gray-500" />
                                <span className="font-medium text-gray-900">
                                  {movement.item.name}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {movement.item.itemType === 'TOOL' ? 'Ferramenta' : 'Produto'}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                <div>
                                  <span className="font-medium">Código:</span> {movement.item.code}
                                </div>
                                <div>
                                  <span className="font-medium">Categoria:</span> {movement.item.category}
                                </div>
                                {movement.item.specifications?.brand && (
                                  <div>
                                    <span className="font-medium">Marca:</span> {movement.item.specifications.brand}
                                  </div>
                                )}
                                {movement.item.specifications?.weight && (
                                  <div>
                                    <span className="font-medium">Peso:</span> {movement.item.specifications.weight}kg
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Operation Details */}
                            <div className="bg-white p-3 rounded border">
                              <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <User className="h-3 w-3" />
                                  <span className="font-medium">{movement.user.name}</span>
                                  <span>({movement.user.department})</span>
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
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(movement.timestamp).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Stock Impact */}
                          {movement.stock_impact && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-blue-800">
                                  Impacto no Estoque
                                </span>
                                {movement.stock_impact.alert_level && (
                                  <Badge className={
                                    movement.stock_impact.alert_level === 'critical' ? 
                                    'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                  }>
                                    {movement.stock_impact.alert_level === 'critical' ? 'Crítico' : 'Baixo'}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="text-gray-600">
                                  {movement.stock_impact.previous} → {movement.stock_impact.current}
                                </span>
                                <div className="flex-1">
                                  <Progress 
                                    value={(movement.stock_impact.current / (movement.stock_impact.previous + 100)) * 100} 
                                    className="h-2"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Condition Note */}
                          {movement.condition && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                              <div className="flex items-center space-x-2 text-yellow-800">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-medium">Observação:</span>
                              </div>
                              <p className="text-yellow-700 mt-1 text-sm">{movement.condition}</p>
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
    </div>
  );
};

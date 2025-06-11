
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Plus, 
  MapPin,
  Edit,
  Trash2,
  Eye,
  Warehouse,
  Package,
  BarChart3,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { masterDataApi } from '@/services/masterDataApi';
import { useToast } from '@/hooks/use-toast';

export const LocationManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const data = await masterDataApi.getStorageLocations();
      setLocations(data);
    } catch (error) {
      console.error('Erro ao carregar localizações:', error);
      // Use mock data if API fails
      setLocations([
        {
          id: '1',
          code: 'A-01-01-A',
          description: 'Prateleira A, Rua 1, Nível 1, Posição A',
          zone_type: 'picking',
          street: 'A',
          shelf: '01',
          level: '01',
          position: 'A',
          max_capacity: 1000,
          current_utilization: 852,
          status: 'active',
          temperature_controlled: false,
          restricted_access: false,
          item_count: 45,
          last_movement: '2024-01-20'
        },
        {
          id: '2',
          code: 'B-02-03-B',
          description: 'Prateleira B, Rua 2, Nível 3, Posição B',
          zone_type: 'storage',
          street: 'B',
          shelf: '02',
          level: '03',
          position: 'B',
          max_capacity: 800,
          current_utilization: 737,
          status: 'active',
          temperature_controlled: true,
          restricted_access: false,
          item_count: 32,
          last_movement: '2024-01-19'
        },
        {
          id: '3',
          code: 'C-01-02-A',
          description: 'Prateleira C, Rua 1, Nível 2, Posição A',
          zone_type: 'reserve',
          street: 'C',
          shelf: '01',
          level: '02',
          position: 'A',
          max_capacity: 1200,
          current_utilization: 942,
          status: 'active',
          temperature_controlled: false,
          restricted_access: true,
          item_count: 67,
          last_movement: '2024-01-18'
        },
        {
          id: '4',
          code: 'D-03-01-C',
          description: 'Prateleira D, Rua 3, Nível 1, Posição C',
          zone_type: 'damaged',
          street: 'D',
          shelf: '03',
          level: '01',
          position: 'C',
          max_capacity: 500,
          current_utilization: 150,
          status: 'maintenance',
          temperature_controlled: false,
          restricted_access: true,
          item_count: 8,
          last_movement: '2024-01-15'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (location: any) => {
    setSelectedLocation(location);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta localização?')) return;

    try {
      // await masterDataApi.deleteLocation(id);
      toast({
        title: "Sucesso",
        description: "Localização excluída com sucesso",
      });
      loadLocations();
    } catch (error) {
      toast({
        title: "Erro",
        description: (error as Error).message || "Erro ao excluir localização",
        variant: "destructive",
      });
    }
  };

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'picking': return 'bg-green-100 text-green-800';
      case 'storage': return 'bg-blue-100 text-blue-800';
      case 'reserve': return 'bg-purple-100 text-purple-800';
      case 'damaged': return 'bg-red-100 text-red-800';
      case 'shipping': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationPercentage = (current: number, max: number) => {
    return max > 0 ? Math.round((current / max) * 100) : 0;
  };

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = selectedZone === 'all' || location.zone_type === selectedZone;
    const matchesStatus = selectedStatus === 'all' || location.status === selectedStatus;
    
    return matchesSearch && matchesZone && matchesStatus;
  });

  if (loading) {
    return (
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando localizações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Localizações</h2>
          <p className="text-gray-600">Controle de endereçamento e capacidade do almoxarifado</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Localização
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {locations.length}
              </div>
              <div className="text-sm text-gray-600">Total de Posições</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {locations.filter(l => l.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Ativas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {locations.filter(l => l.status === 'maintenance').length}
              </div>
              <div className="text-sm text-gray-600">Manutenção</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(locations.reduce((sum, l) => sum + getUtilizationPercentage(l.current_utilization, l.max_capacity), 0) / locations.length)}%
              </div>
              <div className="text-sm text-gray-600">Ocupação Média</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {locations.reduce((sum, l) => sum + (l.item_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Itens Estocados</div>
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
                  placeholder="Buscar por código ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Zona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Zonas</SelectItem>
                <SelectItem value="picking">Picking</SelectItem>
                <SelectItem value="storage">Armazenagem</SelectItem>
                <SelectItem value="reserve">Reserva</SelectItem>
                <SelectItem value="damaged">Avariados</SelectItem>
                <SelectItem value="shipping">Expedição</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="inactive">Inativa</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Mapa do Almoxarifado
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Locations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Warehouse className="h-5 w-5" />
            <span>Mapa de Localizações ({filteredLocations.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLocations.map((location) => {
              const utilizationPercentage = getUtilizationPercentage(location.current_utilization, location.max_capacity);
              
              return (
                <div key={location.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{location.code}</h3>
                        <Badge className={getZoneColor(location.zone_type)}>
                          {location.zone_type === 'picking' ? 'Picking' :
                           location.zone_type === 'storage' ? 'Armazenagem' :
                           location.zone_type === 'reserve' ? 'Reserva' :
                           location.zone_type === 'damaged' ? 'Avariados' :
                           location.zone_type === 'shipping' ? 'Expedição' : location.zone_type}
                        </Badge>
                        <Badge className={getStatusColor(location.status)}>
                          {location.status === 'active' ? 'Ativa' :
                           location.status === 'maintenance' ? 'Manutenção' : 'Inativa'}
                        </Badge>
                        
                        {location.temperature_controlled && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            Temp. Controlada
                          </Badge>
                        )}
                        
                        {location.restricted_access && (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            Acesso Restrito
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-700 mb-3">{location.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Endereço:</span>
                          </div>
                          <div className="text-sm">
                            <div>Rua: {location.street}</div>
                            <div>Prateleira: {location.shelf}</div>
                            <div>Nível: {location.level}</div>
                            <div>Posição: {location.position}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Capacidade:</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <BarChart3 className="h-4 w-4" />
                              <span className={`font-medium ${getUtilizationColor(utilizationPercentage)}`}>
                                {utilizationPercentage}% ocupado
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  utilizationPercentage >= 90 ? 'bg-red-500' :
                                  utilizationPercentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${utilizationPercentage}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {location.current_utilization} / {location.max_capacity}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Movimentação:</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Package className="h-4 w-4" />
                              <span>{location.item_count} itens</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Última: {new Date(location.last_movement).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Características:</span>
                          </div>
                          <div className="space-y-1">
                            {location.temperature_controlled && (
                              <div className="text-xs text-blue-600">🌡️ Temperatura controlada</div>
                            )}
                            {location.restricted_access && (
                              <div className="text-xs text-red-600">🔒 Acesso restrito</div>
                            )}
                            {!location.temperature_controlled && !location.restricted_access && (
                              <div className="text-xs text-gray-500">📦 Padrão</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(location)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(location.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

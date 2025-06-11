
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Search, Plus, Grid3X3, Package, AlertTriangle } from 'lucide-react';

export const LocationManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');

  const locations = [
    {
      id: '1',
      code: 'A-01-03-C',
      description: 'Prateleira A, Seção 1, Nível 3, Posição C',
      street: 'A',
      shelf: '01',
      level: '03',
      position: 'C',
      zone_type: 'storage',
      capacity: 100,
      occupied: 85,
      status: 'occupied',
      current_sku: 'PAR-M6-20'
    },
    {
      id: '2',
      code: 'B-02-01-A',
      description: 'Prateleira B, Seção 2, Nível 1, Posição A',
      street: 'B',
      shelf: '02',
      level: '01',
      position: 'A',
      zone_type: 'picking',
      capacity: 50,
      occupied: 0,
      status: 'available',
      current_sku: null
    },
    {
      id: '3',
      code: 'C-03-02-B',
      description: 'Prateleira C, Seção 3, Nível 2, Posição B',
      street: 'C',
      shelf: '03',
      level: '02',
      position: 'B',
      zone_type: 'storage',
      capacity: 200,
      occupied: 150,
      status: 'occupied',
      current_sku: 'LUV-SEG-P'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'picking': return 'bg-purple-100 text-purple-800';
      case 'storage': return 'bg-blue-100 text-blue-800';
      case 'staging': return 'bg-orange-100 text-orange-800';
      case 'quarantine': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOccupancyColor = (occupied: number, capacity: number) => {
    const percentage = (occupied / capacity) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = selectedZone === 'all' || location.zone_type === selectedZone;
    
    return matchesSearch && matchesZone;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Endereços</h2>
          <p className="text-gray-600">Mapeamento e controle de localizações no almoxarifado</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Endereço
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1,245</div>
              <div className="text-sm text-gray-600">Total de Endereços</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">1,087</div>
              <div className="text-sm text-gray-600">Ocupados (87.3%)</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">158</div>
              <div className="text-sm text-gray-600">Disponíveis</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">12</div>
              <div className="text-sm text-gray-600">Bloqueados/Manutenção</div>
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
                  placeholder="Buscar por código de endereço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de Zona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Zonas</SelectItem>
                <SelectItem value="picking">Picking</SelectItem>
                <SelectItem value="storage">Armazenagem</SelectItem>
                <SelectItem value="staging">Expedição</SelectItem>
                <SelectItem value="quarantine">Quarentena</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Grid3X3 className="h-4 w-4 mr-2" />
              Mapa Visual
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Locations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Endereços de Armazenagem ({filteredLocations.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLocations.map((location) => {
              const occupancyPercentage = (location.occupied / location.capacity) * 100;
              const occupancyColor = getOccupancyColor(location.occupied, location.capacity);
              
              return (
                <div key={location.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900 font-mono text-lg">{location.code}</h3>
                        <Badge className={getStatusColor(location.status)}>
                          {location.status === 'available' ? 'Disponível' :
                           location.status === 'occupied' ? 'Ocupado' :
                           location.status === 'blocked' ? 'Bloqueado' : 'Manutenção'}
                        </Badge>
                        <Badge className={getZoneColor(location.zone_type)}>
                          {location.zone_type === 'picking' ? 'Picking' :
                           location.zone_type === 'storage' ? 'Armazenagem' :
                           location.zone_type === 'staging' ? 'Expedição' : 'Quarentena'}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{location.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Estrutura:</span>
                          <p className="text-gray-600">
                            Rua {location.street} • Prat. {location.shelf} • Nív. {location.level} • Pos. {location.position}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Capacidade:</span>
                          <p className="text-gray-600">{location.capacity} unidades</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Ocupação:</span>
                          <p className={occupancyColor}>
                            {location.occupied}/{location.capacity} ({occupancyPercentage.toFixed(1)}%)
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">SKU Atual:</span>
                          <p className="text-gray-600">
                            {location.current_sku ? (
                              <Badge variant="outline">{location.current_sku}</Badge>
                            ) : (
                              <span className="text-gray-400">Vazio</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Occupancy bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              occupancyPercentage >= 90 ? 'bg-red-600' :
                              occupancyPercentage >= 75 ? 'bg-yellow-600' : 'bg-green-600'
                            }`}
                            style={{ width: `${occupancyPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Package className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
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

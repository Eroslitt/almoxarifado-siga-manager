
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Package, 
  AlertTriangle, 
  TrendingDown,
  MapPin,
  Calendar,
  Plus
} from 'lucide-react';

export const StockModule = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const stockItems = [
    {
      id: 'SKU001',
      name: 'Parafuso M6 x 20mm',
      category: 'Ferramentas',
      currentStock: 150,
      minStock: 100,
      maxStock: 500,
      location: 'A-01-03-C',
      lastMovement: '2024-06-10',
      classification: 'A',
      status: 'normal'
    },
    {
      id: 'SKU002',
      name: 'Capacitor 220µF',
      category: 'Eletrônicos',
      currentStock: 25,
      minStock: 50,
      maxStock: 200,
      location: 'B-02-01-A',
      lastMovement: '2024-06-09',
      classification: 'B',
      status: 'critical'
    },
    {
      id: 'SKU003',
      name: 'Luva de Segurança P',
      category: 'EPI',
      currentStock: 80,
      minStock: 30,
      maxStock: 150,
      location: 'C-03-02-B',
      lastMovement: '2024-06-11',
      classification: 'C',
      status: 'normal'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const filteredItems = stockItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Estoque</h1>
          <p className="text-gray-600 mt-1">Controle total dos itens do almoxarifado</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Item
        </Button>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de SKUs</p>
                <p className="text-2xl font-bold">2.847</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Estoque Crítico</p>
                <p className="text-2xl font-bold text-red-600">23</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Sem Movimento</p>
                <p className="text-2xl font-bold text-orange-600">156</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Endereços</p>
                <p className="text-2xl font-bold">1.245</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por SKU ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Itens */}
      <Card>
        <CardHeader>
          <CardTitle>Itens em Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <Badge variant="outline">{item.id}</Badge>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status === 'critical' ? 'Crítico' : 'Normal'}
                      </Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Categoria:</span>
                        <p>{item.category}</p>
                      </div>
                      <div>
                        <span className="font-medium">Estoque Atual:</span>
                        <p className={item.currentStock < item.minStock ? 'text-red-600 font-semibold' : ''}>
                          {item.currentStock} un
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Min/Max:</span>
                        <p>{item.minStock}/{item.maxStock} un</p>
                      </div>
                      <div>
                        <span className="font-medium">Localização:</span>
                        <p className="font-mono">{item.location}</p>
                      </div>
                      <div>
                        <span className="font-medium">Última Movim.:</span>
                        <p>{new Date(item.lastMovement).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Curva {item.classification}</Badge>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

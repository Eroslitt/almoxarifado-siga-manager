
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Building2, 
  MapPin, 
  Tags,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { SKUManager } from '@/components/masterdata/SKUManager';
import { SupplierManager } from '@/components/masterdata/SupplierManager';
import { LocationManager } from '@/components/masterdata/LocationManager';
import { CategoryManager } from '@/components/masterdata/CategoryManager';

export const MasterDataModule = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock analytics data
  const analytics = {
    totalSKUs: 2847,
    activeSuppliers: 156,
    totalLocations: 1245,
    lowStockItems: 23,
    categories: 45,
    movements24h: 89
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Data</h1>
          <p className="text-gray-600 mt-1">Cadastros Centrais - Fundação do Sistema</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Relatórios
          </Button>
          <Button>
            <Package className="h-4 w-4 mr-2" />
            Importar Dados
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="skus">SKUs</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="locations">Endereços</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total SKUs</p>
                    <p className="text-2xl font-bold">{analytics.totalSKUs.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Fornecedores</p>
                    <p className="text-2xl font-bold">{analytics.activeSuppliers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Endereços</p>
                    <p className="text-2xl font-bold">{analytics.totalLocations.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Tags className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Categorias</p>
                    <p className="text-2xl font-bold">{analytics.categories}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Estoque Baixo</p>
                    <p className="text-2xl font-bold text-red-600">{analytics.lowStockItems}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-600">Movim. 24h</p>
                    <p className="text-2xl font-bold">{analytics.movements24h}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setActiveTab('skus')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span>Cadastrar SKU</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Adicionar novo item ao catálogo com todas as especificações técnicas
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setActiveTab('suppliers')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Building2 className="h-5 w-5 text-green-600" />
                  <span>Novo Fornecedor</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Cadastrar fornecedor com dados fiscais e comerciais completos
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setActiveTab('locations')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <span>Mapear Endereço</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Definir novos endereços de armazenagem no almoxarifado
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setActiveTab('categories')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Tags className="h-5 w-5 text-orange-600" />
                  <span>Nova Categoria</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Organizar itens em categorias e subcategorias
                </p>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Integridade dos Dados</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <div className="text-sm text-gray-600">Códigos Únicos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">99.2%</div>
                  <div className="text-sm text-gray-600">Fornecedores Válidos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">87.3%</div>
                  <div className="text-sm text-gray-600">Endereços Ocupados</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skus">
          <SKUManager />
        </TabsContent>

        <TabsContent value="suppliers">
          <SupplierManager />
        </TabsContent>

        <TabsContent value="locations">
          <LocationManager />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

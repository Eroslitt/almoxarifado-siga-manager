
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Building2, 
  MapPin, 
  Tags,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Zap,
  Brain,
  Shield
} from 'lucide-react';
import { SKUManager } from '@/components/masterdata/SKUManager';
import { SupplierManager } from '@/components/masterdata/SupplierManager';
import { LocationManager } from '@/components/masterdata/LocationManager';
import { CategoryManager } from '@/components/masterdata/CategoryManager';
import { masterDataAnalytics } from '@/services/masterDataAnalytics';
import { realTimeSync } from '@/services/realTimeSync';
import { useToast } from '@/hooks/use-toast';

export const MasterDataModule = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [realTimeUpdates, setRealTimeUpdates] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
    setupRealTimeSubscriptions();
    
    return () => {
      realTimeSync.cleanup();
    };
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [analyticsData, insightsData] = await Promise.all([
        masterDataAnalytics.getComprehensiveAnalytics(),
        masterDataAnalytics.generateInsights()
      ]);
      
      setAnalytics(analyticsData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados analíticos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscriptions = () => {
    // Subscribe to stock changes
    const unsubscribeStock = realTimeSync.subscribeToStockChanges((payload) => {
      console.log('Stock level changed:', payload);
      setRealTimeUpdates(prev => prev + 1);
      toast({
        title: "Atualização em tempo real",
        description: "Níveis de estoque foram atualizados",
      });
    });

    // Subscribe to SKU changes
    const unsubscribeSKU = realTimeSync.subscribeToSKUChanges((payload) => {
      console.log('SKU changed:', payload);
      setRealTimeUpdates(prev => prev + 1);
      loadAnalytics(); // Refresh analytics
    });

    // Subscribe to supplier changes
    const unsubscribeSupplier = realTimeSync.subscribeToSupplierChanges((payload) => {
      console.log('Supplier changed:', payload);
      setRealTimeUpdates(prev => prev + 1);
    });

    return () => {
      unsubscribeStock();
      unsubscribeSKU();
      unsubscribeSupplier();
    };
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Data</h1>
          <p className="text-gray-600 mt-1">Cadastros Centrais - Fundação do Sistema</p>
          {realTimeUpdates > 0 && (
            <Badge variant="outline" className="mt-2">
              <Zap className="h-3 w-3 mr-1" />
              {realTimeUpdates} atualizações em tempo real
            </Badge>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadAnalytics}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Atualizar Analytics
          </Button>
          <Button>
            <Package className="h-4 w-4 mr-2" />
            Importar Dados
          </Button>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <Alert>
          <Brain className="h-4 w-4" />
          <AlertDescription>
            <strong>Insights do Sistema:</strong>
            <ul className="mt-2 space-y-1">
              {insights.map((insight, index) => (
                <li key={index} className="text-sm">{insight}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                    <p className="text-2xl font-bold">{analytics?.totalSKUs?.toLocaleString() || 0}</p>
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
                    <p className="text-2xl font-bold">{analytics?.activeSuppliers || 0}</p>
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
                    <p className="text-2xl font-bold">{analytics?.totalLocations?.toLocaleString() || 0}</p>
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
                    <p className="text-2xl font-bold">{analytics?.categories || 0}</p>
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
                    <p className="text-2xl font-bold text-red-600">{analytics?.lowStockItems || 0}</p>
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
                    <p className="text-2xl font-bold">{analytics?.recentMovements || 0}</p>
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
                <Shield className="h-5 w-5 text-green-600" />
                <span>Integridade dos Dados</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analytics?.utilizationRate?.toFixed(1) || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Taxa de Utilização</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics?.abcDistribution?.A || 0}
                  </div>
                  <div className="text-sm text-gray-600">SKUs Classe A</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {analytics?.topCategories?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Categorias Ativas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {realTimeUpdates}
                  </div>
                  <div className="text-sm text-gray-600">Atualizações Hoje</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Top Categorias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.topCategories?.map((category: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{category.count}</span>
                        <Badge variant="secondary">
                          {category.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  )) || <p className="text-gray-500">Nenhum dado disponível</p>}
                </div>
              </CardContent>
            </Card>

            {/* ABC Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição ABC</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Classe A (Críticos)</span>
                    <Badge className="bg-red-100 text-red-800">
                      {analytics?.abcDistribution?.A || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Classe B (Importantes)</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {analytics?.abcDistribution?.B || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Classe C (Normais)</span>
                    <Badge className="bg-green-100 text-green-800">
                      {analytics?.abcDistribution?.C || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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

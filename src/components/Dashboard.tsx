import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  AlertTriangle, 
  ShoppingCart,
  Clock,
  CheckCircle,
  Archive,
  HardHat,
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react';

interface DashboardData {
  totalSKUs: number;
  criticalStock: number;
  pendingRequests: number;
  pendingVerifications: number;
  totalPatrimonios: number;
  activeEPIs: number;
}

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSKUs: 0,
    criticalStock: 0,
    pendingRequests: 0,
    pendingVerifications: 0,
    totalPatrimonios: 0,
    activeEPIs: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    
    try {
      const [skusResult, requestsResult, verificationsResult, patrimoniosResult, episResult] = await Promise.all([
        supabase.from('skus').select('id, status'),
        supabase.from('material_requests').select('id').eq('status', 'pending'),
        supabase.from('material_verifications').select('id').eq('verification_status', 'pending'),
        supabase.from('patrimonios').select('id'),
        supabase.from('epis').select('id').eq('status', 'available'),
      ]);

      setDashboardData({
        totalSKUs: skusResult.data?.length || 0,
        criticalStock: skusResult.data?.filter(s => s.status === 'critical').length || 0,
        pendingRequests: requestsResult.data?.length || 0,
        pendingVerifications: verificationsResult.data?.length || 0,
        totalPatrimonios: patrimoniosResult.data?.length || 0,
        activeEPIs: episResult.data?.length || 0,
      });

      if (showRefreshing) {
        toast({
          title: "Dados atualizados",
          description: "Dashboard atualizado com sucesso.",
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const KPICard = ({ 
    icon: Icon, 
    title, 
    value, 
    trend, 
    color,
    loading: isLoading 
  }: { 
    icon: React.ElementType; 
    title: string; 
    value: number; 
    trend?: 'up' | 'down' | 'neutral';
    color: string;
    loading?: boolean;
  }) => (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-l-4" style={{ borderLeftColor: color }}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-xl transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon className="h-6 w-6" style={{ color }} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-foreground">{value}</p>
              )}
            </div>
          </div>
          {trend && !isLoading && (
            <div className={`flex items-center gap-1 text-sm ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 
              'text-muted-foreground'
            }`}>
              {trend === 'up' && <TrendingUp className="h-4 w-4" />}
              {trend === 'down' && <TrendingDown className="h-4 w-4" />}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral do sistema de almoxarifado</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-fit"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          icon={Package} 
          title="Total de SKUs" 
          value={dashboardData.totalSKUs}
          color="#3B82F6"
          loading={loading}
        />
        <KPICard 
          icon={AlertTriangle} 
          title="Estoque Crítico" 
          value={dashboardData.criticalStock}
          trend={dashboardData.criticalStock > 0 ? 'down' : 'neutral'}
          color="#EF4444"
          loading={loading}
        />
        <KPICard 
          icon={ShoppingCart} 
          title="Requisições Pendentes" 
          value={dashboardData.pendingRequests}
          color="#F97316"
          loading={loading}
        />
        <KPICard 
          icon={Clock} 
          title="Verificações Pendentes" 
          value={dashboardData.pendingVerifications}
          color="#8B5CF6"
          loading={loading}
        />
      </div>

      {/* KPIs Secundários */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KPICard 
          icon={Archive} 
          title="Total Patrimônios" 
          value={dashboardData.totalPatrimonios}
          color="#22C55E"
          loading={loading}
        />
        <KPICard 
          icon={HardHat} 
          title="EPIs Disponíveis" 
          value={dashboardData.activeEPIs}
          color="#6366F1"
          loading={loading}
        />
      </div>

      {/* Status das Operações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              Status das Operações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">Estoque</span>
                  <Badge variant={dashboardData.criticalStock > 0 ? "destructive" : "default"}>
                    {dashboardData.criticalStock > 0 ? 'Atenção Necessária' : 'Normal'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">Requisições</span>
                  <Badge variant={dashboardData.pendingRequests > 0 ? "secondary" : "default"}>
                    {dashboardData.pendingRequests} Pendentes
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">Verificações</span>
                  <Badge variant={dashboardData.pendingVerifications > 0 ? "secondary" : "default"}>
                    {dashboardData.pendingVerifications} Pendentes
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-primary" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                <Package className="h-5 w-5" />
                <span className="text-xs font-medium">Novo Item</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                <ShoppingCart className="h-5 w-5" />
                <span className="text-xs font-medium">Requisição</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                <CheckCircle className="h-5 w-5" />
                <span className="text-xs font-medium">Verificação</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                <Archive className="h-5 w-5" />
                <span className="text-xs font-medium">Patrimônio</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Avisos */}
      {!loading && dashboardData.criticalStock > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-destructive">Atenção: Itens com Estoque Crítico</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Existem {dashboardData.criticalStock} item(s) com estoque abaixo do nível mínimo.
                </p>
                <Button variant="link" className="p-0 h-auto mt-2 text-destructive">
                  Ver itens críticos →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

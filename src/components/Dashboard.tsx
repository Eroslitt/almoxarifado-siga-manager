import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AuthBanner } from '@/components/AuthBanner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  ShoppingCart,
  FileText,
  Clock,
  CheckCircle,
  Archive,
  HardHat,
  BarChart3
} from 'lucide-react';

export const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState({
    totalSKUs: 0,
    criticalStock: 0,
    pendingRequests: 0,
    pendingVerifications: 0,
    totalPatrimonios: 0,
    activeEPIs: 0,
    recentActivity: []
  });

  useEffect(() => {
    getCurrentUser();
    loadDashboardData();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadDashboardData = async () => {
    try {
      // Load SKUs data
      const { data: skus } = await supabase
        .from('skus')
        .select('*');

      // Load material requests
      const { data: requests } = await supabase
        .from('material_requests')
        .select('*')
        .eq('status', 'pending');

      // Load material verifications
      const { data: verifications } = await supabase
        .from('material_verifications')
        .select('*')
        .eq('verification_status', 'pending');

      // Load patrimônios
      const { data: patrimonios } = await supabase
        .from('patrimonios')
        .select('*');

      // Load EPIs
      const { data: epis } = await supabase
        .from('epis')
        .select('*')
        .eq('status', 'available');

      setDashboardData({
        totalSKUs: skus?.length || 0,
        criticalStock: skus?.filter(s => s.status === 'critical').length || 0,
        pendingRequests: requests?.length || 0,
        pendingVerifications: verifications?.length || 0,
        totalPatrimonios: patrimonios?.length || 0,
        activeEPIs: epis?.length || 0,
        recentActivity: []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <AuthBanner user={currentUser} onAuthChange={getCurrentUser} />
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral do sistema de almoxarifado</p>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de SKUs</p>
                <p className="text-2xl font-bold">{dashboardData.totalSKUs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Estoque Crítico</p>
                <p className="text-2xl font-bold text-red-600">{dashboardData.criticalStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Requisições Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{dashboardData.pendingRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Verificações Pendentes</p>
                <p className="text-2xl font-bold text-purple-600">{dashboardData.pendingVerifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs Secundários */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Archive className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Patrimônios</p>
                <p className="text-2xl font-bold text-green-600">{dashboardData.totalPatrimonios}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <HardHat className="h-8 w-8 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600">EPIs Disponíveis</p>
                <p className="text-2xl font-bold text-indigo-600">{dashboardData.activeEPIs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status das Operações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Status das Operações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estoque</span>
                <Badge variant={dashboardData.criticalStock > 0 ? "destructive" : "default"}>
                  {dashboardData.criticalStock > 0 ? 'Atenção Necessária' : 'Normal'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Requisições</span>
                <Badge variant={dashboardData.pendingRequests > 0 ? "secondary" : "default"}>
                  {dashboardData.pendingRequests} Pendentes
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Verificações</span>
                <Badge variant={dashboardData.pendingVerifications > 0 ? "secondary" : "default"}>
                  {dashboardData.pendingVerifications} Pendentes
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
                <Package className="h-5 w-5" />
                <span className="text-xs">Novo Item</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span className="text-xs">Requisição</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-xs">Verificação</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
                <Archive className="h-5 w-5" />
                <span className="text-xs">Patrimônio</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Avisos */}
      {dashboardData.criticalStock > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Atenção: Itens com Estoque Crítico</h3>
                <p className="text-sm text-red-700">
                  Existem {dashboardData.criticalStock} item(s) com estoque abaixo do nível mínimo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  Clock,
  User,
  Wrench,
  AlertTriangle,
  FileText,
  Settings
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useEffect, useState } from 'react';

export const ToolsReports = () => {
  const { 
    usageMetrics, 
    periodMetrics, 
    maintenanceMetrics, 
    anomalies, 
    trends,
    isLoading,
    generateReport,
    loadPeriodMetrics
  } = useAnalytics();

  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    loadPeriodMetrics(selectedPeriod);
  }, [selectedPeriod, loadPeriodMetrics]);

  const utilizationData = trends.map((trend, index) => ({
    name: new Date(trend.date).toLocaleDateString('pt-BR', { weekday: 'short' }),
    utilizacao: trend.utilization,
    trend: trend.trend
  }));

  const categoryData = [
    { name: 'Elétricas', value: 35, color: '#3b82f6' },
    { name: 'Manuais', value: 45, color: '#10b981' },
    { name: 'Pneumáticas', value: 15, color: '#f59e0b' },
    { name: 'Medição', value: 5, color: '#ef4444' },
  ];

  const handleExportReport = async (type: 'usage' | 'maintenance' | 'efficiency', format: 'pdf' | 'excel') => {
    const success = await generateReport(type, format);
    if (!success) {
      console.error('Failed to generate report');
    }
  };

  return (
    <div className="space-y-6">
      {/* Controles Superiores */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Relatórios e Analytics</h2>
          <p className="text-gray-600">Análise detalhada do uso de ferramentas</p>
        </div>
        <div className="flex space-x-2">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="px-3 py-2 border rounded-md"
          >
            <option value="daily">Diário</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensal</option>
          </select>
          <Button 
            variant="outline"
            onClick={() => handleExportReport('usage', 'pdf')}
            disabled={isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => handleExportReport('usage', 'excel')}
            disabled={isLoading}
          >
            <FileText className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Taxa de Utilização</p>
                <p className="text-2xl font-bold text-green-600">
                  {trends.length > 0 ? `${Math.round(trends[trends.length - 1].utilization)}%` : '73%'}
                </p>
                <p className="text-xs text-gray-500">vs período anterior</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Tempo Médio de Uso</p>
                <p className="text-2xl font-bold">
                  {usageMetrics.length > 0 
                    ? `${(usageMetrics.reduce((acc, m) => acc + m.averageUsageTime, 0) / usageMetrics.length).toFixed(1)}h`
                    : '4.2h'
                  }
                </p>
                <p className="text-xs text-gray-500">Por checkout</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Checkouts Hoje</p>
                <p className="text-2xl font-bold">
                  {periodMetrics.length > 0 ? periodMetrics[periodMetrics.length - 1]?.totalCheckouts || 28 : 28}
                </p>
                <p className="text-xs text-gray-500">vs ontem</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wrench className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">MTTR Manutenção</p>
                <p className="text-2xl font-bold">2.1d</p>
                <p className="text-xs text-gray-500">Tempo médio de reparo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Anomalias */}
      {anomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Anomalias Detectadas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {anomalies.slice(0, 3).map((anomaly, index) => (
                <div key={index} className={`p-3 border-l-4 rounded-r-lg ${
                  anomaly.severity === 'high' ? 'border-red-500 bg-red-50' :
                  anomaly.severity === 'medium' ? 'border-orange-500 bg-orange-50' :
                  'border-yellow-500 bg-yellow-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{anomaly.description}</h4>
                      <p className="text-sm text-gray-600 mt-1">{anomaly.recommendation}</p>
                    </div>
                    <Badge variant={anomaly.severity === 'high' ? 'destructive' : 'secondary'}>
                      {anomaly.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Utilização</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Utilização']} />
                <Line dataKey="utilizacao" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabelas de Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Ferramentas por Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usageMetrics.slice(0, 5).map((metric, index) => (
                <div key={metric.toolId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{metric.toolName}</h4>
                      <p className="text-sm text-gray-600">{metric.usageCount} usos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{metric.utilizationRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">{metric.totalUsageHours}h total</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Manutenções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenanceMetrics?.nextDue?.map((item, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{item.toolName}</h4>
                    <Badge variant={
                      item.priority === 'high' ? 'destructive' :
                      item.priority === 'medium' ? 'secondary' : 'outline'
                    }>
                      {item.priority}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Vencimento: {new Date(item.dueDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="mt-2">
                    <Progress 
                      value={item.priority === 'high' ? 90 : item.priority === 'medium' ? 60 : 30} 
                      className="h-1"
                    />
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">Nenhuma manutenção pendente</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

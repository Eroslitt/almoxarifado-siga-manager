
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { 
    usageMetrics, 
    periodMetrics, 
    maintenanceMetrics, 
    anomalies, 
    trends, 
    isLoading,
    generateReport 
  } = useAnalytics();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleExportReport = async (type: 'usage' | 'maintenance' | 'efficiency', format: 'pdf' | 'excel') => {
    const success = await generateReport(type, format);
    if (success) {
      console.log(`📊 Relatório ${type} exportado em ${format}`);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Carregando analytics...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics e Relatórios</h2>
          <p className="text-gray-600">Análise inteligente do uso de ferramentas</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleExportReport('usage', 'pdf')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleExportReport('usage', 'excel')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Anomalies Alert */}
      {anomalies.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Anomalias Detectadas ({anomalies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {anomalies.slice(0, 3).map((anomaly, index) => (
                <div key={index} className={`p-3 rounded border-l-4 ${
                  anomaly.severity === 'high' ? 'border-red-400 bg-red-50' :
                  anomaly.severity === 'medium' ? 'border-yellow-400 bg-yellow-50' :
                  'border-blue-400 bg-blue-50'
                }`}>
                  <p className="font-medium">{anomaly.description}</p>
                  <p className="text-sm text-gray-600">{anomaly.recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Utilização</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(usageMetrics.reduce((acc, tool) => acc + tool.utilizationRate, 0) / usageMetrics.length || 0)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tempo Médio de Uso</p>
                <p className="text-2xl font-bold text-green-600">
                  {(usageMetrics.reduce((acc, tool) => acc + tool.averageUsageTime, 0) / usageMetrics.length || 0).toFixed(1)}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Manutenções Agendadas</p>
                <p className="text-2xl font-bold text-orange-600">{maintenanceMetrics?.scheduled || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Custo Médio Manutenção</p>
                <p className="text-2xl font-bold text-purple-600">
                  R$ {maintenanceMetrics?.averageCost?.toFixed(2) || '0.00'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage by Period */}
        <Card>
          <CardHeader>
            <CardTitle>Utilização por Período</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={periodMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="utilizationRate" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tools Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Utilização por Ferramenta</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usageMetrics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, utilizationRate}) => `${name}: ${utilizationRate.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="utilizationRate"
                >
                  {usageMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Utilização (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="utilization" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Ferramentas Mais Utilizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usageMetrics
                .sort((a, b) => b.usageCount - a.usageCount)
                .slice(0, 5)
                .map((tool, index) => (
                  <div key={tool.toolId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{tool.toolName}</p>
                        <p className="text-sm text-gray-600">{tool.usageCount} usos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{tool.totalUsageHours.toFixed(1)}h</p>
                      <p className="text-sm text-gray-600">{tool.utilizationRate.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

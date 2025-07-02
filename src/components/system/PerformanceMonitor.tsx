
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Users, 
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface PerformanceData {
  timestamp: string;
  cpu: number;
  memory: number;
  network: number;
  responseTime: number;
}

const mockMetrics: SystemMetric[] = [
  { name: 'CPU Usage', value: 34, unit: '%', status: 'good', trend: 'stable' },
  { name: 'Memory', value: 67, unit: '%', status: 'warning', trend: 'up' },
  { name: 'Network', value: 23, unit: 'Mbps', status: 'good', trend: 'down' },
  { name: 'Response Time', value: 145, unit: 'ms', status: 'good', trend: 'stable' },
  { name: 'Active Users', value: 28, unit: 'users', status: 'good', trend: 'up' },
  { name: 'Database', value: 89, unit: '%', status: 'critical', trend: 'up' }
];

const generatePerformanceData = (): PerformanceData[] => {
  const data: PerformanceData[] = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60000); // Last 30 minutes
    data.push({
      timestamp: timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      cpu: Math.floor(Math.random() * 40) + 20,
      memory: Math.floor(Math.random() * 30) + 50,
      network: Math.floor(Math.random() * 50) + 10,
      responseTime: Math.floor(Math.random() * 100) + 100
    });
  }
  
  return data;
};

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>(mockMetrics);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'warning' | 'critical'>('healthy');

  useEffect(() => {
    setPerformanceData(generatePerformanceData());
    
    // Update metrics every 5 seconds
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, metric.value + (Math.random() - 0.5) * 10),
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
      })));
      
      // Add new performance data point
      setPerformanceData(prev => {
        const newPoint: PerformanceData = {
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          cpu: Math.floor(Math.random() * 40) + 20,
          memory: Math.floor(Math.random() * 30) + 50,
          network: Math.floor(Math.random() * 50) + 10,
          responseTime: Math.floor(Math.random() * 100) + 100
        };
        return [...prev.slice(1), newPoint];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Calculate system health based on metrics
    const criticalCount = metrics.filter(m => m.status === 'critical').length;
    const warningCount = metrics.filter(m => m.status === 'warning').length;
    
    if (criticalCount > 0) {
      setSystemHealth('critical');
    } else if (warningCount > 0) {
      setSystemHealth('warning');
    } else {
      setSystemHealth('healthy');
    }
  }, [metrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthBadge = () => {
    switch (systemHealth) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Sistema Saudável</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Atenção Necessária</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Intervenção Crítica</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Monitor de Performance
          </h2>
          <p className="text-gray-600">Monitoramento em tempo real do sistema</p>
        </div>
        {getHealthBadge()}
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{metric.name}</span>
                {getStatusIcon(metric.status)}
              </div>
              <div className="flex items-end gap-1 mb-2">
                <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                  {Math.round(metric.value)}
                </span>
                <span className="text-sm text-gray-500">{metric.unit}</span>
              </div>
              
              {metric.name.includes('%') && (
                <Progress 
                  value={metric.value} 
                  className={`h-2 ${
                    metric.status === 'critical' ? '[&>div]:bg-red-500' :
                    metric.status === 'warning' ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'
                  }`}
                />
              )}
              
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs ${
                  metric.trend === 'up' ? 'text-red-500' :
                  metric.trend === 'down' ? 'text-green-500' : 'text-gray-500'
                }`}>
                  {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} 
                  {metric.trend}
                </span>
                <span className="text-xs text-gray-400">tempo real</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              CPU & Memória
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} name="CPU %" />
                <Line type="monotone" dataKey="memory" stroke="#ef4444" strokeWidth={2} name="Memória %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Rede & Tempo de Resposta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="network" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3}
                  name="Rede (Mbps)"
                />
                <Area 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#f59e0b" 
                  fill="#f59e0b" 
                  fillOpacity={0.3}
                  name="Resposta (ms)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Eventos do Sistema (Últimos 30 min)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: '14:35', type: 'info', message: 'Backup automático concluído com sucesso' },
              { time: '14:32', type: 'warning', message: 'Uso de memória acima de 80%' },
              { time: '14:28', type: 'success', message: 'Otimização de cache executada' },
              { time: '14:25', type: 'info', message: '12 usuários conectados simultaneamente' },
              { time: '14:20', type: 'critical', message: 'Tentativa de acesso não autorizado bloqueada' }
            ].map((event, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <span className="text-xs text-gray-500 w-12">{event.time}</span>
                <div className={`w-2 h-2 rounded-full ${
                  event.type === 'critical' ? 'bg-red-500' :
                  event.type === 'warning' ? 'bg-yellow-500' :
                  event.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
                <span className="text-sm flex-1">{event.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
              <HardDrive className="h-6 w-6 text-blue-600 mb-2" />
              <div className="text-sm font-medium">Limpar Cache</div>
              <div className="text-xs text-gray-500">Otimizar performance</div>
            </button>
            
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
              <Users className="h-6 w-6 text-green-600 mb-2" />
              <div className="text-sm font-medium">Sessões Ativas</div>
              <div className="text-xs text-gray-500">Gerenciar usuários</div>
            </button>
            
            <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-left transition-colors">
              <TrendingUp className="h-6 w-6 text-yellow-600 mb-2" />
              <div className="text-sm font-medium">Relatório</div>
              <div className="text-xs text-gray-500">Performance detalhada</div>
            </button>
            
            <button className="p-4 bg-red-50 hover:bg-red-100 rounded-lg text-left transition-colors">
              <AlertTriangle className="h-6 w-6 text-red-600 mb-2" />
              <div className="text-sm font-medium">Diagnóstico</div>
              <div className="text-xs text-gray-500">Verificar problemas</div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

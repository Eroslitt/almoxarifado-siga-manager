
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, User, Bell } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  timestamp: string;
  toolsInUse: number;
  activeUsers: number;
  movements: number;
  alerts: number;
}

interface KPIData {
  label: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const mockRealTimeData = (): AnalyticsData[] => {
  const data = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      timestamp: timestamp.toISOString(),
      toolsInUse: Math.floor(Math.random() * 50) + 20,
      activeUsers: Math.floor(Math.random() * 30) + 10,
      movements: Math.floor(Math.random() * 20) + 5,
      alerts: Math.floor(Math.random() * 8) + 1
    });
  }
  
  return data;
};

const mockKPIData: KPIData[] = [
  {
    label: 'Ferramentas em Uso',
    value: 47,
    change: 12.5,
    trend: 'up',
    icon: Package,
    color: 'text-blue-600'
  },
  {
    label: 'Usuários Ativos',
    value: 23,
    change: -5.2,
    trend: 'down',
    icon: User,
    color: 'text-green-600'
  },
  {
    label: 'Taxa de Utilização',
    value: '78.3%',
    change: 8.1,
    trend: 'up',
    icon: TrendingUp,
    color: 'text-purple-600'
  },
  {
    label: 'Alertas Ativos',
    value: 4,
    change: 0,
    trend: 'stable',
    icon: Bell,
    color: 'text-orange-600'
  }
];

const utilizationData = [
  { name: 'Furadeiras', value: 85, color: '#3B82F6' },
  { name: 'Serras', value: 67, color: '#10B981' },
  { name: 'Chaves', value: 92, color: '#8B5CF6' },
  { name: 'Martelos', value: 45, color: '#F59E0B' },
  { name: 'Outros', value: 73, color: '#EF4444' }
];

export const RealTimeAnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData[]>(mockRealTimeData());
  const [isLive, setIsLive] = useState(true);
  const isMobile = useMobile();

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData.slice(1)];
        const lastPoint = prevData[prevData.length - 1];
        
        newData.push({
          timestamp: new Date().toISOString(),
          toolsInUse: Math.max(0, lastPoint.toolsInUse + (Math.random() - 0.5) * 10),
          activeUsers: Math.max(0, lastPoint.activeUsers + (Math.random() - 0.5) * 6),
          movements: Math.max(0, lastPoint.movements + (Math.random() - 0.5) * 4),
          alerts: Math.max(0, lastPoint.alerts + (Math.random() - 0.5) * 2)
        });
        
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  const getTrendColor = (trend: string, change: number) => {
    if (trend === 'stable') return 'text-gray-500';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn(
            "font-bold",
            isMobile ? "text-xl" : "text-2xl"
          )}>Analytics em Tempo Real</h2>
          <p className="text-muted-foreground text-sm">
            Monitoramento contínuo das operações
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isLive ? "default" : "secondary"} className="animate-pulse">
            {isLive ? '🟢 Ao Vivo' : '⏸️ Pausado'}
          </Badge>
          <button
            onClick={() => setIsLive(!isLive)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isLive ? 'Pausar' : 'Retomar'}
          </button>
        </div>
      </div>

      {/* KPIs em Tempo Real */}
      <div className={cn(
        "grid gap-4",
        isMobile 
          ? "grid-cols-2" 
          : "grid-cols-2 lg:grid-cols-4"
      )}>
        {mockKPIData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className={cn(
                "p-4",
                isMobile && "p-3"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <Icon className={cn(kpi.color, isMobile ? "h-4 w-4" : "h-5 w-5")} />
                  <span className={cn(
                    getTrendColor(kpi.trend, kpi.change),
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    {getTrendIcon(kpi.trend)} {Math.abs(kpi.change)}%
                  </span>
                </div>
                <div className={cn(
                  "font-bold mb-1",
                  isMobile ? "text-lg" : "text-2xl"
                )}>
                  {kpi.value}
                </div>
                <p className={cn(
                  "text-muted-foreground",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  {kpi.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos em Tempo Real */}
      <div className={cn(
        "grid gap-6",
        isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
      )}>
        <Card>
          <CardHeader>
            <CardTitle className={isMobile ? "text-base" : "text-lg"}>
              Atividade em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
              <LineChart data={data}>
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  fontSize={isMobile ? 10 : 12}
                />
                <YAxis fontSize={isMobile ? 10 : 12} />
                <Line 
                  type="monotone" 
                  dataKey="toolsInUse" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Ferramentas"
                />
                <Line 
                  type="monotone" 
                  dataKey="activeUsers" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Usuários"
                />
                <Line 
                  type="monotone" 
                  dataKey="movements" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Movimentações"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={isMobile ? "text-base" : "text-lg"}>
              Utilização por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {utilizationData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={cn(
                      "font-medium",
                      isMobile ? "text-sm" : "text-base"
                    )}>
                      {item.name}
                    </span>
                    <span className={cn(
                      "font-bold",
                      isMobile ? "text-sm" : "text-base"
                    )} style={{ color: item.color }}>
                      {item.value}%
                    </span>
                  </div>
                  <Progress 
                    value={item.value} 
                    className="h-2" 
                    style={{ 
                      backgroundColor: `${item.color}20`,
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status de Saúde do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className={isMobile ? "text-base" : "text-lg"}>
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-3"
          )}>
            <div className="text-center">
              <div className="text-green-500 text-2xl mb-2">🟢</div>
              <p className="font-medium">Database</p>
              <p className="text-sm text-muted-foreground">Operacional</p>
            </div>
            <div className="text-center">
              <div className="text-green-500 text-2xl mb-2">🟢</div>
              <p className="font-medium">API</p>
              <p className="text-sm text-muted-foreground">Operacional</p>
            </div>
            <div className="text-center">
              <div className="text-yellow-500 text-2xl mb-2">🟡</div>
              <p className="font-medium">Sync</p>
              <p className="text-sm text-muted-foreground">Degradado</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

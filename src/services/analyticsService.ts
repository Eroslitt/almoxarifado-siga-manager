
import { advancedCacheService } from './advancedCacheService';
import { BlueprintLiveStatus } from '@/types/sgf-blueprint';

interface ToolUsageMetrics {
  toolId: string;
  toolName: string;
  totalUsageHours: number;
  usageCount: number;
  averageUsageTime: number;
  lastUsed: string;
  mostFrequentUser: string;
  utilizationRate: number;
}

interface PeriodMetrics {
  period: string;
  totalCheckouts: number;
  totalCheckins: number;
  activeTools: number;
  utilizationRate: number;
  topTools: Array<{
    name: string;
    usage: number;
  }>;
}

interface MaintenanceMetrics {
  scheduled: number;
  overdue: number;
  completed: number;
  averageCost: number;
  nextDue: Array<{
    toolName: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

class AnalyticsService {
  async getToolUsageMetrics(): Promise<ToolUsageMetrics[]> {
    const cached = await advancedCacheService.get<ToolUsageMetrics[]>('usage-metrics');
    if (cached) return cached;

    // Mock analytics data
    const mockMetrics: ToolUsageMetrics[] = [
      {
        toolId: 'FER-08172',
        toolName: 'Furadeira de Impacto Makita',
        totalUsageHours: 156.5,
        usageCount: 42,
        averageUsageTime: 3.7,
        lastUsed: '2024-06-13T14:30:00Z',
        mostFrequentUser: 'João Silva',
        utilizationRate: 78.2
      },
      {
        toolId: 'FER-03945',
        toolName: 'Chave de Fenda Philips 6mm',
        totalUsageHours: 89.3,
        usageCount: 67,
        averageUsageTime: 1.3,
        lastUsed: '2024-06-13T16:45:00Z',
        mostFrequentUser: 'Maria Santos',
        utilizationRate: 44.6
      },
      {
        toolId: 'FER-09876',
        toolName: 'Serra Circular Bosch',
        totalUsageHours: 203.8,
        usageCount: 28,
        averageUsageTime: 7.3,
        lastUsed: '2024-06-12T11:20:00Z',
        mostFrequentUser: 'Pedro Costa',
        utilizationRate: 85.9
      }
    ];

    await advancedCacheService.set('usage-metrics', mockMetrics, 1800); // 30 min cache
    return mockMetrics;
  }

  async getPeriodMetrics(period: 'daily' | 'weekly' | 'monthly'): Promise<PeriodMetrics[]> {
    const cacheKey = `period-metrics-${period}`;
    const cached = await advancedCacheService.get<PeriodMetrics[]>(cacheKey);
    if (cached) return cached;

    // Generate mock period data
    const mockData: PeriodMetrics[] = [];
    const periodsCount = period === 'daily' ? 7 : period === 'weekly' ? 4 : 12;

    for (let i = periodsCount - 1; i >= 0; i--) {
      const date = new Date();
      if (period === 'daily') date.setDate(date.getDate() - i);
      else if (period === 'weekly') date.setDate(date.getDate() - (i * 7));
      else date.setMonth(date.getMonth() - i);

      mockData.push({
        period: date.toISOString().split('T')[0],
        totalCheckouts: Math.floor(Math.random() * 50) + 20,
        totalCheckins: Math.floor(Math.random() * 45) + 18,
        activeTools: Math.floor(Math.random() * 30) + 10,
        utilizationRate: Math.random() * 40 + 60, // 60-100%
        topTools: [
          { name: 'Furadeira de Impacto', usage: Math.floor(Math.random() * 20) + 10 },
          { name: 'Chave de Fenda', usage: Math.floor(Math.random() * 15) + 8 },
          { name: 'Serra Circular', usage: Math.floor(Math.random() * 12) + 5 }
        ]
      });
    }

    await advancedCacheService.set(cacheKey, mockData, 900); // 15 min cache
    return mockData;
  }

  async getMaintenanceMetrics(): Promise<MaintenanceMetrics> {
    const cached = await advancedCacheService.get<MaintenanceMetrics>('maintenance-metrics');
    if (cached) return cached;

    const mockMetrics: MaintenanceMetrics = {
      scheduled: 12,
      overdue: 3,
      completed: 45,
      averageCost: 125.50,
      nextDue: [
        {
          toolName: 'Furadeira de Impacto Makita',
          dueDate: '2024-06-20',
          priority: 'high'
        },
        {
          toolName: 'Serra Circular Bosch',
          dueDate: '2024-06-25',
          priority: 'medium'
        },
        {
          toolName: 'Esmerilhadeira Dewalt',
          dueDate: '2024-07-02',
          priority: 'low'
        }
      ]
    };

    await advancedCacheService.set('maintenance-metrics', mockMetrics, 3600); // 1 hour cache
    return mockMetrics;
  }

  async generateReport(type: 'usage' | 'maintenance' | 'efficiency', format: 'pdf' | 'excel'): Promise<Blob> {
    console.log(`📊 Generating ${type} report in ${format} format...`);
    
    // Mock report generation
    const reportData = type === 'usage' 
      ? await this.getToolUsageMetrics()
      : type === 'maintenance'
      ? await this.getMaintenanceMetrics()
      : await this.getPeriodMetrics('monthly');

    // In a real implementation, this would generate actual PDF/Excel files
    const mockContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([mockContent], { 
      type: format === 'pdf' ? 'application/pdf' : 'application/vnd.ms-excel' 
    });

    // Cache the generated report
    await advancedCacheService.set(`report-${type}-${format}`, blob, 600); // 10 min cache
    
    return blob;
  }

  async detectAnomalies(): Promise<Array<{
    type: 'unusual_usage' | 'extended_possession' | 'maintenance_overdue';
    severity: 'low' | 'medium' | 'high';
    description: string;
    toolId?: string;
    recommendation: string;
  }>> {
    const metrics = await this.getToolUsageMetrics();
    const anomalies = [];

    // Detect unusual usage patterns
    for (const metric of metrics) {
      if (metric.utilizationRate > 95) {
        anomalies.push({
          type: 'unusual_usage' as const,
          severity: 'high' as const,
          description: `${metric.toolName} tem utilização excessiva (${metric.utilizationRate}%)`,
          toolId: metric.toolId,
          recommendation: 'Considere adquirir ferramentas adicionais ou revisar cronograma'
        });
      }

      if (metric.averageUsageTime > 8) {
        anomalies.push({
          type: 'extended_possession' as const,
          severity: 'medium' as const,
          description: `${metric.toolName} tem tempo médio de posse elevado (${metric.averageUsageTime}h)`,
          toolId: metric.toolId,
          recommendation: 'Verificar se a ferramenta está sendo devolvida adequadamente'
        });
      }
    }

    return anomalies;
  }

  async getUtilizationTrends(): Promise<Array<{
    date: string;
    utilization: number;
    trend: 'up' | 'down' | 'stable';
  }>> {
    const cached = await advancedCacheService.get<Array<{
      date: string;
      utilization: number;
      trend: 'up' | 'down' | 'stable';
    }>>('utilization-trends');
    
    if (cached && Array.isArray(cached)) return cached;

    // Generate trend data for the last 30 days
    const trends = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const baseUtilization = 70;
      const variation = Math.sin(i / 7) * 10 + Math.random() * 10;
      const utilization = Math.max(0, Math.min(100, baseUtilization + variation));
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (trends.length > 0) {
        const previousUtilization = trends[trends.length - 1].utilization;
        if (utilization > previousUtilization + 2) trend = 'up';
        else if (utilization < previousUtilization - 2) trend = 'down';
      }
      
      trends.push({
        date: date.toISOString().split('T')[0],
        utilization: Math.round(utilization * 100) / 100,
        trend
      });
    }

    await advancedCacheService.set('utilization-trends', trends, 3600);
    return trends;
  }
}

export const analyticsService = new AnalyticsService();

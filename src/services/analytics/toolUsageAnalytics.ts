
import { advancedCacheService } from '../advancedCacheService';

export interface ToolUsageMetrics {
  toolId: string;
  toolName: string;
  totalUsageHours: number;
  usageCount: number;
  averageUsageTime: number;
  lastUsed: string;
  mostFrequentUser: string;
  utilizationRate: number;
}

export class ToolUsageAnalytics {
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

export const toolUsageAnalytics = new ToolUsageAnalytics();

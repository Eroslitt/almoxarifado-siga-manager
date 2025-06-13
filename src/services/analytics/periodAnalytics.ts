
import { advancedCacheService } from '../advancedCacheService';

export interface PeriodMetrics {
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

export class PeriodAnalytics {
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
}

export const periodAnalytics = new PeriodAnalytics();

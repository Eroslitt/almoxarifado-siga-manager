
import { masterDataApi } from './masterDataApi';

interface AnalyticsData {
  totalSKUs: number;
  activeSuppliers: number;
  totalLocations: number;
  lowStockItems: number;
  categories: number;
  recentMovements: number;
  utilizationRate: number;
  topCategories: Array<{ name: string; count: number; percentage: number }>;
  supplierPerformance: Array<{ name: string; activeSKUs: number; rating: number }>;
  locationUtilization: Array<{ code: string; utilization: number; capacity: number }>;
  stockTrends: Array<{ date: string; value: number; change: number }>;
  abcDistribution: { A: number; B: number; C: number };
  insights: string[];
}

class MasterDataAnalyticsService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async getComprehensiveAnalytics(): Promise<AnalyticsData> {
    const cacheKey = 'comprehensive-analytics';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Return demo data for now
      const demoData = this.getDemoAnalytics();
      this.setCachedData(cacheKey, demoData);
      return demoData;
    } catch (error) {
      console.error('Error loading analytics, using demo data:', error);
      const demoData = this.getDemoAnalytics();
      this.setCachedData(cacheKey, demoData);
      return demoData;
    }
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getDemoAnalytics(): AnalyticsData {
    return {
      totalSKUs: 2847,
      activeSuppliers: 156,
      totalLocations: 1247,
      lowStockItems: 23,
      categories: 45,
      recentMovements: 127,
      utilizationRate: 87.5,
      topCategories: [
        { name: 'Ferramentas', count: 1245, percentage: 43.7 },
        { name: 'Eletrônicos', count: 876, percentage: 30.8 },
        { name: 'EPI', count: 234, percentage: 8.2 },
        { name: 'Materiais', count: 492, percentage: 17.3 }
      ],
      supplierPerformance: [
        { name: 'Parafusos & Cia', activeSKUs: 145, rating: 4.8 },
        { name: 'TechParts', activeSKUs: 98, rating: 4.6 },
        { name: 'Segurança Total', activeSKUs: 67, rating: 4.9 }
      ],
      locationUtilization: [
        { code: 'A-01-01-A', utilization: 85.2, capacity: 1000 },
        { code: 'B-02-03-B', utilization: 92.1, capacity: 800 },
        { code: 'C-01-02-A', utilization: 78.5, capacity: 1200 }
      ],
      stockTrends: [
        { date: '2024-01-01', value: 1000, change: 0 },
        { date: '2024-01-02', value: 1050, change: 50 },
        { date: '2024-01-03', value: 980, change: -70 },
        { date: '2024-01-04', value: 1120, change: 140 }
      ],
      abcDistribution: { A: 245, B: 1234, C: 1368 },
      insights: [
        '✅ Sistema funcionando normalmente com dados de demonstração',
        '📊 Analytics baseados em dados simulados para desenvolvimento',
        '🔧 Configure a integração com Supabase para dados reais'
      ]
    };
  }

  async generateInsights(): Promise<string[]> {
    return [
      '✅ Sistema funcionando com dados de demonstração',
      '📊 Analytics baseados em dados simulados para desenvolvimento',
      '🔧 Configure a integração com Supabase para dados reais'
    ];
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const masterDataAnalytics = new MasterDataAnalyticsService();

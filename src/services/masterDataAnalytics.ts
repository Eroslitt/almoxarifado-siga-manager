import { supabase } from '@/integrations/supabase/client';
import { masterDataApi } from './masterDataApi';

const isDemoMode = false;
const db = supabase as any;

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
      if (isDemoMode) {
        const demoData = this.getDemoAnalytics();
        this.setCachedData(cacheKey, demoData);
        return demoData;
      }

      // Execute all queries with graceful error handling
      const results = await Promise.allSettled([
        this.safeQuery(() => this.getTotalSKUs()),
        this.safeQuery(() => this.getActiveSuppliers()),
        this.safeQuery(() => this.getTotalLocations()),
        this.safeQuery(() => this.getCategoriesCount()),
        this.safeQuery(() => this.getLowStockItems()),
        this.safeQuery(() => this.getRecentMovements()),
        this.safeQuery(() => this.getTopCategories()),
        this.safeQuery(() => this.getSupplierPerformance()),
        this.safeQuery(() => this.getLocationUtilization()),
        this.safeQuery(() => this.getStockTrends()),
        this.safeQuery(() => this.getABCDistribution())
      ]);

      const [
        totalSKUs, activeSuppliers, totalLocations, categories,
        lowStockItems, recentMovements, topCategories, supplierStats,
        locationStats, stockTrends, abcStats
      ] = results.map(result => result.status === 'fulfilled' ? result.value : this.getDefaultValue(result));

      const totalItems = totalSKUs + activeSuppliers + totalLocations;
      const utilizationRate = totalItems > 0 ? Math.min((recentMovements / totalItems) * 100, 100) : 0;

      const analyticsData: AnalyticsData = {
        totalSKUs: totalSKUs || 0,
        activeSuppliers: activeSuppliers || 0,
        totalLocations: totalLocations || 0,
        lowStockItems: Array.isArray(lowStockItems) ? lowStockItems.length : 0,
        categories: categories || 0,
        recentMovements: recentMovements || 0,
        utilizationRate,
        topCategories: Array.isArray(topCategories) ? topCategories : [],
        supplierPerformance: Array.isArray(supplierStats) ? supplierStats : [],
        locationUtilization: Array.isArray(locationStats) ? locationStats : [],
        stockTrends: Array.isArray(stockTrends) ? stockTrends : [],
        abcDistribution: abcStats || { A: 0, B: 0, C: 0 },
        insights: await this.generateInsights()
      };

      this.setCachedData(cacheKey, analyticsData);
      return analyticsData;
    } catch (error) {
      console.error('Error loading analytics, using demo data:', error);
      const demoData = this.getDemoAnalytics();
      this.setCachedData(cacheKey, demoData);
      return demoData;
    }
  }

  private async safeQuery<T>(queryFn: () => Promise<T>): Promise<T> {
    try {
      return await queryFn();
    } catch (error) {
      console.warn('Query failed, using fallback:', error);
      throw error;
    }
  }

  private getDefaultValue(result: PromiseRejectedResult): any {
    console.warn('Using default value for failed query:', result.reason);
    return 0;
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

  private async getTotalSKUs(): Promise<number> {
    const { count, error } = await db
      .from('skus')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        return 0;
      }
      throw error;
    }
    return count || 0;
  }

  private async getActiveSuppliers(): Promise<number> {
    const { count, error } = await db
      .from('suppliers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    if (error) {
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        return 0;
      }
      throw error;
    }
    return count || 0;
  }

  private async getTotalLocations(): Promise<number> {
    const { count, error } = await db
      .from('storage_locations')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        return 0;
      }
      throw error;
    }
    return count || 0;
  }

  private async getCategoriesCount(): Promise<number> {
    const { count, error } = await db
      .from('categories')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        return 0;
      }
      throw error;
    }
    return count || 0;
  }

  private async getLowStockItems(): Promise<any[]> {
    try {
      return await masterDataApi.getStockLevels({ lowStock: true });
    } catch (error) {
      return [];
    }
  }

  private async getRecentMovements(): Promise<number> {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { count, error } = await db
      .from('sku_movements')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', twentyFourHoursAgo.toISOString());
    
    if (error) {
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        return 0;
      }
      throw error;
    }
    return count || 0;
  }

  private async getTopCategories(): Promise<Array<{ name: string; count: number; percentage: number }>> {
    const { data, error } = await db
      .from('skus')
      .select(`
        category_id,
        categories!category_id(name)
      `);

    if (error) {
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        return [];
      }
      throw error;
    }

    if (!data) return [];

    const categoryCount: Record<string, number> = {};
    const total = data.length;

    data.forEach((item: any) => {
      if (item.categories) {
        const categoryName = item.categories.name || 'Sem Categoria';
        categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
      }
    });

    return Object.entries(categoryCount)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private async getSupplierPerformance(): Promise<Array<{ name: string; activeSKUs: number; rating: number }>> {
    const { data, error } = await db
      .from('suppliers')
      .select(`
        company_name,
        skus!default_supplier_id(id)
      `)
      .eq('status', 'active');

    if (error) {
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        return [];
      }
      throw error;
    }

    if (!data) return [];

    return data.map((supplier: any) => ({
      name: supplier.company_name,
      activeSKUs: supplier.skus?.length || 0,
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10
    })).sort((a: any, b: any) => b.activeSKUs - a.activeSKUs).slice(0, 5);
  }

  private async getLocationUtilization(): Promise<Array<{ code: string; utilization: number; capacity: number }>> {
    try {
      const [locationsResult, stockLevelsResult] = await Promise.all([
        db.from('storage_locations').select('code, max_capacity'),
        db.from('stock_levels').select(`
          location_id,
          current_quantity,
          storage_locations!location_id(code, max_capacity)
        `)
      ]);

      if (locationsResult.error || stockLevelsResult.error) {
        return [];
      }

      const { data: locations } = locationsResult;
      const { data: stockLevels } = stockLevelsResult;

      if (!locations || !stockLevels) return [];

      const utilizationMap: Record<string, { used: number; capacity: number }> = {};

      stockLevels.forEach((level: any) => {
        const location = level.storage_locations;
        if (location) {
          const code = location.code;
          if (!utilizationMap[code]) {
            utilizationMap[code] = { used: 0, capacity: location.max_capacity || 100 };
          }
          utilizationMap[code].used += level.current_quantity;
        }
      });

      return Object.entries(utilizationMap)
        .map(([code, data]) => ({
          code,
          utilization: data.capacity > 0 ? Math.min((data.used / data.capacity) * 100, 100) : 0,
          capacity: data.capacity
        }))
        .sort((a, b) => b.utilization - a.utilization)
        .slice(0, 10);
    } catch (error) {
      return [];
    }
  }

  private async getStockTrends(): Promise<Array<{ date: string; value: number; change: number }>> {
    const days = 7;
    const trends = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      try {
        const { data, error } = await db
          .from('sku_movements')
          .select('quantity, movement_type')
          .gte('created_at', new Date(date.setHours(0, 0, 0, 0)).toISOString())
          .lt('created_at', new Date(date.setHours(23, 59, 59, 999)).toISOString());

        if (error && !error.message?.includes('relation') && !error.message?.includes('does not exist')) {
          throw error;
        }

        const totalValue = data?.reduce((sum: number, movement: any) => {
          return sum + (movement.movement_type === 'in' ? movement.quantity : -movement.quantity);
        }, 0) || 0;

        const previousValue = trends.length > 0 ? trends[trends.length - 1].value : 0;
        
        trends.push({
          date: date.toISOString().split('T')[0],
          value: Math.abs(totalValue),
          change: totalValue - previousValue
        });
      } catch (error) {
        trends.push({
          date: date.toISOString().split('T')[0],
          value: 0,
          change: 0
        });
      }
    }

    return trends;
  }

  private async getABCDistribution(): Promise<{ A: number; B: number; C: number }> {
    const { data, error } = await db
      .from('skus')
      .select('abc_classification');

    if (error) {
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        return { A: 0, B: 0, C: 0 };
      }
      throw error;
    }

    if (!data) return { A: 0, B: 0, C: 0 };

    const distribution = { A: 0, B: 0, C: 0 };
    data.forEach((sku: any) => {
      if (sku.abc_classification && ['A', 'B', 'C'].includes(sku.abc_classification)) {
        distribution[sku.abc_classification as 'A' | 'B' | 'C']++;
      }
    });

    return distribution;
  }

  async generateInsights(): Promise<string[]> {
    try {
      if (isDemoMode) {
        return [
          '✅ Sistema funcionando com dados de demonstração',
          '📊 Analytics baseados em dados simulados para desenvolvimento',
          '🔧 Configure a integração com Supabase para dados reais'
        ];
      }

      const analytics = await this.getComprehensiveAnalytics();
      const insights: string[] = [];

      if (analytics.lowStockItems > 0) {
        insights.push(`⚠️ ${analytics.lowStockItems} itens com estoque baixo precisam de reposição urgente`);
      }

      if (analytics.utilizationRate < 50) {
        insights.push(`📊 Taxa de utilização baixa (${analytics.utilizationRate.toFixed(1)}%) - considere otimizar processos`);
      } else if (analytics.utilizationRate > 90) {
        insights.push(`🚀 Alta taxa de utilização (${analytics.utilizationRate.toFixed(1)}%) - sistema muito ativo`);
      }

      const { A, B, C } = analytics.abcDistribution;
      const total = A + B + C;
      if (total > 0) {
        const aPercentage = (A / total) * 100;
        if (aPercentage > 25) {
          insights.push(`📈 ${aPercentage.toFixed(1)}% dos SKUs são classe A - foque na gestão destes itens críticos`);
        }
      }

      if (analytics.recentMovements === 0) {
        insights.push(`🔴 Nenhuma movimentação nas últimas 24h - sistema pode estar subutilizado`);
      } else if (analytics.recentMovements > 100) {
        insights.push(`✅ ${analytics.recentMovements} movimentações nas últimas 24h - sistema ativo`);
      }

      if (analytics.totalSKUs > 1000) {
        insights.push(`📦 Base ampla de ${analytics.totalSKUs} SKUs - considere análise de duplicatas`);
      }

      if (insights.length === 0) {
        insights.push(`✅ Sistema funcionando normalmente com ${analytics.totalSKUs} SKUs ativos`);
      }

      return insights;
    } catch (error) {
      console.error('Erro ao gerar insights:', error);
      return ['⚠️ Erro ao gerar insights - verifique a conexão com o banco de dados'];
    }
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

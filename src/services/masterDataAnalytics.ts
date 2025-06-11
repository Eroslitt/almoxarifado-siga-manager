
import { supabase, isDemoMode } from '@/lib/supabase';
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
}

class MasterDataAnalyticsService {
  async getComprehensiveAnalytics(): Promise<AnalyticsData> {
    try {
      if (isDemoMode) {
        return this.getDemoAnalytics();
      }

      const [
        skusResult,
        suppliersResult,
        locationsResult,
        categoriesResult,
        lowStockItems,
        movementsResult,
        topCategories,
        supplierStats,
        locationStats,
        stockTrends,
        abcStats
      ] = await Promise.allSettled([
        this.getTotalSKUs(),
        this.getActiveSuppliers(),
        this.getTotalLocations(),
        this.getCategoriesCount(),
        this.getLowStockItems(),
        this.getRecentMovements(),
        this.getTopCategories(),
        this.getSupplierPerformance(),
        this.getLocationUtilization(),
        this.getStockTrends(),
        this.getABCDistribution()
      ]);

      const getValue = (result: PromiseSettledResult<any>, defaultValue: any) => {
        return result.status === 'fulfilled' ? result.value : defaultValue;
      };

      const totalItems = getValue(skusResult, 0) + getValue(suppliersResult, 0) + getValue(locationsResult, 0);
      const movements = getValue(movementsResult, 0);
      const utilizationRate = totalItems > 0 ? (movements / totalItems) * 100 : 0;

      return {
        totalSKUs: getValue(skusResult, 0),
        activeSuppliers: getValue(suppliersResult, 0),
        totalLocations: getValue(locationsResult, 0),
        lowStockItems: Array.isArray(getValue(lowStockItems, [])) ? getValue(lowStockItems, []).length : 0,
        categories: getValue(categoriesResult, 0),
        recentMovements: movements,
        utilizationRate,
        topCategories: getValue(topCategories, []),
        supplierPerformance: getValue(supplierStats, []),
        locationUtilization: getValue(locationStats, []),
        stockTrends: getValue(stockTrends, []),
        abcDistribution: getValue(abcStats, { A: 0, B: 0, C: 0 })
      };
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      return this.getDemoAnalytics();
    }
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
      abcDistribution: { A: 245, B: 1234, C: 1368 }
    };
  }

  private async getTotalSKUs(): Promise<number> {
    const { count, error } = await supabase
      .from('skus')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count || 0;
  }

  private async getActiveSuppliers(): Promise<number> {
    const { count, error } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    if (error) throw error;
    return count || 0;
  }

  private async getTotalLocations(): Promise<number> {
    const { count, error } = await supabase
      .from('storage_locations')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count || 0;
  }

  private async getCategoriesCount(): Promise<number> {
    const { count, error } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
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

    const { count, error } = await supabase
      .from('sku_movements')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', twentyFourHoursAgo.toISOString());
    
    if (error) throw error;
    return count || 0;
  }

  private async getTopCategories(): Promise<Array<{ name: string; count: number; percentage: number }>> {
    const { data, error } = await supabase
      .from('skus')
      .select(`
        category_id,
        categories!category_id(name)
      `);

    if (error || !data) return [];

    const categoryCount: Record<string, number> = {};
    const total = data.length;

    data.forEach(item => {
      if (item.categories) {
        const categoryName = (item.categories as any).name;
        categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
      }
    });

    return Object.entries(categoryCount)
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / total) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private async getSupplierPerformance(): Promise<Array<{ name: string; activeSKUs: number; rating: number }>> {
    const { data, error } = await supabase
      .from('suppliers')
      .select(`
        company_name,
        skus!default_supplier_id(id)
      `)
      .eq('status', 'active');

    if (error || !data) return [];

    return data.map(supplier => ({
      name: supplier.company_name,
      activeSKUs: (supplier.skus as any[])?.length || 0,
      rating: Math.random() * 2 + 3
    })).sort((a, b) => b.activeSKUs - a.activeSKUs).slice(0, 5);
  }

  private async getLocationUtilization(): Promise<Array<{ code: string; utilization: number; capacity: number }>> {
    const { data: locations, error: locError } = await supabase
      .from('storage_locations')
      .select('code, max_capacity');

    const { data: stockLevels, error: stockError } = await supabase
      .from('stock_levels')
      .select(`
        location_id,
        current_quantity,
        storage_locations!location_id(code, max_capacity)
      `);

    if (locError || stockError || !locations || !stockLevels) return [];

    const utilizationMap: Record<string, { used: number; capacity: number }> = {};

    stockLevels.forEach(level => {
      const location = level.storage_locations as any;
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
        utilization: (data.used / data.capacity) * 100,
        capacity: data.capacity
      }))
      .sort((a, b) => b.utilization - a.utilization);
  }

  private async getStockTrends(): Promise<Array<{ date: string; value: number; change: number }>> {
    const days = 7;
    const trends = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      try {
        const { data, error } = await supabase
          .from('sku_movements')
          .select('quantity, movement_type')
          .gte('created_at', new Date(date.setHours(0, 0, 0, 0)).toISOString())
          .lt('created_at', new Date(date.setHours(23, 59, 59, 999)).toISOString());

        if (error) throw error;

        const totalValue = data?.reduce((sum, movement) => {
          return sum + (movement.movement_type === 'in' ? movement.quantity : -movement.quantity);
        }, 0) || 0;

        trends.push({
          date: date.toISOString().split('T')[0],
          value: totalValue,
          change: i === days - 1 ? 0 : totalValue - (trends[trends.length - 1]?.value || 0)
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
    const { data, error } = await supabase
      .from('skus')
      .select('abc_classification');

    if (error || !data) return { A: 0, B: 0, C: 0 };

    const distribution = { A: 0, B: 0, C: 0 };
    data.forEach(sku => {
      if (sku.abc_classification) {
        distribution[sku.abc_classification as 'A' | 'B' | 'C']++;
      }
    });

    return distribution;
  }

  async generateInsights(): Promise<string[]> {
    try {
      const analytics = await this.getComprehensiveAnalytics();
      const insights: string[] = [];

      if (analytics.lowStockItems > 0) {
        insights.push(`⚠️ ${analytics.lowStockItems} itens com estoque baixo precisam de reposição urgente`);
      }

      if (analytics.utilizationRate < 50) {
        insights.push(`📊 Taxa de utilização baixa (${analytics.utilizationRate.toFixed(1)}%) - considere otimizar processos`);
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
}

export const masterDataAnalytics = new MasterDataAnalyticsService();

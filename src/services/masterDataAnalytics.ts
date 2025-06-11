
import { supabase } from '@/lib/supabase';
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
    ] = await Promise.all([
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

    const totalItems = skusResult + suppliersResult + locationsResult;
    const utilizationRate = totalItems > 0 ? (movementsResult / totalItems) * 100 : 0;

    return {
      totalSKUs: skusResult,
      activeSuppliers: suppliersResult,
      totalLocations: locationsResult,
      lowStockItems: lowStockItems.length,
      categories: categoriesResult,
      recentMovements: movementsResult,
      utilizationRate,
      topCategories,
      supplierPerformance: supplierStats,
      locationUtilization: locationStats,
      stockTrends,
      abcDistribution: abcStats
    };
  }

  private async getTotalSKUs(): Promise<number> {
    const { count } = await supabase
      .from('skus')
      .select('*', { count: 'exact', head: true });
    return count || 0;
  }

  private async getActiveSuppliers(): Promise<number> {
    const { count } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    return count || 0;
  }

  private async getTotalLocations(): Promise<number> {
    const { count } = await supabase
      .from('storage_locations')
      .select('*', { count: 'exact', head: true });
    return count || 0;
  }

  private async getCategoriesCount(): Promise<number> {
    const { count } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
    return count || 0;
  }

  private async getLowStockItems(): Promise<any[]> {
    return await masterDataApi.getStockLevels({ lowStock: true });
  }

  private async getRecentMovements(): Promise<number> {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { count } = await supabase
      .from('sku_movements')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', twentyFourHoursAgo.toISOString());
    
    return count || 0;
  }

  private async getTopCategories(): Promise<Array<{ name: string; count: number; percentage: number }>> {
    const { data } = await supabase
      .from('skus')
      .select(`
        category_id,
        categories!category_id(name)
      `);

    if (!data) return [];

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
    const { data } = await supabase
      .from('suppliers')
      .select(`
        company_name,
        skus!default_supplier_id(id)
      `)
      .eq('status', 'active');

    if (!data) return [];

    return data.map(supplier => ({
      name: supplier.company_name,
      activeSKUs: (supplier.skus as any[])?.length || 0,
      rating: Math.random() * 2 + 3 // Mock rating between 3-5
    })).sort((a, b) => b.activeSKUs - a.activeSKUs).slice(0, 5);
  }

  private async getLocationUtilization(): Promise<Array<{ code: string; utilization: number; capacity: number }>> {
    const { data: locations } = await supabase
      .from('storage_locations')
      .select('code, max_capacity');

    const { data: stockLevels } = await supabase
      .from('stock_levels')
      .select(`
        location_id,
        current_quantity,
        storage_locations!location_id(code, max_capacity)
      `);

    if (!locations || !stockLevels) return [];

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
      
      const { data } = await supabase
        .from('sku_movements')
        .select('quantity, movement_type')
        .gte('created_at', new Date(date.setHours(0, 0, 0, 0)).toISOString())
        .lt('created_at', new Date(date.setHours(23, 59, 59, 999)).toISOString());

      const totalValue = data?.reduce((sum, movement) => {
        return sum + (movement.movement_type === 'in' ? movement.quantity : -movement.quantity);
      }, 0) || 0;

      trends.push({
        date: date.toISOString().split('T')[0],
        value: totalValue,
        change: i === days - 1 ? 0 : totalValue - (trends[trends.length - 1]?.value || 0)
      });
    }

    return trends;
  }

  private async getABCDistribution(): Promise<{ A: number; B: number; C: number }> {
    const { data } = await supabase
      .from('skus')
      .select('abc_classification');

    if (!data) return { A: 0, B: 0, C: 0 };

    const distribution = { A: 0, B: 0, C: 0 };
    data.forEach(sku => {
      if (sku.abc_classification) {
        distribution[sku.abc_classification as 'A' | 'B' | 'C']++;
      }
    });

    return distribution;
  }

  async generateInsights(): Promise<string[]> {
    const analytics = await this.getComprehensiveAnalytics();
    const insights: string[] = [];

    // Low stock insights
    if (analytics.lowStockItems > 0) {
      insights.push(`⚠️ ${analytics.lowStockItems} itens com estoque baixo precisam de reposição urgente`);
    }

    // Utilization insights
    if (analytics.utilizationRate < 50) {
      insights.push(`📊 Taxa de utilização baixa (${analytics.utilizationRate.toFixed(1)}%) - considere otimizar processos`);
    }

    // ABC distribution insights
    const { A, B, C } = analytics.abcDistribution;
    const total = A + B + C;
    if (total > 0) {
      const aPercentage = (A / total) * 100;
      if (aPercentage > 25) {
        insights.push(`📈 ${aPercentage.toFixed(1)}% dos SKUs são classe A - foque na gestão destes itens críticos`);
      }
    }

    // Recent activity insights
    if (analytics.recentMovements === 0) {
      insights.push(`🔴 Nenhuma movimentação nas últimas 24h - sistema pode estar subutilizado`);
    }

    return insights;
  }
}

export const masterDataAnalytics = new MasterDataAnalyticsService();

import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  code: string;
  status: 'active' | 'inactive';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  company_name: string;
  trade_name?: string;
  cnpj: string;
  ie?: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    zip_code: string;
  };
  contact_info: {
    phone: string;
    email: string;
    contact_person?: string;
  };
  payment_terms?: string;
  lead_time_days: number;
  rating: number;
  status: 'active' | 'inactive' | 'blocked';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface StorageLocation {
  id: string;
  code: string;
  description?: string;
  street: string;
  shelf: string;
  level: string;
  position: string;
  capacity?: number;
  restrictions?: string[];
  zone_type: 'picking' | 'storage' | 'staging' | 'quarantine';
  status: 'available' | 'occupied' | 'blocked' | 'maintenance';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface StockLevel {
  id: string;
  sku_id: string;
  location_id: string;
  current_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  last_movement_date?: string;
  last_count_date?: string;
  user_id: string;
  updated_at: string;
}

export class MasterDataService {
  // CATEGORIAS
  static async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return (data || []) as Category[];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }

  static async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Category | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...category,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data as Category;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      return null;
    }
  }

  // FORNECEDORES
  static async getSuppliers(): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('company_name');

      if (error) throw error;
      return (data || []) as Supplier[];
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      return [];
    }
  }

  static async createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Supplier | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          ...supplier,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data as Supplier;
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      return null;
    }
  }

  // LOCALIZAÇÕES DE ARMAZENAMENTO
  static async getStorageLocations(): Promise<StorageLocation[]> {
    try {
      const { data, error } = await supabase
        .from('storage_locations')
        .select('*')
        .order('code');

      if (error) throw error;
      return (data || []) as StorageLocation[];
    } catch (error) {
      console.error('Erro ao buscar localizações:', error);
      return [];
    }
  }

  static async createStorageLocation(location: Omit<StorageLocation, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<StorageLocation | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('storage_locations')
        .insert({
          ...location,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data as StorageLocation;
    } catch (error) {
      console.error('Erro ao criar localização:', error);
      return null;
    }
  }

  // NÍVEIS DE ESTOQUE
  static async getStockLevels(): Promise<StockLevel[]> {
    try {
      const { data, error } = await supabase
        .from('stock_levels')
        .select(`
          *,
          skus (sku_code, name, description, min_stock, max_stock),
          storage_locations (code, description)
        `);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar níveis de estoque:', error);
      return [];
    }
  }

  static async updateStockLevel(skuId: string, locationId: string, quantity: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('stock_levels')
        .upsert({
          sku_id: skuId,
          location_id: locationId,
          current_quantity: quantity,
          last_movement_date: new Date().toISOString(),
          user_id: user.id
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar nível de estoque:', error);
      return false;
    }
  }

  // ANALYTICS DO ESTOQUE
  static async getStockAnalytics() {
    try {
      // Total de SKUs
      const { count: totalSkus } = await supabase
        .from('skus')
        .select('*', { count: 'exact', head: true });

      // SKUs com estoque baixo
      const { data: lowStockSkus } = await supabase
        .from('stock_levels')
        .select(`
          current_quantity,
          skus!inner (min_stock)
        `)
        .filter('current_quantity', 'lt', 'skus.min_stock');

      // Fornecedores ativos
      const { count: activeSuppliers } = await supabase
        .from('suppliers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Localizações disponíveis
      const { count: availableLocations } = await supabase
        .from('storage_locations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available');

      // Movimentações recentes (últimas 24h)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: recentMovements } = await supabase
        .from('stock_movements')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneDayAgo);

      return {
        totalSkus: totalSkus || 0,
        lowStockCount: lowStockSkus?.length || 0,
        activeSuppliers: activeSuppliers || 0,
        availableLocations: availableLocations || 0,
        recentMovements: recentMovements || 0
      };
    } catch (error) {
      console.error('Erro ao obter analytics:', error);
      return {
        totalSkus: 0,
        lowStockCount: 0,
        activeSuppliers: 0,
        availableLocations: 0,
        recentMovements: 0
      };
    }
  }

  // VALIDAÇÃO DE CNPJ
  static validateCNPJ(cnpj: string): boolean {
    cnpj = cnpj.replace(/\D/g, '');
    
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const calc1 = cnpj.slice(0, 12).split('').reduce((sum, digit, i) => sum + parseInt(digit) * weights1[i], 0);
    const digit1 = calc1 % 11 < 2 ? 0 : 11 - (calc1 % 11);

    const calc2 = cnpj.slice(0, 13).split('').reduce((sum, digit, i) => sum + parseInt(digit) * weights2[i], 0);
    const digit2 = calc2 % 11 < 2 ? 0 : 11 - (calc2 % 11);

    return parseInt(cnpj[12]) === digit1 && parseInt(cnpj[13]) === digit2;
  }

  // GERAÇÃO DE CÓDIGO DE LOCALIZAÇÃO
  static generateLocationCode(street: string, shelf: string, level: string, position: string): string {
    return `${street}-${shelf.padStart(2, '0')}-${level.padStart(2, '0')}-${position}`;
  }
}

// Instância exportada
export const masterDataService = new MasterDataService();
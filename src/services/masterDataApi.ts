import { supabase } from '@/integrations/supabase/client';
import { SKU, Supplier, StorageLocation, Category, SKUMovement, StockLevel } from '@/types/masterData';

const db = supabase as any;
class MasterDataApiService {
  // SKU Management
  async createSKU(sku: Omit<SKU, 'id' | 'created_at' | 'updated_at'>): Promise<SKU> {
    // Validate unique SKU code
    const { data: existing } = await supabase
      .from('skus')
      .select('id')
      .eq('sku_code', sku.sku_code)
      .single();

    if (existing) {
      throw new Error(`SKU code ${sku.sku_code} already exists`);
    }

    const { data, error } = await supabase
      .from('skus')
      .insert({
        ...sku,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSKUs(filters?: { 
    category?: string; 
    status?: string; 
    search?: string;
    classification?: 'A' | 'B' | 'C';
  }): Promise<SKU[]> {
    let query = supabase
      .from('skus')
      .select(`
        *,
        categories!category_id(name),
        suppliers!default_supplier_id(company_name)
      `)
      .order('sku_code');

    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.classification) {
      query = query.eq('abc_classification', filters.classification);
    }

    if (filters?.search) {
      query = query.or(`sku_code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async updateSKU(id: string, updates: Partial<SKU>): Promise<SKU> {
    const { data, error } = await supabase
      .from('skus')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSKU(id: string): Promise<void> {
    // Check if SKU has movements
    const { data: movements } = await supabase
      .from('sku_movements')
      .select('id')
      .eq('sku_id', id)
      .limit(1);

    if (movements && movements.length > 0) {
      throw new Error('Cannot delete SKU with existing movements. Set status to inactive instead.');
    }

    const { error } = await supabase
      .from('skus')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Supplier Management
  async createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    // Validate unique CNPJ
    const { data: existing } = await supabase
      .from('suppliers')
      .select('id')
      .eq('cnpj', supplier.cnpj)
      .single();

    if (existing) {
      throw new Error(`CNPJ ${supplier.cnpj} already exists`);
    }

    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        ...supplier,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSuppliers(filters?: { status?: string; search?: string }): Promise<Supplier[]> {
    let query = supabase
      .from('suppliers')
      .select('*')
      .order('company_name');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`company_name.ilike.%${filters.search}%,trade_name.ilike.%${filters.search}%,cnpj.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Storage Location Management
  async createStorageLocation(location: Omit<StorageLocation, 'id' | 'created_at' | 'updated_at'>): Promise<StorageLocation> {
    // Validate unique location code
    const { data: existing } = await supabase
      .from('storage_locations')
      .select('id')
      .eq('code', location.code)
      .single();

    if (existing) {
      throw new Error(`Location code ${location.code} already exists`);
    }

    const { data, error } = await supabase
      .from('storage_locations')
      .insert({
        ...location,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getStorageLocations(filters?: { 
    zone?: string; 
    status?: string; 
    street?: string;
  }): Promise<StorageLocation[]> {
    let query = supabase
      .from('storage_locations')
      .select('*')
      .order('code');

    if (filters?.zone) {
      query = query.eq('zone_type', filters.zone);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.street) {
      query = query.eq('street', filters.street);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Category Management
  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getCategories(includeSubcategories: boolean = true): Promise<Category[]> {
    let query = supabase
      .from('categories')
      .select('*')
      .order('name');

    if (!includeSubcategories) {
      query = query.is('parent_id', null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Stock Level Management
  async getStockLevels(filters?: { 
    skuId?: string; 
    locationId?: string;
    lowStock?: boolean;
  }): Promise<StockLevel[]> {
    let query = supabase
      .from('stock_levels')
      .select(`
        *,
        skus(sku_code, description, min_stock, max_stock),
        storage_locations(code, description)
      `);

    if (filters?.skuId) {
      query = query.eq('sku_id', filters.skuId);
    }

    if (filters?.locationId) {
      query = query.eq('location_id', filters.locationId);
    }

    const { data, error } = await query;
    if (error) throw error;

    let result = data || [];

    // Filter for low stock if requested
    if (filters?.lowStock) {
      result = result.filter(level => {
        const sku = level.skus;
        return sku && level.current_quantity <= sku.min_stock;
      });
    }

    return result;
  }

  // Movement Management
  async createMovement(movement: Omit<SKUMovement, 'id' | 'created_at'>): Promise<SKUMovement> {
    const { data, error } = await supabase
      .from('sku_movements')
      .insert({
        ...movement,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Update stock levels
    await this.updateStockLevel(movement.sku_id, movement.location_id, movement.quantity, movement.movement_type);

    return data;
  }

  private async updateStockLevel(
    skuId: string, 
    locationId: string, 
    quantity: number, 
    movementType: string
  ): Promise<void> {
    // Get current stock level
    const { data: currentLevel } = await supabase
      .from('stock_levels')
      .select('*')
      .eq('sku_id', skuId)
      .eq('location_id', locationId)
      .single();

    const quantityChange = movementType === 'in' ? quantity : -quantity;
    
    if (currentLevel) {
      // Update existing level
      const newQuantity = Math.max(0, currentLevel.current_quantity + quantityChange);
      await supabase
        .from('stock_levels')
        .update({
          current_quantity: newQuantity,
          available_quantity: newQuantity - currentLevel.reserved_quantity,
          last_movement_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentLevel.id);
    } else {
      // Create new stock level
      const newQuantity = Math.max(0, quantityChange);
      await supabase
        .from('stock_levels')
        .insert({
          sku_id: skuId,
          location_id: locationId,
          current_quantity: newQuantity,
          reserved_quantity: 0,
          available_quantity: newQuantity,
          last_movement_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
  }

  // Analytics
  async getStockAnalytics(): Promise<any> {
    const [skusResult, suppliersResult, locationsResult, lowStockResult] = await Promise.all([
      supabase.from('skus').select('id', { count: 'exact' }),
      supabase.from('suppliers').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('storage_locations').select('id', { count: 'exact' }),
      this.getStockLevels({ lowStock: true })
    ]);

    return {
      totalSKUs: skusResult.count || 0,
      activeSuppliers: suppliersResult.count || 0,
      totalLocations: locationsResult.count || 0,
      lowStockItems: lowStockResult.length
    };
  }

  // Validation helpers
  validateCNPJ(cnpj: string): boolean {
    // Basic CNPJ validation (simplified)
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    return cleanCNPJ.length === 14;
  }

  generateLocationCode(street: string, shelf: string, level: string, position: string): string {
    return `${street}-${shelf.padStart(2, '0')}-${level.padStart(2, '0')}-${position}`;
  }

  calculateABCClassification(annualValue: number, totalValue: number): 'A' | 'B' | 'C' {
    const percentage = (annualValue / totalValue) * 100;
    if (percentage >= 80) return 'A';
    if (percentage >= 15) return 'B';
    return 'C';
  }
}

export const masterDataApi = new MasterDataApiService();

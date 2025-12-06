
import { SKU, Supplier, StorageLocation, Category, SKUMovement, StockLevel } from '@/types/masterData';

// In-memory stores (will be replaced with real DB)
const skuStore: SKU[] = [];
const supplierStore: Supplier[] = [];
const locationStore: StorageLocation[] = [];
const categoryStore: Category[] = [];
const stockLevelStore: StockLevel[] = [];
const movementStore: SKUMovement[] = [];

class MasterDataApiService {
  // SKU Management
  async createSKU(sku: Omit<SKU, 'id' | 'created_at' | 'updated_at'>): Promise<SKU> {
    const existing = skuStore.find(s => s.sku_code === sku.sku_code);
    if (existing) {
      throw new Error(`SKU code ${sku.sku_code} already exists`);
    }

    const newSKU: SKU = {
      ...sku,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    skuStore.push(newSKU);
    return newSKU;
  }

  async getSKUs(filters?: { 
    category?: string; 
    status?: string; 
    search?: string;
    classification?: 'A' | 'B' | 'C';
  }): Promise<SKU[]> {
    let result = [...skuStore];

    if (filters?.category) {
      result = result.filter(s => s.category_id === filters.category);
    }
    if (filters?.status) {
      result = result.filter(s => s.status === filters.status);
    }
    if (filters?.classification) {
      result = result.filter(s => s.abc_classification === filters.classification);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(s => 
        s.sku_code.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }

  async updateSKU(id: string, updates: Partial<SKU>): Promise<SKU> {
    const index = skuStore.findIndex(s => s.id === id);
    if (index < 0) throw new Error('SKU not found');

    skuStore[index] = {
      ...skuStore[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return skuStore[index];
  }

  async deleteSKU(id: string): Promise<void> {
    const movements = movementStore.filter(m => m.sku_id === id);
    if (movements.length > 0) {
      throw new Error('Cannot delete SKU with existing movements. Set status to inactive instead.');
    }

    const index = skuStore.findIndex(s => s.id === id);
    if (index >= 0) {
      skuStore.splice(index, 1);
    }
  }

  // Supplier Management
  async createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    const existing = supplierStore.find(s => s.cnpj === supplier.cnpj);
    if (existing) {
      throw new Error(`CNPJ ${supplier.cnpj} already exists`);
    }

    const newSupplier: Supplier = {
      ...supplier,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    supplierStore.push(newSupplier);
    return newSupplier;
  }

  async getSuppliers(filters?: { status?: string; search?: string }): Promise<Supplier[]> {
    let result = [...supplierStore];

    if (filters?.status) {
      result = result.filter(s => s.status === filters.status);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(s => 
        s.company_name.toLowerCase().includes(searchLower) ||
        s.trade_name.toLowerCase().includes(searchLower) ||
        s.cnpj.includes(filters.search!)
      );
    }

    return result;
  }

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
    const index = supplierStore.findIndex(s => s.id === id);
    if (index < 0) throw new Error('Supplier not found');

    supplierStore[index] = {
      ...supplierStore[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return supplierStore[index];
  }

  // Storage Location Management
  async createStorageLocation(location: Omit<StorageLocation, 'id' | 'created_at' | 'updated_at'>): Promise<StorageLocation> {
    const existing = locationStore.find(l => l.code === location.code);
    if (existing) {
      throw new Error(`Location code ${location.code} already exists`);
    }

    const newLocation: StorageLocation = {
      ...location,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    locationStore.push(newLocation);
    return newLocation;
  }

  async getStorageLocations(filters?: { 
    zone?: string; 
    status?: string; 
    street?: string;
  }): Promise<StorageLocation[]> {
    let result = [...locationStore];

    if (filters?.zone) {
      result = result.filter(l => l.zone_type === filters.zone);
    }
    if (filters?.status) {
      result = result.filter(l => l.status === filters.status);
    }
    if (filters?.street) {
      result = result.filter(l => l.street === filters.street);
    }

    return result;
  }

  // Category Management
  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    categoryStore.push(newCategory);
    return newCategory;
  }

  async getCategories(includeSubcategories: boolean = true): Promise<Category[]> {
    if (!includeSubcategories) {
      return categoryStore.filter(c => !c.parent_id);
    }
    return [...categoryStore];
  }

  // Stock Level Management
  async getStockLevels(filters?: { 
    skuId?: string; 
    locationId?: string;
    lowStock?: boolean;
  }): Promise<StockLevel[]> {
    let result = [...stockLevelStore];

    if (filters?.skuId) {
      result = result.filter(l => l.sku_id === filters.skuId);
    }
    if (filters?.locationId) {
      result = result.filter(l => l.location_id === filters.locationId);
    }
    if (filters?.lowStock) {
      result = result.filter(level => {
        const sku = skuStore.find(s => s.id === level.sku_id);
        return sku && level.current_quantity <= sku.min_stock;
      });
    }

    return result;
  }

  // Movement Management
  async createMovement(movement: Omit<SKUMovement, 'id' | 'created_at'>): Promise<SKUMovement> {
    const newMovement: SKUMovement = {
      ...movement,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };

    movementStore.push(newMovement);

    // Update stock levels
    await this.updateStockLevel(movement.sku_id, movement.location_id, movement.quantity, movement.movement_type);

    return newMovement;
  }

  private async updateStockLevel(
    skuId: string, 
    locationId: string, 
    quantity: number, 
    movementType: string
  ): Promise<void> {
    const existingIndex = stockLevelStore.findIndex(
      l => l.sku_id === skuId && l.location_id === locationId
    );

    const quantityChange = movementType === 'in' ? quantity : -quantity;
    
    if (existingIndex >= 0) {
      const level = stockLevelStore[existingIndex];
      level.current_quantity = Math.max(0, level.current_quantity + quantityChange);
      level.available_quantity = level.current_quantity - level.reserved_quantity;
      level.last_movement_date = new Date().toISOString();
      level.updated_at = new Date().toISOString();
    } else {
      const newQuantity = Math.max(0, quantityChange);
      stockLevelStore.push({
        id: crypto.randomUUID(),
        sku_id: skuId,
        location_id: locationId,
        current_quantity: newQuantity,
        reserved_quantity: 0,
        available_quantity: newQuantity,
        last_movement_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }

  // Analytics
  async getStockAnalytics(): Promise<any> {
    const lowStockItems = await this.getStockLevels({ lowStock: true });

    return {
      totalSKUs: skuStore.length,
      activeSuppliers: supplierStore.filter(s => s.status === 'active').length,
      totalLocations: locationStore.length,
      lowStockItems: lowStockItems.length
    };
  }

  // Validation helpers
  validateCNPJ(cnpj: string): boolean {
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

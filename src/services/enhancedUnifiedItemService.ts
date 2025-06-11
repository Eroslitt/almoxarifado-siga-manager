
import { toolsApi } from './toolsApi';
import { masterDataApi } from './masterDataApi';
import { Tool } from '@/types/database';
import { SKU, SKUMovement } from '@/types/masterData';

export interface EnhancedUnifiedItem {
  id: string;
  type: 'TOOL' | 'SKU';
  code: string;
  name: string;
  description: string;
  category: string;
  specifications: {
    weight?: number;
    dimensions?: { height: number; width: number; depth: number };
    technical_specs?: string;
    unit_of_measure?: string;
    abc_classification?: string;
    xyz_classification?: string;
    material?: string;
    brand?: string;
    model?: string;
  };
  stock: {
    current?: number;
    min?: number;
    max?: number;
    location?: string;
    zone?: string;
    status: 'available' | 'in-use' | 'maintenance' | 'inactive' | 'reserved';
    last_movement?: string;
  };
  supplier?: {
    id: string;
    name: string;
    contact?: string;
    cnpj?: string;
  };
  maintenance?: {
    last_maintenance?: string;
    next_maintenance?: string;
    usage_hours?: number;
    maintenance_interval?: number;
    condition?: string;
  };
  qr_metadata: {
    version: string;
    generated_at: string;
    checksum: string;
    offline_data: any;
  };
  created_at: string;
  updated_at: string;
}

export interface SmartQRCodeData {
  type: 'TOOL' | 'SKU';
  id: string;
  code: string;
  name: string;
  version: string;
  checksum: string;
  offline_specs: {
    weight?: number;
    dimensions?: object;
    category: string;
    supplier?: string;
    location?: string;
  };
  generated_at: string;
}

export interface AutoMovementResult {
  success: boolean;
  message: string;
  item: EnhancedUnifiedItem;
  movement: {
    type: 'checkout' | 'checkin' | 'transfer';
    quantity?: number;
    user_id: string;
    timestamp: string;
    location_from?: string;
    location_to?: string;
    notes?: string;
  };
  stock_alert?: {
    level: 'low' | 'critical' | 'normal';
    current_stock: number;
    min_stock: number;
    message: string;
  };
}

class EnhancedUnifiedItemService {
  private cache = new Map<string, EnhancedUnifiedItem>();
  private offlineQueue: any[] = [];

  // Enhanced QR parsing with metadata
  parseSmartQRCode(qrContent: string): SmartQRCodeData | null {
    try {
      const parsed = JSON.parse(qrContent);
      if (parsed.type && parsed.id && parsed.version) {
        return parsed as SmartQRCodeData;
      }
    } catch {
      // Fallback to simple format
      if (qrContent.startsWith('FER-') || qrContent.includes('TOOL')) {
        return {
          type: 'TOOL',
          id: qrContent,
          code: qrContent,
          name: qrContent,
          version: '1.0',
          checksum: this.generateChecksum(qrContent),
          offline_specs: { category: 'Unknown', location: 'Unknown' },
          generated_at: new Date().toISOString()
        };
      } else {
        return {
          type: 'SKU',
          id: qrContent,
          code: qrContent,
          name: qrContent,
          version: '1.0',
          checksum: this.generateChecksum(qrContent),
          offline_specs: { category: 'Unknown', location: 'Unknown' },
          generated_at: new Date().toISOString()
        };
      }
    }
    return null;
  }

  // Get enhanced item with full Master Data integration
  async getEnhancedItemByQR(qrContent: string): Promise<EnhancedUnifiedItem | null> {
    const qrData = this.parseSmartQRCode(qrContent);
    if (!qrData) return null;

    // Check cache first
    const cacheKey = `${qrData.type}-${qrData.id}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      let item: EnhancedUnifiedItem | null = null;
      
      if (qrData.type === 'TOOL') {
        item = await this.getEnhancedToolItem(qrData.id);
      } else {
        item = await this.getEnhancedSKUItem(qrData.id);
      }

      if (item) {
        // Cache the item
        this.cache.set(cacheKey, item);
        return item;
      }

      // If item not found but QR has offline data, create from QR
      if (qrData.offline_specs) {
        return this.createItemFromOfflineQR(qrData);
      }

    } catch (error) {
      console.error('Error fetching enhanced item:', error);
      
      // Fallback to offline data if available
      if (qrData.offline_specs) {
        return this.createItemFromOfflineQR(qrData);
      }
    }

    return null;
  }

  private async getEnhancedToolItem(toolId: string): Promise<EnhancedUnifiedItem | null> {
    try {
      const { data: tools } = await toolsApi.getTools({ search: toolId, limit: 1 });
      const tool = tools.find(t => t.id === toolId || t.qr_code === toolId);
      
      if (!tool) return null;

      // Get additional data from Master Data if available
      const suppliers = await masterDataApi.getSuppliers();
      const locations = await masterDataApi.getStorageLocations();

      const supplier = suppliers.find(s => s.id === tool.current_user_id);
      const location = locations.find(l => l.code === tool.location);

      return {
        id: tool.id,
        type: 'TOOL',
        code: tool.id,
        name: tool.name,
        description: tool.name,
        category: tool.category,
        specifications: {
          technical_specs: `Ferramenta ${tool.category}`,
          brand: this.extractBrand(tool.name),
          model: this.extractModel(tool.name),
          material: 'Industrial Grade'
        },
        stock: {
          current: 1,
          location: tool.location,
          zone: location?.zone_type || 'A',
          status: this.mapToolStatus(tool.status),
          last_movement: tool.updated_at
        },
        supplier: supplier ? {
          id: supplier.id,
          name: supplier.company_name,
          contact: supplier.contact_info?.email,
          cnpj: supplier.cnpj
        } : undefined,
        maintenance: {
          last_maintenance: tool.last_maintenance,
          next_maintenance: tool.next_maintenance,
          usage_hours: tool.usage_hours,
          maintenance_interval: tool.maintenance_interval_hours
        },
        qr_metadata: {
          version: '2.0',
          generated_at: new Date().toISOString(),
          checksum: this.generateChecksum(tool.id),
          offline_data: {
            name: tool.name,
            category: tool.category,
            location: tool.location
          }
        },
        created_at: tool.created_at,
        updated_at: tool.updated_at
      };
    } catch (error) {
      console.error('Error fetching enhanced tool:', error);
      return null;
    }
  }

  private async getEnhancedSKUItem(skuId: string): Promise<EnhancedUnifiedItem | null> {
    try {
      const skus = await masterDataApi.getSKUs({ search: skuId });
      const sku = skus.find(s => s.id === skuId || s.sku_code === skuId);
      
      if (!sku) return null;

      // Get stock levels and suppliers
      const stockLevels = await masterDataApi.getStockLevels({ skuId: sku.id });
      const suppliers = await masterDataApi.getSuppliers();
      const locations = await masterDataApi.getStorageLocations();
      
      const currentStock = stockLevels.reduce((total, level) => total + level.current_quantity, 0);
      const supplier = suppliers.find(s => s.id === sku.default_supplier_id);
      const primaryLocation = stockLevels[0]?.location_id;
      const location = locations.find(l => l.id === primaryLocation);

      return {
        id: sku.id,
        type: 'SKU',
        code: sku.sku_code,
        name: sku.description,
        description: sku.description,
        category: sku.category_id || 'Produto',
        specifications: {
          weight: sku.weight,
          dimensions: sku.dimensions,
          technical_specs: sku.technical_specs,
          unit_of_measure: sku.unit_of_measure,
          abc_classification: sku.abc_classification,
          xyz_classification: sku.xyz_classification,
          material: sku.technical_specs?.split(',')[0] || 'Standard',
          brand: this.extractBrand(sku.description)
        },
        stock: {
          current: currentStock,
          min: sku.min_stock,
          max: sku.max_stock,
          location: location?.code,
          zone: location?.zone_type,
          status: this.mapSKUStatus(sku.status, currentStock, sku.min_stock),
          last_movement: stockLevels[0]?.last_movement_date
        },
        supplier: supplier ? {
          id: supplier.id,
          name: supplier.company_name,
          contact: supplier.contact_info?.email,
          cnpj: supplier.cnpj
        } : undefined,
        qr_metadata: {
          version: '2.0',
          generated_at: new Date().toISOString(),
          checksum: this.generateChecksum(sku.id),
          offline_data: {
            name: sku.description,
            category: sku.category_id,
            weight: sku.weight,
            unit: sku.unit_of_measure,
            supplier: supplier?.company_name
          }
        },
        created_at: sku.created_at,
        updated_at: sku.updated_at
      };
    } catch (error) {
      console.error('Error fetching enhanced SKU:', error);
      return null;
    }
  }

  // Smart automatic movement with validation
  async performSmartCheckout(qrContent: string, userId: string): Promise<AutoMovementResult> {
    const item = await this.getEnhancedItemByQR(qrContent);
    if (!item) {
      return { 
        success: false, 
        message: 'Item não encontrado', 
        item: null as any,
        movement: null as any
      };
    }

    // Validate availability
    if (item.stock.status === 'maintenance') {
      return {
        success: false,
        message: `❌ Item em manutenção: ${item.name}`,
        item,
        movement: null as any
      };
    }

    if (item.type === 'SKU' && item.stock.current! <= 0) {
      return {
        success: false,
        message: `❌ Estoque insuficiente: ${item.name}`,
        item,
        movement: null as any
      };
    }

    try {
      let result: any;
      
      if (item.type === 'TOOL') {
        result = await toolsApi.checkoutTool({ toolId: item.id, userId });
      } else {
        // Create SKU movement
        await masterDataApi.createMovement({
          sku_id: item.id,
          location_id: 'MAIN_WAREHOUSE',
          movement_type: 'out',
          quantity: 1,
          unit_cost: null,
          reference_document: null,
          user_id: userId,
          timestamp: new Date().toISOString(),
          notes: 'Retirada automática via QR Scanner Inteligente'
        });
        result = { success: true, message: `✅ Retirada confirmada: ${item.name}` };
      }

      // Check for stock alerts
      const stockAlert = this.checkStockAlert(item);

      // Clear cache to force refresh
      this.clearItemCache(item);

      return {
        success: result.success,
        message: result.message,
        item,
        movement: {
          type: 'checkout',
          quantity: item.type === 'SKU' ? 1 : undefined,
          user_id: userId,
          timestamp: new Date().toISOString(),
          location_from: item.stock.location,
          notes: 'Checkout automático via QR Scanner'
        },
        stock_alert: stockAlert
      };

    } catch (error) {
      return {
        success: false,
        message: `Erro na retirada: ${(error as Error).message}`,
        item,
        movement: null as any
      };
    }
  }

  // Smart automatic checkin with condition assessment
  async performSmartCheckin(qrContent: string, userId: string, condition?: string): Promise<AutoMovementResult> {
    const item = await this.getEnhancedItemByQR(qrContent);
    if (!item) {
      return { 
        success: false, 
        message: 'Item não encontrado', 
        item: null as any,
        movement: null as any
      };
    }

    try {
      let result: any;
      const hasIssue = !!condition;

      if (item.type === 'TOOL') {
        result = await toolsApi.checkinTool({
          toolId: item.id,
          userId,
          hasIssue,
          conditionNote: condition
        });
      } else {
        // Create SKU movement
        await masterDataApi.createMovement({
          sku_id: item.id,
          location_id: 'MAIN_WAREHOUSE',
          movement_type: 'in',
          quantity: 1,
          unit_cost: null,
          reference_document: null,
          user_id: userId,
          timestamp: new Date().toISOString(),
          notes: condition ? `Devolução com observação: ${condition}` : 'Devolução automática via QR Scanner'
        });
        result = { 
          success: true, 
          message: condition ? 
            `✅ Devolução registrada com observação: ${item.name}` : 
            `✅ Devolução confirmada: ${item.name}` 
        };
      }

      // Clear cache to force refresh
      this.clearItemCache(item);

      return {
        success: result.success,
        message: result.message,
        item,
        movement: {
          type: 'checkin',
          quantity: item.type === 'SKU' ? 1 : undefined,
          user_id: userId,
          timestamp: new Date().toISOString(),
          location_to: item.stock.location,
          notes: condition || 'Checkin automático via QR Scanner'
        }
      };

    } catch (error) {
      return {
        success: false,
        message: `Erro na devolução: ${(error as Error).message}`,
        item,
        movement: null as any
      };
    }
  }

  // Generate smart QR code with offline capabilities
  generateSmartQRCode(item: EnhancedUnifiedItem): string {
    const qrData: SmartQRCodeData = {
      type: item.type,
      id: item.id,
      code: item.code,
      name: item.name,
      version: '2.0',
      checksum: this.generateChecksum(item.id + item.name),
      offline_specs: {
        weight: item.specifications.weight,
        dimensions: item.specifications.dimensions || undefined,
        category: item.category,
        supplier: item.supplier?.name,
        location: item.stock.location
      },
      generated_at: new Date().toISOString()
    };

    return JSON.stringify(qrData);
  }

  // Utility methods
  private createItemFromOfflineQR(qrData: SmartQRCodeData): EnhancedUnifiedItem {
    return {
      id: qrData.id,
      type: qrData.type,
      code: qrData.code,
      name: qrData.name,
      description: qrData.name,
      category: qrData.offline_specs.category,
      specifications: {
        weight: qrData.offline_specs.weight,
        dimensions: qrData.offline_specs.dimensions,
        technical_specs: 'Dados offline'
      },
      stock: {
        location: qrData.offline_specs.location,
        status: 'available'
      },
      qr_metadata: {
        version: qrData.version,
        generated_at: qrData.generated_at,
        checksum: qrData.checksum,
        offline_data: qrData.offline_specs
      },
      created_at: qrData.generated_at,
      updated_at: qrData.generated_at
    };
  }

  private checkStockAlert(item: EnhancedUnifiedItem): { level: 'low' | 'critical' | 'normal'; current_stock: number; min_stock: number; message: string } | undefined {
    if (item.type === 'SKU' && item.stock.current !== undefined && item.stock.min !== undefined) {
      const current = item.stock.current;
      const min = item.stock.min;
      
      if (current <= min * 0.5) {
        return {
          level: 'critical',
          current_stock: current,
          min_stock: min,
          message: `🚨 ESTOQUE CRÍTICO: ${item.name} (${current}/${min})`
        };
      } else if (current <= min) {
        return {
          level: 'low',
          current_stock: current,
          min_stock: min,
          message: `⚠️ Estoque baixo: ${item.name} (${current}/${min})`
        };
      }
    }
    return undefined;
  }

  private mapToolStatus(status: string): 'available' | 'in-use' | 'maintenance' | 'inactive' | 'reserved' {
    switch (status) {
      case 'available': return 'available';
      case 'in-use': return 'in-use';
      case 'maintenance': return 'maintenance';
      case 'inactive': return 'inactive';
      case 'reserved': return 'reserved';
      default: return 'available';
    }
  }

  private mapSKUStatus(status: string, current: number, min: number): 'available' | 'in-use' | 'maintenance' | 'inactive' | 'reserved' {
    if (status === 'inactive') return 'inactive';
    if (current <= 0) return 'inactive';
    if (current <= min) return 'maintenance'; // Use maintenance status for low stock
    return 'available';
  }

  private extractBrand(name: string): string {
    const brands = ['Makita', 'Bosch', 'DeWalt', 'Black & Decker', 'Stanley', 'Tramontina'];
    const found = brands.find(brand => name.toLowerCase().includes(brand.toLowerCase()));
    return found || 'Generic';
  }

  private extractModel(name: string): string {
    const match = name.match(/[A-Z0-9]{3,}-?\w*/);
    return match ? match[0] : 'Standard';
  }

  private generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private clearItemCache(item: EnhancedUnifiedItem): void {
    const cacheKey = `${item.type}-${item.id}`;
    this.cache.delete(cacheKey);
  }

  // Offline support
  addToOfflineQueue(operation: any): void {
    this.offlineQueue.push({
      ...operation,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    });
  }

  async syncOfflineQueue(): Promise<void> {
    for (const operation of this.offlineQueue) {
      try {
        // Process offline operations when back online
        if (operation.type === 'checkout') {
          await this.performSmartCheckout(operation.qrContent, operation.userId);
        } else if (operation.type === 'checkin') {
          await this.performSmartCheckin(operation.qrContent, operation.userId, operation.condition);
        }
      } catch (error) {
        console.error('Error syncing offline operation:', error);
      }
    }
    this.offlineQueue = [];
  }
}

export const enhancedUnifiedItemService = new EnhancedUnifiedItemService();

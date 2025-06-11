
import { toolsApi } from './toolsApi';
import { masterDataApi } from './masterDataApi';
import { Tool } from '@/types/database';
import { SKU, SKUMovement } from '@/types/masterData';

export interface UnifiedItem {
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
  };
  stock: {
    current?: number;
    min?: number;
    max?: number;
    location?: string;
    status: 'available' | 'in-use' | 'maintenance' | 'inactive';
  };
  supplier?: string;
  maintenance?: {
    last_maintenance?: string;
    next_maintenance?: string;
    usage_hours?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface QRCodeData {
  type: 'TOOL' | 'SKU';
  id: string;
  code: string;
  version: string;
  checksum: string;
}

export interface MovementResult {
  success: boolean;
  message: string;
  item: UnifiedItem;
  movement?: {
    type: 'checkout' | 'checkin' | 'transfer';
    quantity?: number;
    user_id: string;
    timestamp: string;
  };
}

class UnifiedItemService {
  // Parse QR Code and determine item type
  parseQRCode(qrContent: string): QRCodeData | null {
    try {
      // Try structured QR format first
      const parsed = JSON.parse(qrContent);
      if (parsed.type && parsed.id) {
        return parsed;
      }
    } catch {
      // Fallback to simple ID format
      // Determine type by ID pattern
      if (qrContent.startsWith('FER-') || qrContent.includes('TOOL')) {
        return {
          type: 'TOOL',
          id: qrContent,
          code: qrContent,
          version: '1.0',
          checksum: this.generateChecksum(qrContent)
        };
      } else {
        return {
          type: 'SKU',
          id: qrContent,
          code: qrContent,
          version: '1.0',
          checksum: this.generateChecksum(qrContent)
        };
      }
    }
    return null;
  }

  // Get unified item data by scanning QR
  async getItemByQR(qrContent: string): Promise<UnifiedItem | null> {
    const qrData = this.parseQRCode(qrContent);
    if (!qrData) return null;

    try {
      if (qrData.type === 'TOOL') {
        return await this.getToolAsUnifiedItem(qrData.id);
      } else {
        return await this.getSKUAsUnifiedItem(qrData.id);
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      return null;
    }
  }

  // Convert Tool to UnifiedItem format
  private async getToolAsUnifiedItem(toolId: string): Promise<UnifiedItem | null> {
    try {
      const { data: tools } = await toolsApi.getTools({ search: toolId, limit: 1 });
      const tool = tools.find(t => t.id === toolId || t.qr_code === toolId);
      
      if (!tool) return null;

      return {
        id: tool.id,
        type: 'TOOL',
        code: tool.id,
        name: tool.name,
        description: tool.name,
        category: tool.category,
        specifications: {
          technical_specs: `Ferramenta ${tool.category} - ${tool.usage_hours}h de uso`,
        },
        stock: {
          current: 1,
          location: tool.location,
          status: tool.status
        },
        maintenance: {
          last_maintenance: tool.last_maintenance,
          next_maintenance: tool.next_maintenance,
          usage_hours: tool.usage_hours
        },
        created_at: tool.created_at,
        updated_at: tool.updated_at
      };
    } catch (error) {
      console.error('Error fetching tool:', error);
      return null;
    }
  }

  // Convert SKU to UnifiedItem format
  private async getSKUAsUnifiedItem(skuId: string): Promise<UnifiedItem | null> {
    try {
      const skus = await masterDataApi.getSKUs({ search: skuId });
      const sku = skus.find(s => s.id === skuId || s.sku_code === skuId);
      
      if (!sku) return null;

      // Get current stock level
      const stockLevels = await masterDataApi.getStockLevels({ skuId: sku.id });
      const currentStock = stockLevels.reduce((total, level) => total + level.current_quantity, 0);

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
          xyz_classification: sku.xyz_classification
        },
        stock: {
          current: currentStock,
          min: sku.min_stock,
          max: sku.max_stock,
          status: sku.status
        },
        supplier: sku.default_supplier_id,
        created_at: sku.created_at,
        updated_at: sku.updated_at
      };
    } catch (error) {
      console.error('Error fetching SKU:', error);
      return null;
    }
  }

  // Handle automatic checkout (saída)
  async performCheckout(qrContent: string, userId: string): Promise<MovementResult> {
    const item = await this.getItemByQR(qrContent);
    if (!item) {
      return { success: false, message: 'Item não encontrado', item: null as any };
    }

    try {
      if (item.type === 'TOOL') {
        const result = await toolsApi.checkoutTool({ toolId: item.id, userId });
        return {
          success: result.success,
          message: result.message,
          item,
          movement: {
            type: 'checkout',
            user_id: userId,
            timestamp: new Date().toISOString()
          }
        };
      } else {
        // For SKUs, create movement and update stock
        await masterDataApi.createMovement({
          sku_id: item.id,
          location_id: 'MAIN_WAREHOUSE', // Default location
          movement_type: 'out',
          quantity: 1,
          user_id: userId,
          timestamp: new Date().toISOString(),
          notes: 'Retirada automática via QR Scanner'
        });

        return {
          success: true,
          message: `✅ Retirada confirmada: ${item.name}`,
          item,
          movement: {
            type: 'checkout',
            quantity: 1,
            user_id: userId,
            timestamp: new Date().toISOString()
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro na retirada: ${(error as Error).message}`,
        item
      };
    }
  }

  // Handle automatic checkin (entrada)
  async performCheckin(qrContent: string, userId: string, condition?: string): Promise<MovementResult> {
    const item = await this.getItemByQR(qrContent);
    if (!item) {
      return { success: false, message: 'Item não encontrado', item: null as any };
    }

    try {
      if (item.type === 'TOOL') {
        const hasIssue = !!condition;
        const result = await toolsApi.checkinTool({
          toolId: item.id,
          userId,
          hasIssue,
          conditionNote: condition
        });

        return {
          success: result.success,
          message: result.message,
          item,
          movement: {
            type: 'checkin',
            user_id: userId,
            timestamp: new Date().toISOString()
          }
        };
      } else {
        // For SKUs, create movement and update stock
        await masterDataApi.createMovement({
          sku_id: item.id,
          location_id: 'MAIN_WAREHOUSE',
          movement_type: 'in',
          quantity: 1,
          user_id: userId,
          timestamp: new Date().toISOString(),
          notes: condition ? `Devolução com observação: ${condition}` : 'Devolução automática via QR Scanner'
        });

        return {
          success: true,
          message: `✅ Devolução confirmada: ${item.name}`,
          item,
          movement: {
            type: 'checkin',
            quantity: 1,
            user_id: userId,
            timestamp: new Date().toISOString()
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro na devolução: ${(error as Error).message}`,
        item
      };
    }
  }

  // Generate structured QR Code
  generateQRCode(item: UnifiedItem): string {
    const qrData: QRCodeData = {
      type: item.type,
      id: item.id,
      code: item.code,
      version: '1.0',
      checksum: this.generateChecksum(item.id)
    };

    return JSON.stringify(qrData);
  }

  // Simple checksum for validation
  private generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Get movement history for an item
  async getMovementHistory(itemId: string, itemType: 'TOOL' | 'SKU'): Promise<any[]> {
    try {
      if (itemType === 'TOOL') {
        // This would require a new API method for tool movements
        return [];
      } else {
        // Get SKU movements from master data
        return [];
      }
    } catch (error) {
      console.error('Error fetching movement history:', error);
      return [];
    }
  }
}

export const unifiedItemService = new UnifiedItemService();

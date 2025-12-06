
import { Tool, ToolMovement } from '@/types/database';
import { safetyComplianceApi } from './safetyComplianceApi';

export interface CheckoutRequest {
  toolId: string;
  userId: string;
}

export interface CheckinRequest {
  toolId: string;
  userId: string;
  conditionNote?: string;
  hasIssue?: boolean;
}

export interface ToolsFilters {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// In-memory stores
const toolsStore: Tool[] = [
  {
    id: 'tool-001',
    name: 'Furadeira Bosch',
    category: 'Ferramentas Elétricas',
    status: 'available',
    location: 'A-01-01-A',
    registration_date: new Date().toISOString(),
    last_maintenance: new Date().toISOString(),
    next_maintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    usage_hours: 120,
    current_user_id: null,
    qr_code: 'QR-TOOL-001',
    maintenance_interval_hours: 500,
    purchase_price: 599.99,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const movementsStore: ToolMovement[] = [];

class ToolsApiService {
  async checkoutTool(request: CheckoutRequest): Promise<{ success: boolean; message: string; safetyDenied?: boolean }> {
    try {
      const safetyValidation = await safetyComplianceApi.validateToolAccess(request.userId, request.toolId);
      
      if (!safetyValidation.allowed) {
        return { 
          success: false, 
          message: safetyValidation.denialReason || 'Acesso negado por questões de segurança',
          safetyDenied: true
        };
      }

      const tool = toolsStore.find(t => t.id === request.toolId);
      if (!tool) {
        return { success: false, message: 'Ferramenta não encontrada' };
      }

      if (tool.status !== 'available') {
        return { success: false, message: 'Ferramenta não está disponível' };
      }

      tool.status = 'in-use';
      tool.current_user_id = request.userId;
      tool.updated_at = new Date().toISOString();

      movementsStore.push({
        id: crypto.randomUUID(),
        tool_id: request.toolId,
        user_id: request.userId,
        action: 'checkout',
        timestamp: new Date().toISOString(),
        condition_note: null,
        usage_duration_minutes: null,
        created_at: new Date().toISOString()
      });

      return { success: true, message: 'Checkout realizado com sucesso' };
    } catch (error) {
      console.error('Erro no checkout:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  async checkinTool(request: CheckinRequest): Promise<{ success: boolean; message: string }> {
    try {
      const tool = toolsStore.find(t => t.id === request.toolId);
      if (!tool) {
        return { success: false, message: 'Ferramenta não encontrada' };
      }

      if (tool.status !== 'in-use') {
        return { success: false, message: 'Ferramenta não está em uso' };
      }

      tool.status = request.hasIssue ? 'maintenance' : 'available';
      tool.current_user_id = null;
      tool.updated_at = new Date().toISOString();

      movementsStore.push({
        id: crypto.randomUUID(),
        tool_id: request.toolId,
        user_id: request.userId,
        action: 'checkin',
        timestamp: new Date().toISOString(),
        condition_note: request.conditionNote || null,
        usage_duration_minutes: null,
        created_at: new Date().toISOString()
      });

      return { 
        success: true, 
        message: request.hasIssue ? 'Checkin realizado. Ferramenta enviada para manutenção.' : 'Checkin realizado com sucesso' 
      };
    } catch (error) {
      console.error('Erro no checkin:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  async getTools(filters: ToolsFilters = {}): Promise<{ data: Tool[]; total: number }> {
    let result = [...toolsStore];

    if (filters.status) {
      result = result.filter(t => t.status === filters.status);
    }
    if (filters.category) {
      result = result.filter(t => t.category === filters.category);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(search) || t.id.toLowerCase().includes(search)
      );
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const start = (page - 1) * limit;
    const paginated = result.slice(start, start + limit);

    return { data: paginated, total: result.length };
  }

  async getToolHistory(toolId: string): Promise<ToolMovement[]> {
    return movementsStore
      .filter(m => m.tool_id === toolId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async updateToolStatus(toolId: string, status: Tool['status']): Promise<{ success: boolean; message: string }> {
    const tool = toolsStore.find(t => t.id === toolId);
    if (tool) {
      tool.status = status;
      if (status === 'available') tool.current_user_id = null;
      tool.updated_at = new Date().toISOString();
    }
    return { success: true, message: 'Status atualizado com sucesso' };
  }

  async getToolsStats(): Promise<{ total: number; available: number; inUse: number; maintenance: number }> {
    return {
      total: toolsStore.length,
      available: toolsStore.filter(t => t.status === 'available').length,
      inUse: toolsStore.filter(t => t.status === 'in-use').length,
      maintenance: toolsStore.filter(t => t.status === 'maintenance').length
    };
  }
}

export const toolsApi = new ToolsApiService();


import { supabase } from '@/lib/supabase';
import { Tool, ToolMovement, User } from '@/types/database';

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

class ToolsApiService {
  // Fazer checkout de uma ferramenta
  async checkoutTool(request: CheckoutRequest): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Fazendo checkout da ferramenta:', request);

      // Verificar se a ferramenta está disponível
      const { data: tool, error: toolError } = await supabase
        .from('tools')
        .select('*')
        .eq('id', request.toolId)
        .single();

      if (toolError || !tool) {
        return { success: false, message: 'Ferramenta não encontrada' };
      }

      if (tool.status !== 'available') {
        return { success: false, message: 'Ferramenta não está disponível' };
      }

      // Atualizar status da ferramenta
      const { error: updateError } = await supabase
        .from('tools')
        .update({
          status: 'in-use',
          current_user_id: request.userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.toolId);

      if (updateError) {
        console.error('Erro ao atualizar ferramenta:', updateError);
        return { success: false, message: 'Erro ao atualizar status da ferramenta' };
      }

      // Registrar movimentação
      const { error: movementError } = await supabase
        .from('tool_movements')
        .insert({
          tool_id: request.toolId,
          user_id: request.userId,
          action: 'checkout',
          timestamp: new Date().toISOString()
        });

      if (movementError) {
        console.error('Erro ao registrar movimentação:', movementError);
        return { success: false, message: 'Erro ao registrar movimentação' };
      }

      return { success: true, message: 'Checkout realizado com sucesso' };
    } catch (error) {
      console.error('Erro no checkout:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Fazer checkin de uma ferramenta
  async checkinTool(request: CheckinRequest): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Fazendo checkin da ferramenta:', request);

      // Verificar se a ferramenta está em uso
      const { data: tool, error: toolError } = await supabase
        .from('tools')
        .select('*')
        .eq('id', request.toolId)
        .single();

      if (toolError || !tool) {
        return { success: false, message: 'Ferramenta não encontrada' };
      }

      if (tool.status !== 'in-use') {
        return { success: false, message: 'Ferramenta não está em uso' };
      }

      // Determinar novo status baseado na condição
      const newStatus = request.hasIssue ? 'maintenance' : 'available';

      // Atualizar status da ferramenta
      const { error: updateError } = await supabase
        .from('tools')
        .update({
          status: newStatus,
          current_user_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.toolId);

      if (updateError) {
        console.error('Erro ao atualizar ferramenta:', updateError);
        return { success: false, message: 'Erro ao atualizar status da ferramenta' };
      }

      // Registrar movimentação
      const { error: movementError } = await supabase
        .from('tool_movements')
        .insert({
          tool_id: request.toolId,
          user_id: request.userId,
          action: 'checkin',
          condition_note: request.conditionNote || null,
          timestamp: new Date().toISOString()
        });

      if (movementError) {
        console.error('Erro ao registrar movimentação:', movementError);
        return { success: false, message: 'Erro ao registrar movimentação' };
      }

      const message = request.hasIssue 
        ? 'Checkin realizado. Ferramenta enviada para manutenção.'
        : 'Checkin realizado com sucesso';

      return { success: true, message };
    } catch (error) {
      console.error('Erro no checkin:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Listar ferramentas com filtros
  async getTools(filters: ToolsFilters = {}): Promise<{ data: Tool[]; total: number }> {
    try {
      let query = supabase
        .from('tools')
        .select('*', { count: 'exact' });

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,id.ilike.%${filters.search}%`);
      }

      // Paginação
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Erro ao buscar ferramentas:', error);
        return { data: [], total: 0 };
      }

      return { data: data || [], total: count || 0 };
    } catch (error) {
      console.error('Erro ao buscar ferramentas:', error);
      return { data: [], total: 0 };
    }
  }

  // Buscar histórico de uma ferramenta
  async getToolHistory(toolId: string): Promise<ToolMovement[]> {
    try {
      const { data, error } = await supabase
        .from('tool_movements')
        .select(`
          *,
          users(name, department)
        `)
        .eq('tool_id', toolId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Erro ao buscar histórico:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  }

  // Atualizar status de uma ferramenta
  async updateToolStatus(toolId: string, status: Tool['status']): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('tools')
        .update({
          status,
          current_user_id: status === 'available' ? null : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', toolId);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        return { success: false, message: 'Erro ao atualizar status da ferramenta' };
      }

      return { success: true, message: 'Status atualizado com sucesso' };
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Buscar estatísticas das ferramentas
  async getToolsStats(): Promise<{
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('status');

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return { total: 0, available: 0, inUse: 0, maintenance: 0 };
      }

      const stats = {
        total: data?.length || 0,
        available: data?.filter(t => t.status === 'available').length || 0,
        inUse: data?.filter(t => t.status === 'in-use').length || 0,
        maintenance: data?.filter(t => t.status === 'maintenance').length || 0
      };

      return stats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { total: 0, available: 0, inUse: 0, maintenance: 0 };
    }
  }
}

export const toolsApi = new ToolsApiService();

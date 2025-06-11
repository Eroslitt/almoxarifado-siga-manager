import { supabase } from '@/lib/supabase';
import { WorkTemplate, WorkTemplateItem, BatchCheckout, BatchCheckoutItem, KittingSuggestion, WorkTemplateWithItems } from '@/types/kitting';
import { Tool } from '@/types/database';

export interface CreateTemplateRequest {
  name: string;
  description: string;
  category: string;
  department: string;
  estimatedDuration: number;
  items: {
    toolId: string;
    quantity: number;
    priority: 'essential' | 'recommended' | 'optional';
    notes?: string;
  }[];
}

export interface StartBatchCheckoutRequest {
  templateId?: string;
  workType: string;
  estimatedReturn?: string;
  notes?: string;
}

class KittingApiService {
  // Criar template de trabalho
  async createTemplate(request: CreateTemplateRequest, userId: string): Promise<{ success: boolean; templateId?: string; message: string }> {
    try {
      // Criar template
      const { data: template, error: templateError } = await supabase
        .from('work_templates')
        .insert({
          name: request.name,
          description: request.description,
          category: request.category,
          department: request.department,
          estimated_duration_minutes: request.estimatedDuration,
          created_by: userId,
          active: true,
          usage_count: 0,
          success_rate: 0,
          priority: 1
        })
        .select()
        .single();

      if (templateError || !template) {
        return { success: false, message: 'Erro ao criar template' };
      }

      // Adicionar itens do template
      const templateItems = request.items.map(item => ({
        template_id: template.id,
        tool_id: item.toolId,
        quantity: item.quantity,
        priority: item.priority,
        notes: item.notes || null,
        alternative_tool_ids: [],
        usage_frequency: 0
      }));

      const { error: itemsError } = await supabase
        .from('work_template_items')
        .insert(templateItems);

      if (itemsError) {
        return { success: false, message: 'Erro ao adicionar itens ao template' };
      }

      return { success: true, templateId: template.id, message: 'Template criado com sucesso' };
    } catch (error) {
      console.error('Erro ao criar template:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Listar templates
  async getTemplates(filters: { category?: string; department?: string; active?: boolean } = {}): Promise<WorkTemplateWithItems[]> {
    try {
      let query = supabase
        .from('work_templates')
        .select(`
          *,
          work_template_items(
            *,
            tools(*)
          )
        `)
        .order('usage_count', { ascending: false });

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.department) {
        query = query.eq('department', filters.department);
      }

      if (filters.active !== undefined) {
        query = query.eq('active', filters.active);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar templates:', error);
        return [];
      }

      return data?.map(template => ({
        ...template,
        items: template.work_template_items?.map((item: any) => ({
          ...item,
          tool: item.tools
        })) || []
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      return [];
    }
  }

  // Gerar sugestões inteligentes
  async generateSuggestions(workType: string, userId: string, templateId?: string): Promise<KittingSuggestion[]> {
    try {
      let suggestions: KittingSuggestion[] = [];

      if (templateId) {
        // Buscar sugestões do template
        const { data: template } = await supabase
          .from('work_templates')
          .select(`
            *,
            work_template_items(
              *,
              tools(*)
            )
          `)
          .eq('id', templateId)
          .single();

        if (template?.work_template_items) {
          suggestions = template.work_template_items.map((item: any) => ({
            toolId: item.tool_id,
            toolName: item.tools.name,
            priority: item.priority,
            confidence: 0.9,
            reason: 'Definido no template',
            available: item.tools.status === 'available',
            location: item.tools.location
          }));
        }
      } else {
        // IA básica: analisar histórico de uso
        const { data: movements } = await supabase
          .from('tool_movements')
          .select(`
            tool_id,
            tools(name, status, location)
          `)
          .eq('user_id', userId)
          .eq('action', 'checkout')
          .order('timestamp', { ascending: false })
          .limit(50);

        if (movements) {
          const toolFrequency = movements.reduce((acc: any, movement: any) => {
            acc[movement.tool_id] = (acc[movement.tool_id] || 0) + 1;
            return acc;
          }, {});

          suggestions = Object.entries(toolFrequency)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 10)
            .map(([toolId, frequency]) => {
              const movement = movements.find((m: any) => m.tool_id === toolId);
              const tool = movement?.tools;
              return {
                toolId,
                toolName: tool?.name || 'Ferramenta',
                priority: 'recommended' as const,
                confidence: Math.min((frequency as number) / 10, 0.8),
                reason: `Usado ${frequency} vezes recentemente`,
                available: tool?.status === 'available',
                location: tool?.location || ''
              };
            });
        }
      }

      return suggestions;
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
      return [];
    }
  }

  // Iniciar checkout em lote
  async startBatchCheckout(request: StartBatchCheckoutRequest, userId: string): Promise<{ success: boolean; batchId?: string; message: string }> {
    try {
      const { data: batch, error } = await supabase
        .from('batch_checkouts')
        .insert({
          template_id: request.templateId || null,
          user_id: userId,
          work_type: request.workType,
          status: 'in-progress',
          total_items: 0,
          completed_items: 0,
          started_at: new Date().toISOString(),
          estimated_return: request.estimatedReturn || null,
          notes: request.notes || null
        })
        .select()
        .single();

      if (error || !batch) {
        return { success: false, message: 'Erro ao iniciar checkout em lote' };
      }

      return { success: true, batchId: batch.id, message: 'Checkout em lote iniciado' };
    } catch (error) {
      console.error('Erro ao iniciar checkout em lote:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Adicionar item ao batch
  async addBatchItem(batchId: string, toolId: string, priority: 'essential' | 'recommended' | 'optional'): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('batch_checkout_items')
        .insert({
          batch_id: batchId,
          tool_id: toolId,
          priority,
          status: 'pending'
        });

      if (error) {
        return { success: false, message: 'Erro ao adicionar item' };
      }

      // Atualizar contador do batch
      await supabase.rpc('increment_batch_total', { batch_id: batchId });

      return { success: true, message: 'Item adicionado ao checkout' };
    } catch (error) {
      console.error('Erro ao adicionar item ao batch:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Processar checkout de item do batch
  async processBatchItem(batchId: string, toolId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Verificar se ferramenta está disponível
      const { data: tool, error: toolError } = await supabase
        .from('tools')
        .select('*')
        .eq('id', toolId)
        .single();

      if (toolError || !tool || tool.status !== 'available') {
        return { success: false, message: 'Ferramenta não disponível' };
      }

      // Buscar informações do batch
      const { data: batch } = await supabase
        .from('batch_checkouts')
        .select('user_id')
        .eq('id', batchId)
        .single();

      if (!batch) {
        return { success: false, message: 'Batch não encontrado' };
      }

      // Fazer checkout da ferramenta
      const { error: updateError } = await supabase
        .from('tools')
        .update({
          status: 'in-use',
          current_user_id: batch.user_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', toolId);

      if (updateError) {
        return { success: false, message: 'Erro ao fazer checkout' };
      }

      // Registrar movimentação
      await supabase
        .from('tool_movements')
        .insert({
          tool_id: toolId,
          user_id: batch.user_id,
          action: 'checkout',
          timestamp: new Date().toISOString()
        });

      // Atualizar status do item no batch
      await supabase
        .from('batch_checkout_items')
        .update({
          status: 'checked-out',
          scanned_at: new Date().toISOString(),
          checkout_at: new Date().toISOString()
        })
        .eq('batch_id', batchId)
        .eq('tool_id', toolId);

      // Incrementar contador de itens completados
      await supabase.rpc('increment_batch_completed', { batch_id: batchId });

      return { success: true, message: 'Item processado com sucesso' };
    } catch (error) {
      console.error('Erro ao processar item do batch:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Finalizar batch checkout
  async completeBatchCheckout(batchId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('batch_checkouts')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', batchId);

      if (error) {
        return { success: false, message: 'Erro ao finalizar checkout' };
      }

      return { success: true, message: 'Checkout em lote finalizado' };
    } catch (error) {
      console.error('Erro ao finalizar batch checkout:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }
}

export const kittingApi = new KittingApiService();

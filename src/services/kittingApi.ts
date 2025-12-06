import { supabase } from '@/lib/supabase';
import { Tool, User, ToolMovement } from '@/types/database';
import { KittingSuggestion, WorkTemplateWithItems, BatchCheckout } from '@/types/kitting';

export interface WorkTemplate {
  id: string;
  name: string;
  description: string;
  required_tools: string[];
  estimated_duration: number;
  department: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface KittingRequest {
  id: string;
  work_template_id: string;
  user_id: string;
  status: 'pending' | 'prepared' | 'delivered' | 'returned';
  requested_at: string;
  prepared_at: string | null;
  delivered_at: string | null;
  returned_at: string | null;
  notes: string | null;
}

export interface KittingItem {
  id: string;
  kitting_request_id: string;
  tool_id: string;
  status: 'pending' | 'collected' | 'delivered' | 'returned';
  collected_at: string | null;
  condition_note: string | null;
}

class KittingApiService {
  // Work Templates
  async createWorkTemplate(template: Omit<WorkTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<WorkTemplate> {
    const { data, error } = await supabase
      .from('work_templates')
      .insert(template)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getWorkTemplates(): Promise<WorkTemplate[]> {
    const { data, error } = await supabase
      .from('work_templates')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // New methods for components compatibility
  async getTemplates(filters?: { active?: boolean }): Promise<WorkTemplateWithItems[]> {
    let query = supabase
      .from('work_templates')
      .select(`
        *,
        items:work_template_items(
          *,
          tool:tools(*)
        )
      `)
      .order('name');

    if (filters?.active) {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Transform to match expected structure
    return (data || []).map(template => ({
      ...template,
      active: template.status === 'active',
      estimated_duration_minutes: template.estimated_duration || 60,
      category: template.department || '',
      usage_count: 0,
      success_rate: 1.0,
      created_by: '',
      items: template.items || []
    }));
  }

  async createTemplate(
    templateData: {
      name: string;
      description: string;
      category: string;
      department: string;
      estimatedDuration: number;
      items: {
        toolId: string;
        quantity: number;
        priority: 'essential' | 'recommended' | 'optional';
        notes: string;
      }[];
    },
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { data: template, error: templateError } = await supabase
        .from('work_templates')
        .insert({
          name: templateData.name,
          description: templateData.description,
          department: templateData.department,
          estimated_duration: templateData.estimatedDuration,
          status: 'active',
          required_tools: templateData.items.map(item => item.toolId)
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Insert template items
      if (templateData.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('work_template_items')
          .insert(
            templateData.items.map(item => ({
              template_id: template.id,
              tool_id: item.toolId,
              quantity: item.quantity,
              priority: item.priority,
              notes: item.notes
            }))
          );

        if (itemsError) throw itemsError;
      }

      return { success: true, message: 'Template criado com sucesso' };
    } catch (error) {
      console.error('Error creating template:', error);
      return { success: false, message: 'Erro ao criar template' };
    }
  }

  async updateWorkTemplate(id: string, updates: Partial<WorkTemplate>): Promise<WorkTemplate> {
    const { data, error } = await supabase
      .from('work_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteWorkTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('work_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Kitting Requests
  async createKittingRequest(request: Omit<KittingRequest, 'id' | 'requested_at'>): Promise<KittingRequest> {
    const { data, error } = await supabase
      .from('kitting_requests')
      .insert({
        ...request,
        requested_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getKittingRequests(filters?: { status?: string; userId?: string }): Promise<KittingRequest[]> {
    let query = supabase
      .from('kitting_requests')
      .select(`
        *,
        work_templates(name, description),
        users(name, department)
      `)
      .order('requested_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async updateKittingRequestStatus(id: string, status: KittingRequest['status']): Promise<KittingRequest> {
    const statusTimestamp = {
      prepared: 'prepared_at',
      delivered: 'delivered_at',
      returned: 'returned_at'
    }[status];

    const updates: any = { status };
    if (statusTimestamp) {
      updates[statusTimestamp] = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('kitting_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Kitting Items
  async getKittingItems(requestId: string): Promise<KittingItem[]> {
    const { data, error } = await supabase
      .from('kitting_items')
      .select(`
        *,
        tools(name, status, location)
      `)
      .eq('kitting_request_id', requestId);

    if (error) throw error;
    return data || [];
  }

  async updateKittingItemStatus(id: string, status: KittingItem['status'], conditionNote?: string): Promise<KittingItem> {
    const updates: any = { status };
    if (conditionNote) {
      updates.condition_note = conditionNote;
    }
    if (status === 'collected') {
      updates.collected_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('kitting_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Batch Checkout Methods
  async startBatchCheckout(params: {
    templateId?: string;
    workType: string;
  }, userId: string): Promise<{ success: boolean; batchId?: string; message: string }> {
    try {
      const { data, error } = await supabase
        .from('batch_checkouts')
        .insert({
          template_id: params.templateId || null,
          user_id: userId,
          work_type: params.workType,
          status: 'in-progress',
          total_items: 0,
          completed_items: 0,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, batchId: data.id, message: 'Batch iniciado' };
    } catch (error) {
      console.error('Error starting batch:', error);
      return { success: false, message: 'Erro ao iniciar batch' };
    }
  }

  async addBatchItem(batchId: string, toolId: string, priority: 'essential' | 'recommended' | 'optional'): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('batch_checkout_items')
        .insert({
          batch_id: batchId,
          tool_id: toolId,
          status: 'pending',
          priority: priority
        });

      if (error) throw error;
      return { success: true, message: 'Item adicionado' };
    } catch (error) {
      console.error('Error adding batch item:', error);
      return { success: false, message: 'Erro ao adicionar item' };
    }
  }

  async processBatchItem(batchId: string, toolId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('batch_checkout_items')
        .update({
          status: 'checked-out',
          checkout_at: new Date().toISOString()
        })
        .eq('batch_id', batchId)
        .eq('tool_id', toolId);

      if (error) throw error;
      return { success: true, message: 'Item processado' };
    } catch (error) {
      console.error('Error processing batch item:', error);
      return { success: false, message: 'Erro ao processar item' };
    }
  }

  async completeBatchCheckout(batchId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('batch_checkouts')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', batchId);

      if (error) throw error;
      return { success: true, message: 'Batch completado' };
    } catch (error) {
      console.error('Error completing batch:', error);
      return { success: false, message: 'Erro ao completar batch' };
    }
  }

  // Analytics and Suggestions
  async getKittingAnalytics(days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: requests, error } = await supabase
      .from('kitting_requests')
      .select(`
        *,
        work_templates(name, department)
      `)
      .gte('requested_at', startDate.toISOString());

    if (error) throw error;

    // Calculate metrics
    const totalRequests = requests?.length || 0;
    const completedRequests = requests?.filter(r => r.status === 'returned').length || 0;
    const avgCompletionTime = this.calculateAverageCompletionTime(requests || []);
    const departmentUsage = this.calculateDepartmentUsage(requests || []);

    return {
      totalRequests,
      completedRequests,
      completionRate: totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0,
      avgCompletionTime,
      departmentUsage
    };
  }

  private calculateAverageCompletionTime(requests: any[]): number {
    const completed = requests.filter(r => r.returned_at && r.requested_at);
    if (completed.length === 0) return 0;

    const totalTime = completed.reduce((sum, request) => {
      const start = new Date(request.requested_at).getTime();
      const end = new Date(request.returned_at).getTime();
      return sum + (end - start);
    }, 0);

    return Math.round(totalTime / completed.length / (1000 * 60 * 60)); // hours
  }

  private calculateDepartmentUsage(requests: any[]): Record<string, number> {
    const usage: Record<string, number> = {};
    requests.forEach(request => {
      const dept = request.work_templates?.department || 'Unknown';
      usage[dept] = (usage[dept] || 0) + 1;
    });
    return usage;
  }

  async generateSuggestions(
    workType: string,
    userId: string,
    templateId?: string
  ): Promise<KittingSuggestion[]> {
    try {
      // Get user's recent tool usage
      const { data: recentMovements } = await supabase
        .from('tool_movements')
        .select(`
          tool_id,
          tool:tools(name, status, location)
        `)
        .eq('user_id', userId)
        .eq('action', 'checkout')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (!recentMovements || recentMovements.length === 0) {
        return [{
          toolId: 'demo-tool-1',
          toolName: 'Ferramenta Demo',
          priority: 'recommended',
          confidence: 0.8,
          reason: 'Sugestão baseada no tipo de trabalho',
          available: true,
          location: 'A-01-01-A'
        }];
      }

      const suggestions: KittingSuggestion[] = [];

      // Analyze patterns
      const toolFrequency: Record<string, number> = {};
      recentMovements.forEach(movement => {
        // Handle both single object and array cases from Supabase
        const tool = Array.isArray(movement.tool) ? movement.tool[0] : movement.tool;
        if (tool && tool.name) {
          const toolName = tool.name;
          toolFrequency[toolName] = (toolFrequency[toolName] || 0) + 1;
        }
      });

      // Generate suggestions based on frequency
      const mostUsed = Object.entries(toolFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);

      mostUsed.forEach(([toolName], index) => {
        const movement = recentMovements.find(m => {
          const tool = Array.isArray(m.tool) ? m.tool[0] : m.tool;
          return tool?.name === toolName;
        });
        if (movement && movement.tool) {
          const tool = Array.isArray(movement.tool) ? movement.tool[0] : movement.tool;
          suggestions.push({
            toolId: movement.tool_id,
            toolName: tool.name,
            priority: index === 0 ? 'essential' : 'recommended',
            confidence: 0.9 - (index * 0.1),
            reason: 'Ferramenta frequentemente usada por você',
            available: tool.status === 'available',
            location: tool.location || 'N/A'
          });
        }
      });

      return suggestions.length > 0 ? suggestions : [{
        toolId: 'demo-tool-1',
        toolName: 'Ferramenta Demo',
        priority: 'recommended',
        confidence: 0.7,
        reason: 'Sugestão baseada no padrão de uso',
        available: true,
        location: 'A-01-01-A'
      }];
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [{
        toolId: 'error-tool',
        toolName: 'Erro ao gerar sugestões',
        priority: 'optional',
        confidence: 0.5,
        reason: 'Erro no sistema',
        available: false,
        location: 'N/A'
      }];
    }
  }

  private findCommonCombinations(movements: any[]): string[][] {
    // Simple algorithm to find tools used within the same day
    const dailyUsage: Record<string, string[]> = {};
    
    movements.forEach(movement => {
      const tool = Array.isArray(movement.tool) ? movement.tool[0] : movement.tool;
      if (tool) {
        const date = new Date(movement.timestamp).toDateString();
        if (!dailyUsage[date]) dailyUsage[date] = [];
        dailyUsage[date].push(tool.name);
      }
    });

    const combinations: string[][] = [];
    Object.values(dailyUsage).forEach(tools => {
      if (tools.length > 1) {
        combinations.push([...new Set(tools)]); // Remove duplicates
      }
    });

    return combinations.slice(0, 2); // Return top 2 combinations
  }
}

export const kittingApi = new KittingApiService();


import { KittingSuggestion, WorkTemplateWithItems } from '@/types/kitting';

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

// In-memory stores (will be replaced with real DB)
const templatesStore: WorkTemplate[] = [
  {
    id: '1',
    name: 'Kit Manutenção Básica',
    description: 'Kit para manutenções de rotina',
    required_tools: [],
    estimated_duration: 60,
    department: 'Manutenção',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
const requestsStore: KittingRequest[] = [];
const itemsStore: KittingItem[] = [];
const batchCheckoutsStore: any[] = [];

class KittingApiService {
  // Work Templates
  async createWorkTemplate(template: Omit<WorkTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<WorkTemplate> {
    const newTemplate: WorkTemplate = {
      ...template,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    templatesStore.push(newTemplate);
    return newTemplate;
  }

  async getWorkTemplates(): Promise<WorkTemplate[]> {
    return templatesStore;
  }

  async getTemplates(filters?: { active?: boolean }): Promise<WorkTemplateWithItems[]> {
    let templates = templatesStore;
    
    if (filters?.active) {
      templates = templates.filter(t => t.status === 'active');
    }

    return templates.map((template): WorkTemplateWithItems => ({
      id: template.id,
      name: template.name,
      description: template.description,
      department: template.department,
      priority: 1,
      active: template.status === 'active',
      estimated_duration_minutes: template.estimated_duration,
      category: template.department,
      usage_count: 0,
      success_rate: 1.0,
      created_at: template.created_at,
      updated_at: template.updated_at,
      created_by: '',
      items: []
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
      const newTemplate: WorkTemplate = {
        id: crypto.randomUUID(),
        name: templateData.name,
        description: templateData.description,
        department: templateData.department,
        estimated_duration: templateData.estimatedDuration,
        status: 'active',
        required_tools: templateData.items.map(item => item.toolId),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      templatesStore.push(newTemplate);
      return { success: true, message: 'Template criado com sucesso' };
    } catch (error) {
      console.error('Error creating template:', error);
      return { success: false, message: 'Erro ao criar template' };
    }
  }

  async updateWorkTemplate(id: string, updates: Partial<WorkTemplate>): Promise<WorkTemplate> {
    const index = templatesStore.findIndex(t => t.id === id);
    if (index >= 0) {
      templatesStore[index] = {
        ...templatesStore[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      return templatesStore[index];
    }
    throw new Error('Template not found');
  }

  async deleteWorkTemplate(id: string): Promise<void> {
    const index = templatesStore.findIndex(t => t.id === id);
    if (index >= 0) {
      templatesStore.splice(index, 1);
    }
  }

  // Kitting Requests
  async createKittingRequest(request: Omit<KittingRequest, 'id' | 'requested_at'>): Promise<KittingRequest> {
    const newRequest: KittingRequest = {
      ...request,
      id: crypto.randomUUID(),
      requested_at: new Date().toISOString()
    };
    requestsStore.push(newRequest);
    return newRequest;
  }

  async getKittingRequests(filters?: { status?: string; userId?: string }): Promise<KittingRequest[]> {
    let requests = requestsStore;
    
    if (filters?.status) {
      requests = requests.filter(r => r.status === filters.status);
    }
    if (filters?.userId) {
      requests = requests.filter(r => r.user_id === filters.userId);
    }
    
    return requests;
  }

  async updateKittingRequestStatus(id: string, status: KittingRequest['status']): Promise<KittingRequest> {
    const request = requestsStore.find(r => r.id === id);
    if (!request) throw new Error('Request not found');
    
    request.status = status;
    if (status === 'prepared') request.prepared_at = new Date().toISOString();
    if (status === 'delivered') request.delivered_at = new Date().toISOString();
    if (status === 'returned') request.returned_at = new Date().toISOString();
    
    return request;
  }

  // Kitting Items
  async getKittingItems(requestId: string): Promise<KittingItem[]> {
    return itemsStore.filter(i => i.kitting_request_id === requestId);
  }

  async updateKittingItemStatus(id: string, status: KittingItem['status'], conditionNote?: string): Promise<KittingItem> {
    const item = itemsStore.find(i => i.id === id);
    if (!item) throw new Error('Item not found');
    
    item.status = status;
    if (conditionNote) item.condition_note = conditionNote;
    if (status === 'collected') item.collected_at = new Date().toISOString();
    
    return item;
  }

  // Batch Checkout Methods
  async startBatchCheckout(params: {
    templateId?: string;
    workType: string;
  }, userId: string): Promise<{ success: boolean; batchId?: string; message: string }> {
    try {
      const batch = {
        id: crypto.randomUUID(),
        template_id: params.templateId || null,
        user_id: userId,
        work_type: params.workType,
        status: 'in-progress',
        total_items: 0,
        completed_items: 0,
        started_at: new Date().toISOString(),
        items: []
      };
      batchCheckoutsStore.push(batch);
      return { success: true, batchId: batch.id, message: 'Batch iniciado' };
    } catch (error) {
      console.error('Error starting batch:', error);
      return { success: false, message: 'Erro ao iniciar batch' };
    }
  }

  async addBatchItem(batchId: string, toolId: string, priority: 'essential' | 'recommended' | 'optional'): Promise<{ success: boolean; message: string }> {
    try {
      const batch = batchCheckoutsStore.find(b => b.id === batchId);
      if (batch) {
        batch.items.push({ tool_id: toolId, status: 'pending', priority });
        batch.total_items++;
      }
      return { success: true, message: 'Item adicionado' };
    } catch (error) {
      console.error('Error adding batch item:', error);
      return { success: false, message: 'Erro ao adicionar item' };
    }
  }

  async processBatchItem(batchId: string, toolId: string): Promise<{ success: boolean; message: string }> {
    try {
      const batch = batchCheckoutsStore.find(b => b.id === batchId);
      if (batch) {
        const item = batch.items.find((i: any) => i.tool_id === toolId);
        if (item) {
          item.status = 'checked-out';
          item.checkout_at = new Date().toISOString();
          batch.completed_items++;
        }
      }
      return { success: true, message: 'Item processado' };
    } catch (error) {
      console.error('Error processing batch item:', error);
      return { success: false, message: 'Erro ao processar item' };
    }
  }

  async completeBatchCheckout(batchId: string): Promise<{ success: boolean; message: string }> {
    try {
      const batch = batchCheckoutsStore.find(b => b.id === batchId);
      if (batch) {
        batch.status = 'completed';
        batch.completed_at = new Date().toISOString();
      }
      return { success: true, message: 'Batch completado' };
    } catch (error) {
      console.error('Error completing batch:', error);
      return { success: false, message: 'Erro ao completar batch' };
    }
  }

  // Analytics
  async getKittingAnalytics(days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const requests = requestsStore.filter(r => 
      new Date(r.requested_at) >= startDate
    );

    const totalRequests = requests.length;
    const completedRequests = requests.filter(r => r.status === 'returned').length;

    return {
      totalRequests,
      completedRequests,
      completionRate: totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0,
      avgCompletionTime: 2,
      departmentUsage: {}
    };
  }

  async generateSuggestions(
    workType: string,
    userId: string,
    templateId?: string
  ): Promise<KittingSuggestion[]> {
    return [
      {
        toolId: 'demo-tool-1',
        toolName: 'Chave de Fenda',
        priority: 'essential',
        confidence: 0.95,
        reason: 'Ferramenta frequentemente usada para este tipo de trabalho',
        available: true,
        location: 'A-01-01-A'
      },
      {
        toolId: 'demo-tool-2',
        toolName: 'Multímetro',
        priority: 'recommended',
        confidence: 0.85,
        reason: 'Recomendado para diagnósticos',
        available: true,
        location: 'B-02-03-C'
      }
    ];
  }
}

export const kittingApi = new KittingApiService();

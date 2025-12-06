
import { supabase } from '@/lib/supabase';
import { Alert } from '@/types/database';

export interface CreateAlertRequest {
  type: Alert['type'];
  title: string;
  message: string;
  toolId?: string;
  userId?: string;
  priority?: Alert['priority'];
}

class AlertsApiService {
  // Buscar alertas ativos
  async getActiveAlerts(): Promise<Alert[]> {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          *,
          tools(name),
          users(name, email)
        `)
        .eq('status', 'active')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar alertas:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      return [];
    }
  }

  // Criar novo alerta
  async createAlert(request: CreateAlertRequest): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('alerts')
        .insert({
          type: request.type,
          title: request.title,
          message: request.message,
          tool_id: request.toolId || null,
          user_id: request.userId || null,
          priority: request.priority || 'medium',
          status: 'active'
        });

      if (error) {
        console.error('Erro ao criar alerta:', error);
        return { success: false, message: 'Erro ao criar alerta' };
      }

      return { success: true, message: 'Alerta criado com sucesso' };
    } catch (error) {
      console.error('Erro ao criar alerta:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Marcar alerta como confirmado
  async acknowledgeAlert(alertId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) {
        console.error('Erro ao confirmar alerta:', error);
        return { success: false, message: 'Erro ao confirmar alerta' };
      }

      return { success: true, message: 'Alerta confirmado' };
    } catch (error) {
      console.error('Erro ao confirmar alerta:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Resolver alerta
  async resolveAlert(alertId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) {
        console.error('Erro ao resolver alerta:', error);
        return { success: false, message: 'Erro ao resolver alerta' };
      }

      return { success: true, message: 'Alerta resolvido' };
    } catch (error) {
      console.error('Erro ao resolver alerta:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Verificar ferramentas em atraso (para gerar alertas automáticos)
  async checkOverdueTools(): Promise<void> {
    try {
      // Buscar ferramentas em uso há mais de 24 horas
      const { data: overdueTools, error } = await supabase
        .from('tool_movements')
        .select(`
          *,
          tools(name),
          users(name, email)
        `)
        .eq('action', 'checkout')
        .lt('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Erro ao verificar ferramentas em atraso:', error);
        return;
      }

      // Criar alertas para ferramentas em atraso
      for (const movement of overdueTools || []) {
        await this.createAlert({
          type: 'overdue_return',
          title: 'Ferramenta em Atraso',
          message: `A ferramenta ${movement.tools?.name} está em uso há mais de 24 horas`,
          toolId: movement.tool_id,
          userId: movement.user_id,
          priority: 'high'
        });
      }
    } catch (error) {
      console.error('Erro ao verificar ferramentas em atraso:', error);
    }
  }
}

export const alertsApi = new AlertsApiService();

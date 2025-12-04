import { supabase } from '@/integrations/supabase/client';
import { MaintenanceSchedule } from '@/types/database';

const db = supabase as any;
export interface CreateMaintenanceRequest {
  toolId: string;
  type: MaintenanceSchedule['type'];
  scheduledDate: string;
  technicianId?: string;
  notes?: string;
}

class MaintenanceApiService {
  // Agendar manutenção
  async scheduleMaintenanceService(request: CreateMaintenanceRequest): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('maintenance_schedules')
        .insert({
          tool_id: request.toolId,
          type: request.type,
          scheduled_date: request.scheduledDate,
          technician_id: request.technicianId || null,
          notes: request.notes || null,
          status: 'scheduled'
        });

      if (error) {
        console.error('Erro ao agendar manutenção:', error);
        return { success: false, message: 'Erro ao agendar manutenção' };
      }

      return { success: true, message: 'Manutenção agendada com sucesso' };
    } catch (error) {
      console.error('Erro ao agendar manutenção:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Buscar manutenções agendadas
  async getScheduledMaintenance(): Promise<MaintenanceSchedule[]> {
    try {
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .select(`
          *,
          tools(name, category, location),
          technician:users!technician_id(name, department)
        `)
        .in('status', ['scheduled', 'in-progress'])
        .order('scheduled_date', { ascending: true });

      if (error) {
        console.error('Erro ao buscar manutenções:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar manutenções:', error);
      return [];
    }
  }

  // Iniciar manutenção
  async startMaintenance(maintenanceId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('maintenance_schedules')
        .update({
          status: 'in-progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', maintenanceId);

      if (error) {
        console.error('Erro ao iniciar manutenção:', error);
        return { success: false, message: 'Erro ao iniciar manutenção' };
      }

      return { success: true, message: 'Manutenção iniciada' };
    } catch (error) {
      console.error('Erro ao iniciar manutenção:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Completar manutenção
  async completeMaintenance(
    maintenanceId: string, 
    cost?: number, 
    notes?: string, 
    partsUsed?: any
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('maintenance_schedules')
        .update({
          status: 'completed',
          completed_date: new Date().toISOString(),
          cost: cost || null,
          notes: notes || null,
          parts_used: partsUsed || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', maintenanceId);

      if (error) {
        console.error('Erro ao completar manutenção:', error);
        return { success: false, message: 'Erro ao completar manutenção' };
      }

      return { success: true, message: 'Manutenção completada com sucesso' };
    } catch (error) {
      console.error('Erro ao completar manutenção:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Verificar manutenções preventivas necessárias
  async checkPreventiveMaintenance(): Promise<void> {
    try {
      const { data: tools, error } = await supabase
        .from('tools')
        .select('*')
        .gt('usage_hours', 0)
        .neq('status', 'inactive');

      if (error) {
        console.error('Erro ao verificar manutenções preventivas:', error);
        return;
      }

      for (const tool of tools || []) {
        // Verificar se a ferramenta precisa de manutenção preventiva
        if (tool.usage_hours >= tool.maintenance_interval_hours) {
          // Verificar se já não há manutenção agendada
          const { data: existing } = await supabase
            .from('maintenance_schedules')
            .select('id')
            .eq('tool_id', tool.id)
            .in('status', ['scheduled', 'in-progress'])
            .limit(1);

          if (!existing || existing.length === 0) {
            // Agendar manutenção preventiva
            const scheduledDate = new Date();
            scheduledDate.setDate(scheduledDate.getDate() + 7); // Agendar para daqui a 7 dias

            await this.scheduleMaintenanceService({
              toolId: tool.id,
              type: 'preventive',
              scheduledDate: scheduledDate.toISOString(),
              notes: `Manutenção preventiva automática - ${tool.usage_hours}h de uso`
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar manutenções preventivas:', error);
    }
  }
}

export const maintenanceApi = new MaintenanceApiService();

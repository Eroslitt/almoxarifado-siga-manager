
import { MaintenanceSchedule } from '@/types/database';

export interface CreateMaintenanceRequest {
  toolId: string;
  type: MaintenanceSchedule['type'];
  scheduledDate: string;
  technicianId?: string;
  notes?: string;
}

// In-memory store for maintenance (will be replaced with real DB)
const maintenanceStore: MaintenanceSchedule[] = [];

class MaintenanceApiService {
  // Agendar manutenção
  async scheduleMaintenanceService(request: CreateMaintenanceRequest): Promise<{ success: boolean; message: string }> {
    try {
      const newSchedule: MaintenanceSchedule = {
        id: crypto.randomUUID(),
        tool_id: request.toolId,
        type: request.type,
        scheduled_date: request.scheduledDate,
        completed_date: '',
        status: 'scheduled',
        technician_id: request.technicianId || '',
        cost: 0,
        notes: request.notes || '',
        parts_used: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      maintenanceStore.push(newSchedule);
      return { success: true, message: 'Manutenção agendada com sucesso' };
    } catch (error) {
      console.error('Erro ao agendar manutenção:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Buscar manutenções agendadas
  async getScheduledMaintenance(): Promise<MaintenanceSchedule[]> {
    try {
      return maintenanceStore.filter(m => 
        m.status === 'scheduled' || m.status === 'in-progress'
      );
    } catch (error) {
      console.error('Erro ao buscar manutenções:', error);
      return [];
    }
  }

  // Iniciar manutenção
  async startMaintenance(maintenanceId: string): Promise<{ success: boolean; message: string }> {
    try {
      const maintenance = maintenanceStore.find(m => m.id === maintenanceId);
      if (maintenance) {
        maintenance.status = 'in-progress';
        maintenance.updated_at = new Date().toISOString();
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
      const maintenance = maintenanceStore.find(m => m.id === maintenanceId);
      if (maintenance) {
        maintenance.status = 'completed';
        maintenance.completed_date = new Date().toISOString();
        if (cost) maintenance.cost = cost;
        if (notes) maintenance.notes = notes;
        if (partsUsed) maintenance.parts_used = partsUsed;
        maintenance.updated_at = new Date().toISOString();
      }
      return { success: true, message: 'Manutenção completada com sucesso' };
    } catch (error) {
      console.error('Erro ao completar manutenção:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Verificar manutenções preventivas necessárias
  async checkPreventiveMaintenance(): Promise<void> {
    console.log('Verificando manutenções preventivas...');
  }
}

export const maintenanceApi = new MaintenanceApiService();

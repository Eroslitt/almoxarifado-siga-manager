
import { Alert } from '@/types/database';

export interface CreateAlertRequest {
  type: Alert['type'];
  title: string;
  message: string;
  toolId?: string;
  userId?: string;
  priority?: Alert['priority'];
}

// In-memory store for alerts (will be replaced with real DB when table is created)
const alertsStore: Alert[] = [];

class AlertsApiService {
  // Buscar alertas ativos
  async getActiveAlerts(): Promise<Alert[]> {
    try {
      return alertsStore.filter(alert => alert.status === 'active');
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      return [];
    }
  }

  // Criar novo alerta
  async createAlert(request: CreateAlertRequest): Promise<{ success: boolean; message: string }> {
    try {
      const newAlert: Alert = {
        id: crypto.randomUUID(),
        type: request.type,
        title: request.title,
        message: request.message,
        tool_id: request.toolId || '',
        user_id: request.userId || '',
        priority: request.priority || 'medium',
        status: 'active',
        created_at: new Date().toISOString(),
        acknowledged_at: '',
        resolved_at: ''
      };

      alertsStore.push(newAlert);
      return { success: true, message: 'Alerta criado com sucesso' };
    } catch (error) {
      console.error('Erro ao criar alerta:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Marcar alerta como confirmado
  async acknowledgeAlert(alertId: string): Promise<{ success: boolean; message: string }> {
    try {
      const alert = alertsStore.find(a => a.id === alertId);
      if (alert) {
        alert.status = 'acknowledged';
        alert.acknowledged_at = new Date().toISOString();
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
      const alert = alertsStore.find(a => a.id === alertId);
      if (alert) {
        alert.status = 'resolved';
        alert.resolved_at = new Date().toISOString();
      }
      return { success: true, message: 'Alerta resolvido' };
    } catch (error) {
      console.error('Erro ao resolver alerta:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Verificar ferramentas em atraso (para gerar alertas automáticos)
  async checkOverdueTools(): Promise<void> {
    // Esta função será implementada quando a integração com DB estiver completa
    console.log('Verificando ferramentas em atraso...');
  }
}

export const alertsApi = new AlertsApiService();

import { supabase } from '@/integrations/supabase/client';
import { ToolUsageMetrics, PeriodMetrics, MaintenanceMetrics, Anomaly } from '@/types/sgf-blueprint';

export class RealAnalyticsService {
  // MÉTRICAS DE USO DE FERRAMENTAS
  static async getToolUsageMetrics(): Promise<ToolUsageMetrics[]> {
    try {
      const { data: tools, error } = await supabase
        .from('tools')
        .select(`
          id,
          name,
          status,
          tool_movements (
            movement_type,
            timestamp,
            performed_by_user_id
          )
        `);

      if (error) throw error;
      if (!tools) return [];

      return tools.map(tool => {
        const movements = tool.tool_movements || [];
        const checkouts = movements.filter(m => m.movement_type === 'checkout');
        const checkins = movements.filter(m => m.movement_type === 'checkin');

        // Calcular tempo total de uso
        let totalUsageHours = 0;
        checkouts.forEach(checkout => {
          const checkin = checkins.find(ci => 
            new Date(ci.timestamp) > new Date(checkout.timestamp)
          );
          if (checkin) {
            const hours = (new Date(checkin.timestamp).getTime() - new Date(checkout.timestamp).getTime()) / (1000 * 60 * 60);
            totalUsageHours += hours;
          }
        });

        const averageUsageTime = checkouts.length > 0 ? totalUsageHours / checkouts.length : 0;
        const lastUsed = movements.length > 0 ? movements[movements.length - 1].timestamp : '';
        
        // Usuário mais frequente
        const userUsage = movements.reduce((acc, mov) => {
          if (mov.performed_by_user_id) {
            acc[mov.performed_by_user_id] = (acc[mov.performed_by_user_id] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        const mostFrequentUser = Object.keys(userUsage).length > 0 
          ? Object.entries(userUsage).sort(([,a], [,b]) => b - a)[0][0] 
          : '';

        // Taxa de utilização (estimativa baseada nos checkouts dos últimos 30 dias)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentCheckouts = checkouts.filter(c => new Date(c.timestamp) > thirtyDaysAgo);
        const utilizationRate = Math.min(100, (recentCheckouts.length / 30) * 100);

        return {
          toolId: tool.id,
          toolName: tool.name,
          totalUsageHours: Math.round(totalUsageHours * 10) / 10,
          usageCount: checkouts.length,
          averageUsageTime: Math.round(averageUsageTime * 10) / 10,
          lastUsed,
          mostFrequentUser,
          utilizationRate: Math.round(utilizationRate)
        };
      });
    } catch (error) {
      console.error('Erro ao obter métricas de uso:', error);
      return [];
    }
  }

  // MÉTRICAS POR PERÍODO
  static async getPeriodMetrics(period: 'daily' | 'weekly' | 'monthly'): Promise<PeriodMetrics[]> {
    try {
      let dateFilter: string;
      let groupBy: string;
      const now = new Date();

      switch (period) {
        case 'daily':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          groupBy = 'date';
          break;
        case 'weekly':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          groupBy = 'week';
          break;
        case 'monthly':
          dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
          groupBy = 'month';
          break;
      }

      const { data: movements, error } = await supabase
        .from('tool_movements')
        .select(`
          movement_type,
          timestamp,
          tools (name)
        `)
        .gte('timestamp', dateFilter)
        .order('timestamp');

      if (error) throw error;
      if (!movements) return [];

      // Agrupar por período
      const grouped = movements.reduce((acc, movement) => {
        const date = new Date(movement.timestamp);
        let periodKey: string;

        switch (period) {
          case 'daily':
            periodKey = date.toISOString().split('T')[0];
            break;
          case 'weekly':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            periodKey = weekStart.toISOString().split('T')[0];
            break;
          case 'monthly':
            periodKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            break;
          default:
            periodKey = date.toISOString().split('T')[0];
        }

        if (!acc[periodKey]) {
          acc[periodKey] = {
            period: periodKey,
            totalCheckouts: 0,
            totalCheckins: 0,
            activeTools: new Set(),
            toolUsage: {} as Record<string, number>
          };
        }

        if (movement.movement_type === 'checkout') {
          acc[periodKey].totalCheckouts++;
        } else if (movement.movement_type === 'checkin') {
          acc[periodKey].totalCheckins++;
        }

        if (movement.tools?.name) {
          acc[periodKey].activeTools.add(movement.tools.name);
          acc[periodKey].toolUsage[movement.tools.name] = 
            (acc[periodKey].toolUsage[movement.tools.name] || 0) + 1;
        }

        return acc;
      }, {} as Record<string, any>);

      return Object.values(grouped).map((group: any) => ({
        period: group.period,
        totalCheckouts: group.totalCheckouts,
        totalCheckins: group.totalCheckins,
        activeTools: group.activeTools.size,
        utilizationRate: group.totalCheckouts > 0 ? Math.round((group.totalCheckins / group.totalCheckouts) * 100) : 0,
        topTools: Object.entries(group.toolUsage)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 5)
          .map(([name, usage]) => ({ name, usage: usage as number }))
      }));
    } catch (error) {
      console.error('Erro ao obter métricas por período:', error);
      return [];
    }
  }

  // MÉTRICAS DE MANUTENÇÃO
  static async getMaintenanceMetrics(): Promise<MaintenanceMetrics> {
    try {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const { data: tools, error } = await supabase
        .from('tools')
        .select(`
          id,
          name,
          status,
          last_maintenance,
          next_maintenance,
          maintenance_interval_days,
          purchase_value
        `);

      if (error) throw error;
      if (!tools) {
        return {
          scheduled: 0,
          overdue: 0,
          completed: 0,
          averageCost: 0,
          nextDue: []
        };
      }

      let scheduled = 0;
      let overdue = 0;
      let completed = 0;
      const costs: number[] = [];
      const nextDue: any[] = [];

      tools.forEach(tool => {
        if (tool.status === 'maintenance') {
          scheduled++;
        }

        if (tool.last_maintenance) {
          completed++;
          if (tool.purchase_value) {
            // Estimar custo de manutenção como 5% do valor de compra
            costs.push(tool.purchase_value * 0.05);
          }
        }

        if (tool.next_maintenance) {
          const nextMaintenanceDate = new Date(tool.next_maintenance);
          
          if (nextMaintenanceDate < now) {
            overdue++;
          }

          if (nextMaintenanceDate <= thirtyDaysFromNow) {
            const daysUntilMaintenance = Math.ceil((nextMaintenanceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            nextDue.push({
              toolName: tool.name,
              dueDate: tool.next_maintenance,
              priority: daysUntilMaintenance < 0 ? 'high' : daysUntilMaintenance <= 7 ? 'medium' : 'low'
            });
          }
        }
      });

      const averageCost = costs.length > 0 ? costs.reduce((sum, cost) => sum + cost, 0) / costs.length : 0;

      return {
        scheduled,
        overdue,
        completed,
        averageCost: Math.round(averageCost * 100) / 100,
        nextDue: nextDue.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      };
    } catch (error) {
      console.error('Erro ao obter métricas de manutenção:', error);
      return {
        scheduled: 0,
        overdue: 0,
        completed: 0,
        averageCost: 0,
        nextDue: []
      };
    }
  }

  // DETECÇÃO DE ANOMALIAS
  static async detectAnomalies(): Promise<Anomaly[]> {
    try {
      const anomalies: Anomaly[] = [];
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // 1. Ferramentas com uso excessivo
      const { data: tools, error: toolsError } = await supabase
        .from('tools')
        .select(`
          id,
          name,
          status,
          tool_movements!inner (
            movement_type,
            timestamp
          )
        `);

      if (!toolsError && tools) {
        tools.forEach(tool => {
          const recentMovements = tool.tool_movements.filter(m => 
            new Date(m.timestamp) > sevenDaysAgo
          );
          
          const checkouts = recentMovements.filter(m => m.movement_type === 'checkout');
          
          if (checkouts.length > 20) { // Mais de 20 checkouts em 7 dias
            anomalies.push({
              type: 'unusual_usage',
              severity: 'high',
              description: `Ferramenta "${tool.name}" teve ${checkouts.length} retiradas nos últimos 7 dias`,
              toolId: tool.id,
              recommendation: 'Verificar se há necessidade de ferramentas adicionais ou se há uso inadequado'
            });
          }
        });
      }

      // 2. Ferramentas em posse prolongada
      const { data: inUseTools, error: inUseError } = await supabase
        .from('tools')
        .select(`
          id,
          name,
          tool_movements!inner (
            movement_type,
            timestamp
          )
        `)
        .eq('status', 'in-use');

      if (!inUseError && inUseTools) {
        inUseTools.forEach(tool => {
          const lastCheckout = tool.tool_movements
            .filter(m => m.movement_type === 'checkout')
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

          if (lastCheckout) {
            const daysSinceCheckout = (now.getTime() - new Date(lastCheckout.timestamp).getTime()) / (1000 * 60 * 60 * 24);
            
            if (daysSinceCheckout > 7) {
              anomalies.push({
                type: 'extended_possession',
                severity: daysSinceCheckout > 14 ? 'high' : 'medium',
                description: `Ferramenta "${tool.name}" está em posse há ${Math.round(daysSinceCheckout)} dias`,
                toolId: tool.id,
                recommendation: 'Entrar em contato com o usuário para verificar o status da ferramenta'
              });
            }
          }
        });
      }

      // 3. Manutenções atrasadas
      const { data: maintenanceTools, error: maintenanceError } = await supabase
        .from('tools')
        .select('id, name, next_maintenance')
        .lt('next_maintenance', now.toISOString())
        .neq('status', 'maintenance');

      if (!maintenanceError && maintenanceTools) {
        maintenanceTools.forEach(tool => {
          if (tool.next_maintenance) {
            const daysOverdue = (now.getTime() - new Date(tool.next_maintenance).getTime()) / (1000 * 60 * 60 * 24);
            
            anomalies.push({
              type: 'maintenance_overdue',
              severity: daysOverdue > 30 ? 'high' : 'medium',
              description: `Manutenção da ferramenta "${tool.name}" está atrasada há ${Math.round(daysOverdue)} dias`,
              toolId: tool.id,
              recommendation: 'Programar manutenção imediatamente'
            });
          }
        });
      }

      return anomalies;
    } catch (error) {
      console.error('Erro ao detectar anomalias:', error);
      return [];
    }
  }

  // TENDÊNCIAS DE UTILIZAÇÃO
  static async getUtilizationTrends(): Promise<{ date: string; utilization: number }[]> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const { data: movements, error } = await supabase
        .from('tool_movements')
        .select('movement_type, timestamp')
        .gte('timestamp', thirtyDaysAgo.toISOString())
        .order('timestamp');

      if (error) throw error;
      if (!movements) return [];

      // Agrupar por dia
      const dailyStats = movements.reduce((acc, movement) => {
        const date = movement.timestamp.split('T')[0];
        
        if (!acc[date]) {
          acc[date] = { checkouts: 0, checkins: 0 };
        }

        if (movement.movement_type === 'checkout') {
          acc[date].checkouts++;
        } else if (movement.movement_type === 'checkin') {
          acc[date].checkins++;
        }

        return acc;
      }, {} as Record<string, { checkouts: number; checkins: number }>);

      // Calcular taxa de utilização diária
      return Object.entries(dailyStats).map(([date, stats]) => ({
        date,
        utilization: stats.checkouts > 0 ? Math.round((stats.checkouts / (stats.checkouts + stats.checkins)) * 100) : 0
      })).sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Erro ao obter tendências:', error);
      return [];
    }
  }
}

export const realAnalyticsService = new RealAnalyticsService();
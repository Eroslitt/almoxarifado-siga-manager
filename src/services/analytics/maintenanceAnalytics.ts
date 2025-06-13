
import { advancedCacheService } from '../advancedCacheService';

export interface MaintenanceMetrics {
  scheduled: number;
  overdue: number;
  completed: number;
  averageCost: number;
  nextDue: Array<{
    toolName: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

export class MaintenanceAnalytics {
  async getMaintenanceMetrics(): Promise<MaintenanceMetrics> {
    const cached = await advancedCacheService.get<MaintenanceMetrics>('maintenance-metrics');
    if (cached) return cached;

    const mockMetrics: MaintenanceMetrics = {
      scheduled: 12,
      overdue: 3,
      completed: 45,
      averageCost: 125.50,
      nextDue: [
        {
          toolName: 'Furadeira de Impacto Makita',
          dueDate: '2024-06-20',
          priority: 'high'
        },
        {
          toolName: 'Serra Circular Bosch',
          dueDate: '2024-06-25',
          priority: 'medium'
        },
        {
          toolName: 'Esmerilhadeira Dewalt',
          dueDate: '2024-07-02',
          priority: 'low'
        }
      ]
    };

    await advancedCacheService.set('maintenance-metrics', mockMetrics, 3600); // 1 hour cache
    return mockMetrics;
  }
}

export const maintenanceAnalytics = new MaintenanceAnalytics();

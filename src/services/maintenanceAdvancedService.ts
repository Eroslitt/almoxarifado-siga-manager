
import { advancedCacheService } from './advancedCacheService';
import { notificationService } from './notificationService';

interface MaintenanceTask {
  id: string;
  toolId: string;
  toolName: string;
  type: 'preventive' | 'corrective' | 'inspection';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate: string;
  completedDate?: string;
  assignedTo?: string;
  description: string;
  estimatedDuration: number; // in hours
  actualDuration?: number;
  cost?: number;
  parts?: Array<{
    name: string;
    quantity: number;
    cost: number;
  }>;
  notes?: string;
  attachments?: string[];
}

interface MaintenanceSchedule {
  toolId: string;
  toolName: string;
  lastMaintenance?: string;
  nextMaintenance: string;
  intervalHours: number;
  currentHours: number;
  urgency: 'normal' | 'due_soon' | 'overdue';
}

class MaintenanceAdvancedService {
  async scheduleMaintenace(task: Omit<MaintenanceTask, 'id' | 'status'>): Promise<MaintenanceTask> {
    const newTask: MaintenanceTask = {
      ...task,
      id: `MAINT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'scheduled'
    };

    const existingTasks = await this.getMaintenanceTasks();
    await advancedCacheService.set('maintenance-tasks', [...existingTasks, newTask], 3600);

    // Send notification
    await notificationService.show({
      title: '🔧 Manutenção Agendada',
      body: `${task.toolName} - ${task.description}`,
      tag: 'maintenance-scheduled',
      data: { type: 'maintenance-scheduled', taskId: newTask.id }
    });

    console.log('✅ Maintenance task scheduled:', newTask);
    return newTask;
  }

  async getMaintenanceTasks(status?: MaintenanceTask['status']): Promise<MaintenanceTask[]> {
    const cached = await advancedCacheService.get<MaintenanceTask[]>('maintenance-tasks');
    let tasks = cached || [];

    if (!cached) {
      // Mock maintenance tasks
      tasks = [
        {
          id: 'MAINT-001',
          toolId: 'FER-08172',
          toolName: 'Furadeira de Impacto Makita',
          type: 'preventive',
          status: 'scheduled',
          priority: 'medium',
          scheduledDate: '2024-06-20T09:00:00Z',
          description: 'Limpeza, lubrificação e verificação de componentes',
          estimatedDuration: 2,
          assignedTo: 'Técnico João'
        },
        {
          id: 'MAINT-002',
          toolId: 'FER-09876',
          toolName: 'Serra Circular Bosch',
          type: 'corrective',
          status: 'in_progress',
          priority: 'high',
          scheduledDate: '2024-06-14T08:00:00Z',
          description: 'Substituição da lâmina e ajuste do motor',
          estimatedDuration: 3,
          assignedTo: 'Técnico Maria',
          cost: 150.00,
          parts: [
            { name: 'Lâmina 24 dentes', quantity: 1, cost: 45.00 },
            { name: 'Óleo lubrificante', quantity: 1, cost: 25.00 }
          ]
        }
      ];

      await advancedCacheService.set('maintenance-tasks', tasks, 3600);
    }

    return status ? tasks.filter(task => task.status === status) : tasks;
  }

  async updateTaskStatus(taskId: string, status: MaintenanceTask['status'], data?: Partial<MaintenanceTask>): Promise<void> {
    const tasks = await this.getMaintenanceTasks();
    const updated = tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status, 
            ...data,
            ...(status === 'completed' && { completedDate: new Date().toISOString() })
          }
        : task
    );

    await advancedCacheService.set('maintenance-tasks', updated, 3600);

    const task = updated.find(t => t.id === taskId);
    if (task && status === 'completed') {
      await notificationService.show({
        title: '✅ Manutenção Concluída',
        body: `${task.toolName} - Manutenção finalizada`,
        tag: 'maintenance-completed',
        data: { type: 'maintenance-completed', taskId }
      });
    }
  }

  async getMaintenanceSchedule(): Promise<MaintenanceSchedule[]> {
    const cached = await advancedCacheService.get<MaintenanceSchedule[]>('maintenance-schedule');
    if (cached) return cached;

    // Mock maintenance schedule
    const schedule: MaintenanceSchedule[] = [
      {
        toolId: 'FER-08172',
        toolName: 'Furadeira de Impacto Makita',
        lastMaintenance: '2024-05-10T00:00:00Z',
        nextMaintenance: '2024-06-20T00:00:00Z',
        intervalHours: 200,
        currentHours: 195,
        urgency: 'due_soon'
      },
      {
        toolId: 'FER-09876',
        toolName: 'Serra Circular Bosch',
        lastMaintenance: '2024-04-15T00:00:00Z',
        nextMaintenance: '2024-06-15T00:00:00Z',
        intervalHours: 150,
        currentHours: 160,
        urgency: 'overdue'
      },
      {
        toolId: 'FER-03945',
        toolName: 'Chave de Fenda Philips 6mm',
        nextMaintenance: '2024-12-01T00:00:00Z',
        intervalHours: 500,
        currentHours: 45,
        urgency: 'normal'
      }
    ];

    await advancedCacheService.set('maintenance-schedule', schedule, 1800);
    return schedule;
  }

  async checkOverdueMaintenance(): Promise<void> {
    const schedule = await this.getMaintenanceSchedule();
    const now = new Date();

    for (const item of schedule) {
      const nextMaintenance = new Date(item.nextMaintenance);
      
      if (item.urgency === 'overdue') {
        await notificationService.showMaintenanceAlert(item.toolName, 'overdue');
      } else if (item.urgency === 'due_soon') {
        const daysUntilDue = Math.ceil((nextMaintenance.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue <= 3) {
          await notificationService.showMaintenanceAlert(item.toolName, 'due');
        }
      }
    }
  }

  async getMaintenanceHistory(toolId?: string): Promise<MaintenanceTask[]> {
    const allTasks = await this.getMaintenanceTasks();
    const completed = allTasks.filter(task => task.status === 'completed');
    
    return toolId 
      ? completed.filter(task => task.toolId === toolId)
      : completed;
  }

  async calculateMaintenanceCosts(period: 'monthly' | 'quarterly' | 'yearly'): Promise<{
    totalCost: number;
    averageCost: number;
    taskCount: number;
    breakdown: Array<{
      type: MaintenanceTask['type'];
      cost: number;
      count: number;
    }>;
  }> {
    const history = await this.getMaintenanceHistory();
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarterly':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const periodTasks = history.filter(task => 
      task.completedDate && new Date(task.completedDate) >= startDate
    );

    const totalCost = periodTasks.reduce((sum, task) => sum + (task.cost || 0), 0);
    const taskCount = periodTasks.length;
    const averageCost = taskCount > 0 ? totalCost / taskCount : 0;

    const breakdown = ['preventive', 'corrective', 'inspection'].map(type => ({
      type: type as MaintenanceTask['type'],
      cost: periodTasks
        .filter(task => task.type === type)
        .reduce((sum, task) => sum + (task.cost || 0), 0),
      count: periodTasks.filter(task => task.type === type).length
    }));

    return {
      totalCost,
      averageCost,
      taskCount,
      breakdown
    };
  }
}

export const maintenanceAdvancedService = new MaintenanceAdvancedService();

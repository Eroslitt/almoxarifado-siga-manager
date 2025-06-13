
import { useState, useEffect, useCallback } from 'react';
import { maintenanceAdvancedService } from '@/services/maintenanceAdvancedService';

export const useMaintenance = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [costs, setCosts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async (status?: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await maintenanceAdvancedService.getMaintenanceTasks(status);
      setTasks(data);
    } catch (error) {
      console.error('Error loading maintenance tasks:', error);
      setError('Erro ao carregar tarefas de manutenção');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSchedule = useCallback(async () => {
    try {
      const data = await maintenanceAdvancedService.getMaintenanceSchedule();
      setSchedule(data);
    } catch (error) {
      console.error('Error loading maintenance schedule:', error);
    }
  }, []);

  const loadHistory = useCallback(async (toolId?: string) => {
    try {
      const data = await maintenanceAdvancedService.getMaintenanceHistory(toolId);
      setHistory(data);
    } catch (error) {
      console.error('Error loading maintenance history:', error);
    }
  }, []);

  const loadCosts = useCallback(async (period: 'monthly' | 'quarterly' | 'yearly') => {
    try {
      const data = await maintenanceAdvancedService.calculateMaintenanceCosts(period);
      setCosts(data);
    } catch (error) {
      console.error('Error loading maintenance costs:', error);
    }
  }, []);

  const scheduleTask = useCallback(async (taskData: any) => {
    try {
      await maintenanceAdvancedService.scheduleMaintenace(taskData);
      await loadTasks();
      await loadSchedule();
      return true;
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      setError('Erro ao agendar manutenção');
      return false;
    }
  }, [loadTasks, loadSchedule]);

  const updateTaskStatus = useCallback(async (taskId: string, status: any, data?: any) => {
    try {
      await maintenanceAdvancedService.updateTaskStatus(taskId, status, data);
      await loadTasks();
      await loadHistory();
      return true;
    } catch (error) {
      console.error('Error updating task status:', error);
      setError('Erro ao atualizar status da tarefa');
      return false;
    }
  }, [loadTasks, loadHistory]);

  useEffect(() => {
    loadTasks();
    loadSchedule();
    loadHistory();
    loadCosts('monthly');
    
    // Check for overdue maintenance every 5 minutes
    const interval = setInterval(() => {
      maintenanceAdvancedService.checkOverdueMaintenance();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadTasks, loadSchedule, loadHistory, loadCosts]);

  return {
    tasks,
    schedule,
    history,
    costs,
    isLoading,
    error,
    loadTasks,
    loadSchedule,
    loadHistory,
    loadCosts,
    scheduleTask,
    updateTaskStatus
  };
};

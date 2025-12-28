import { useEffect, useState, useCallback } from 'react';
import { unifiedStorage, StorageStats } from '@/lib/unifiedStorage';
import { syncService, SyncStatus } from '@/services/syncService';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for using unified storage
 */
export function useUnifiedStorage() {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    unifiedStorage.init().then(() => {
      setIsInitialized(true);
      refreshStats();
    });
  }, []);

  const refreshStats = useCallback(async () => {
    const newStats = await unifiedStorage.getStats();
    setStats(newStats);
  }, []);

  const setCache = useCallback(async <T,>(
    key: string,
    data: T,
    expiryMs?: number,
    metadata?: Record<string, any>
  ) => {
    await unifiedStorage.setCache(key, data, expiryMs, metadata);
    refreshStats();
  }, [refreshStats]);

  const getCache = useCallback(async <T,>(key: string): Promise<T | null> => {
    return await unifiedStorage.getCache<T>(key);
  }, []);

  const deleteCache = useCallback(async (key: string) => {
    await unifiedStorage.deleteCache(key);
    refreshStats();
  }, [refreshStats]);

  const addToQueue = useCallback(async (
    action: 'create' | 'update' | 'delete',
    table: string,
    data: any,
    priority?: 'low' | 'medium' | 'high'
  ) => {
    const id = await unifiedStorage.addToQueue(action, table, data, priority);
    refreshStats();
    return id;
  }, [refreshStats]);

  const getQueue = useCallback(async (filterByPriority?: 'low' | 'medium' | 'high') => {
    return await unifiedStorage.getQueue(filterByPriority);
  }, []);

  const setPreference = useCallback(async <T,>(key: string, value: T) => {
    await unifiedStorage.setPreference(key, value);
    refreshStats();
  }, [refreshStats]);

  const getPreference = useCallback(async <T,>(key: string, defaultValue?: T): Promise<T | undefined> => {
    return await unifiedStorage.getPreference<T>(key, defaultValue);
  }, []);

  const performMaintenance = useCallback(async () => {
    const result = await unifiedStorage.performMaintenance();
    refreshStats();
    return result;
  }, [refreshStats]);

  const clearAll = useCallback(async () => {
    await unifiedStorage.clearAll();
    refreshStats();
  }, [refreshStats]);

  return {
    isInitialized,
    stats,
    refreshStats,
    setCache,
    getCache,
    deleteCache,
    addToQueue,
    getQueue,
    setPreference,
    getPreference,
    performMaintenance,
    clearAll,
  };
}

/**
 * Hook for managing sync operations
 */
export function useSync(autoStart: boolean = true) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: 'idle',
    message: 'Not started',
  });
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to sync status updates
    const unsubscribe = syncService.addListener((status) => {
      setSyncStatus(status);

      // Show toast for important status changes
      if (status.status === 'error') {
        toast({
          title: 'Erro de Sincronização',
          description: status.message,
          variant: 'destructive',
        });
      } else if (status.status === 'success' && status.synced && status.synced > 0) {
        toast({
          title: 'Sincronização Concluída',
          description: `${status.synced} item(ns) sincronizado(s)`,
        });
      }
    });

    // Start auto-sync if requested
    if (autoStart) {
      syncService.startAutoSync();
      setIsActive(true);
    }

    // Get initial status
    const initialStatus = syncService.getSyncStatus();
    setIsActive(initialStatus.isActive);

    return () => {
      unsubscribe();
      if (autoStart) {
        syncService.stopAutoSync();
      }
    };
  }, [autoStart, toast]);

  const startSync = useCallback((intervalMs?: number) => {
    syncService.startAutoSync(intervalMs);
    setIsActive(true);
  }, []);

  const stopSync = useCallback(() => {
    syncService.stopAutoSync();
    setIsActive(false);
  }, []);

  const forceSync = useCallback(async () => {
    return await syncService.forceSync();
  }, []);

  return {
    syncStatus,
    isActive,
    startSync,
    stopSync,
    forceSync,
  };
}

/**
 * Hook for offline-first operations with automatic queueing
 */
export function useOfflineFirst() {
  const { addToQueue } = useUnifiedStorage();
  const { forceSync } = useSync(false);
  const { toast } = useToast();

  const executeOfflineFirst = useCallback(async <T,>(
    operation: () => Promise<T>,
    fallback: {
      action: 'create' | 'update' | 'delete';
      table: string;
      data: any;
      priority?: 'low' | 'medium' | 'high';
    }
  ): Promise<{ success: boolean; data?: T; queued?: boolean }> => {
    try {
      // Try online operation first
      if (navigator.onLine) {
        const result = await operation();
        return { success: true, data: result };
      }

      // If offline, queue the operation
      await addToQueue(
        fallback.action,
        fallback.table,
        fallback.data,
        fallback.priority
      );

      toast({
        title: 'Operação em Fila',
        description: 'Você está offline. A operação será sincronizada quando voltar online.',
      });

      return { success: true, queued: true };
      
    } catch (error) {
      console.error('Operation failed, queueing for later:', error);

      // Queue on error as well
      await addToQueue(
        fallback.action,
        fallback.table,
        fallback.data,
        fallback.priority
      );

      toast({
        title: 'Operação em Fila',
        description: 'Houve um erro. A operação será tentada novamente automaticamente.',
        variant: 'default',
      });

      return { success: true, queued: true };
    }
  }, [addToQueue, toast]);

  return {
    executeOfflineFirst,
    forceSync,
  };
}

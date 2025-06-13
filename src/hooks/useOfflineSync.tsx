
import { useEffect, useState, useCallback } from 'react';
import { advancedCacheService } from '@/services/advancedCacheService';
import { notificationService } from '@/services/notificationService';

interface OfflineAction {
  id: string;
  type: 'checkout' | 'checkin' | 'update';
  data: any;
  timestamp: number;
  retries: number;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    console.log('🌐 Connection restored, syncing pending actions...');
    syncPendingActions();
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    console.log('📱 Offline mode activated');
    notificationService.show({
      title: '📱 Modo Offline',
      body: 'Operações serão sincronizadas quando a conexão for restaurada',
      tag: 'offline-mode'
    });
  }, []);

  const addPendingAction = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp' | 'retries'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      retries: 0
    };

    setPendingActions(prev => [...prev, newAction]);
    
    // Store in cache for persistence
    advancedCacheService.set('pending-actions', [...pendingActions, newAction], 86400); // 24 hours
    
    console.log('📝 Action queued for offline sync:', newAction);
  }, [pendingActions]);

  const syncPendingActions = useCallback(async () => {
    if (!isOnline || pendingActions.length === 0 || isSyncing) return;

    setIsSyncing(true);
    
    try {
      const results = await Promise.allSettled(
        pendingActions.map(async (action) => {
          // Simulate API call - replace with actual service calls
          await new Promise(resolve => setTimeout(resolve, 1000));
          return action;
        })
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (successful > 0) {
        setPendingActions([]);
        advancedCacheService.invalidate('pending-actions');
        
        notificationService.show({
          title: '✅ Sincronização Completa',
          body: `${successful} operações sincronizadas com sucesso`,
          tag: 'sync-complete'
        });
      }

      if (failed > 0) {
        console.warn(`⚠️ ${failed} actions failed to sync`);
      }

    } catch (error) {
      console.error('❌ Error during sync:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, pendingActions, isSyncing]);

  const loadPendingActions = useCallback(async () => {
    const cached = await advancedCacheService.get<OfflineAction[]>('pending-actions');
    if (cached && cached.length > 0) {
      setPendingActions(cached);
      console.log(`📋 Loaded ${cached.length} pending actions from cache`);
    }
  }, []);

  useEffect(() => {
    // Load pending actions from cache on startup
    loadPendingActions();

    // Set up online/offline listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline, loadPendingActions]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      const timer = setTimeout(syncPendingActions, 2000); // Wait 2 seconds after coming online
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingActions.length, syncPendingActions]);

  return {
    isOnline,
    pendingActions: pendingActions.length,
    isSyncing,
    addPendingAction,
    syncPendingActions,
    hasPendingActions: pendingActions.length > 0
  };
};


import { useEffect, useCallback } from 'react';
import { useToolsContext } from '@/contexts/ToolsContext';
import { blueprintToolsService } from '@/services/blueprintToolsService';
import { cacheService } from '@/services/cacheService';
import { notificationService } from '@/services/notificationService';

export const useToolsServices = () => {
  const { state, actions } = useToolsContext();

  const initializeServices = useCallback(async () => {
    actions.setLoading(true);
    actions.setError(null);

    try {
      console.log('🚀 Initializing Tools Services...');
      
      // Initialize services in parallel
      await Promise.all([
        cacheService.init(),
        notificationService.init()
      ]);

      // Load initial stats from cache or API
      const cachedStats = await cacheService.get('tools-stats');
      if (cachedStats) {
        actions.setStats(cachedStats);
      } else {
        // Mock stats - in production would come from API
        const mockStats = {
          total: 145,
          available: 98,
          inUse: 35,
          maintenance: 12
        };
        actions.setStats(mockStats);
        cacheService.set('tools-stats', mockStats, 300); // 5 minutes cache
      }

      // Load live status
      const liveStatus = await blueprintToolsService.obterStatusAoVivo();
      actions.setLiveStatus(liveStatus);

      console.log('✅ Tools services initialized successfully');
      
      await notificationService.show({
        title: '🔧 SGF-QR Pronto',
        body: 'Sistema de ferramentas carregado com sucesso',
        tag: 'tools-initialized'
      });

    } catch (error) {
      console.error('❌ Error initializing tools services:', error);
      actions.setError('Erro ao inicializar serviços de ferramentas');
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  const refreshData = useCallback(async () => {
    try {
      const liveStatus = await blueprintToolsService.obterStatusAoVivo();
      actions.setLiveStatus(liveStatus);
      
      // Update cache
      cacheService.set('tools-live-status', liveStatus, 60); // 1 minute cache
    } catch (error) {
      console.error('Error refreshing tools data:', error);
    }
  }, [actions]);

  const getPerformanceStats = useCallback(() => {
    return blueprintToolsService.getPerformanceStats();
  }, []);

  return {
    state,
    actions,
    initializeServices,
    refreshData,
    getPerformanceStats,
    isInitialized: !state.isLoading && state.lastUpdate !== null
  };
};

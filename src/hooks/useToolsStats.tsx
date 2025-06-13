
import { useCallback, useMemo } from 'react';
import { useToolsContext } from '@/contexts/ToolsContext';
import { BlueprintLiveStatus } from '@/types/sgf-blueprint';

export const useToolsStats = () => {
  const { state } = useToolsContext();

  const calculateStatsFromLiveData = useCallback((liveData: BlueprintLiveStatus[]) => {
    const stats = liveData.reduce(
      (acc, tool) => {
        acc.total++;
        switch (tool.status) {
          case 'DISPONÍVEL':
            acc.available++;
            break;
          case 'EM USO':
            acc.inUse++;
            break;
          case 'EM MANUTENÇÃO':
            acc.maintenance++;
            break;
        }
        return acc;
      },
      { total: 0, available: 0, inUse: 0, maintenance: 0 }
    );
    
    return stats;
  }, []);

  const currentStats = useMemo(() => {
    if (state.liveStatus.length > 0) {
      return calculateStatsFromLiveData(state.liveStatus);
    }
    return state.stats;
  }, [state.liveStatus, state.stats, calculateStatsFromLiveData]);

  const utilizationRate = useMemo(() => {
    if (currentStats.total === 0) return 0;
    return Math.round((currentStats.inUse / currentStats.total) * 100);
  }, [currentStats]);

  const availabilityRate = useMemo(() => {
    if (currentStats.total === 0) return 0;
    return Math.round((currentStats.available / currentStats.total) * 100);
  }, [currentStats]);

  const maintenanceRate = useMemo(() => {
    if (currentStats.total === 0) return 0;
    return Math.round((currentStats.maintenance / currentStats.total) * 100);
  }, [currentStats]);

  const getToolsByStatus = useCallback((status: 'DISPONÍVEL' | 'EM USO' | 'EM MANUTENÇÃO') => {
    return state.liveStatus.filter(tool => tool.status === status);
  }, [state.liveStatus]);

  const getMostUsedTools = useCallback(() => {
    return state.liveStatus
      .filter(tool => tool.status === 'EM USO')
      .sort((a, b) => {
        // Sort by possession time (longest first)
        if (!a.tempo_posse || !b.tempo_posse) return 0;
        return b.tempo_posse.localeCompare(a.tempo_posse);
      });
  }, [state.liveStatus]);

  return {
    stats: currentStats,
    utilizationRate,
    availabilityRate,
    maintenanceRate,
    getToolsByStatus,
    getMostUsedTools,
    isLoading: state.isLoading,
    lastUpdate: state.lastUpdate
  };
};

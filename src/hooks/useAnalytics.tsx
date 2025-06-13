
import { useCallback } from 'react';
import { useGlobalContext } from '@/contexts/GlobalContext';
import { analyticsService } from '@/services/analyticsService';
import { eventBus } from '@/services/eventBus';

export const useAnalytics = () => {
  const { state, actions } = useGlobalContext();
  const { analytics } = state;

  const loadUsageMetrics = useCallback(async () => {
    try {
      actions.updateAnalytics({ isLoading: true });
      const data = await analyticsService.getToolUsageMetrics();
      actions.updateAnalytics({ 
        usageMetrics: data, 
        isLoading: false, 
        lastRefresh: new Date() 
      });
    } catch (error) {
      console.error('Error loading usage metrics:', error);
      actions.updateAnalytics({ isLoading: false });
    }
  }, [actions]);

  const loadPeriodMetrics = useCallback(async (period: 'daily' | 'weekly' | 'monthly') => {
    try {
      const data = await analyticsService.getPeriodMetrics(period);
      actions.updateAnalytics({ periodMetrics: data });
    } catch (error) {
      console.error('Error loading period metrics:', error);
    }
  }, [actions]);

  const loadMaintenanceMetrics = useCallback(async () => {
    try {
      const data = await analyticsService.getMaintenanceMetrics();
      actions.updateAnalytics({ maintenanceMetrics: data });
    } catch (error) {
      console.error('Error loading maintenance metrics:', error);
    }
  }, [actions]);

  const detectAnomalies = useCallback(async () => {
    try {
      const data = await analyticsService.detectAnomalies();
      actions.updateAnalytics({ anomalies: data });
      
      // Emit events for high-priority anomalies
      data.filter(anomaly => anomaly.severity === 'high').forEach(anomaly => {
        eventBus.emit('anomaly:detected', {
          type: anomaly.type,
          severity: anomaly.severity,
          toolId: anomaly.toolId
        });
      });
    } catch (error) {
      console.error('Error detecting anomalies:', error);
    }
  }, [actions]);

  const loadTrends = useCallback(async () => {
    try {
      const data = await analyticsService.getUtilizationTrends();
      actions.updateAnalytics({ trends: data });
    } catch (error) {
      console.error('Error loading trends:', error);
    }
  }, [actions]);

  const generateReport = useCallback(async (type: 'usage' | 'maintenance' | 'efficiency', format: 'pdf' | 'excel') => {
    actions.updateAnalytics({ isLoading: true });
    
    try {
      const blob = await analyticsService.generateReport(type, format);
      
      // Download the report
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${type}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Emit success event
      eventBus.emit('system:report:generated', {
        type,
        format,
        timestamp: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Error generating report:', error);
      return false;
    } finally {
      actions.updateAnalytics({ isLoading: false });
    }
  }, [actions]);

  // Auto-load data on mount if not already loaded
  React.useEffect(() => {
    if (analytics.usageMetrics.length === 0 && !analytics.isLoading) {
      loadUsageMetrics();
      loadPeriodMetrics('daily');
      loadMaintenanceMetrics();
      detectAnomalies();
      loadTrends();
    }
  }, [loadUsageMetrics, loadPeriodMetrics, loadMaintenanceMetrics, detectAnomalies, loadTrends, analytics.usageMetrics.length, analytics.isLoading]);

  return {
    usageMetrics: analytics.usageMetrics,
    periodMetrics: analytics.periodMetrics,
    maintenanceMetrics: analytics.maintenanceMetrics,
    anomalies: analytics.anomalies,
    trends: analytics.trends,
    isLoading: analytics.isLoading,
    loadUsageMetrics,
    loadPeriodMetrics,
    loadMaintenanceMetrics,
    detectAnomalies,
    loadTrends,
    generateReport
  };
};


import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '@/services/analyticsService';

export const useAnalytics = () => {
  const [usageMetrics, setUsageMetrics] = useState<any[]>([]);
  const [periodMetrics, setPeriodMetrics] = useState<any[]>([]);
  const [maintenanceMetrics, setMaintenanceMetrics] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadUsageMetrics = useCallback(async () => {
    try {
      const data = await analyticsService.getToolUsageMetrics();
      setUsageMetrics(data);
    } catch (error) {
      console.error('Error loading usage metrics:', error);
    }
  }, []);

  const loadPeriodMetrics = useCallback(async (period: 'daily' | 'weekly' | 'monthly') => {
    try {
      const data = await analyticsService.getPeriodMetrics(period);
      setPeriodMetrics(data);
    } catch (error) {
      console.error('Error loading period metrics:', error);
    }
  }, []);

  const loadMaintenanceMetrics = useCallback(async () => {
    try {
      const data = await analyticsService.getMaintenanceMetrics();
      setMaintenanceMetrics(data);
    } catch (error) {
      console.error('Error loading maintenance metrics:', error);
    }
  }, []);

  const detectAnomalies = useCallback(async () => {
    try {
      const data = await analyticsService.detectAnomalies();
      setAnomalies(data);
    } catch (error) {
      console.error('Error detecting anomalies:', error);
    }
  }, []);

  const loadTrends = useCallback(async () => {
    try {
      const data = await analyticsService.getUtilizationTrends();
      setTrends(data);
    } catch (error) {
      console.error('Error loading trends:', error);
    }
  }, []);

  const generateReport = useCallback(async (type: 'usage' | 'maintenance' | 'efficiency', format: 'pdf' | 'excel') => {
    setIsLoading(true);
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
      
      return true;
    } catch (error) {
      console.error('Error generating report:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsageMetrics();
    loadPeriodMetrics('daily');
    loadMaintenanceMetrics();
    detectAnomalies();
    loadTrends();
  }, [loadUsageMetrics, loadPeriodMetrics, loadMaintenanceMetrics, detectAnomalies, loadTrends]);

  return {
    usageMetrics,
    periodMetrics,
    maintenanceMetrics,
    anomalies,
    trends,
    isLoading,
    loadUsageMetrics,
    loadPeriodMetrics,
    loadMaintenanceMetrics,
    detectAnomalies,
    loadTrends,
    generateReport
  };
};

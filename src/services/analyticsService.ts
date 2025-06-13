
import { toolUsageAnalytics, ToolUsageMetrics } from './analytics/toolUsageAnalytics';
import { periodAnalytics, PeriodMetrics } from './analytics/periodAnalytics';
import { maintenanceAnalytics, MaintenanceMetrics } from './analytics/maintenanceAnalytics';
import { anomalyDetection, Anomaly } from './analytics/anomalyDetection';
import { reportGenerator } from './analytics/reportGenerator';

class AnalyticsService {
  async getToolUsageMetrics(): Promise<ToolUsageMetrics[]> {
    return toolUsageAnalytics.getToolUsageMetrics();
  }

  async getPeriodMetrics(period: 'daily' | 'weekly' | 'monthly'): Promise<PeriodMetrics[]> {
    return periodAnalytics.getPeriodMetrics(period);
  }

  async getMaintenanceMetrics(): Promise<MaintenanceMetrics> {
    return maintenanceAnalytics.getMaintenanceMetrics();
  }

  async generateReport(type: 'usage' | 'maintenance' | 'efficiency', format: 'pdf' | 'excel'): Promise<Blob> {
    return reportGenerator.generateReport(type, format);
  }

  async detectAnomalies(): Promise<Anomaly[]> {
    return anomalyDetection.detectAnomalies();
  }

  async getUtilizationTrends(): Promise<Array<{
    date: string;
    utilization: number;
    trend: 'up' | 'down' | 'stable';
  }>> {
    return toolUsageAnalytics.getUtilizationTrends();
  }
}

export const analyticsService = new AnalyticsService();


import { toolUsageAnalytics } from './toolUsageAnalytics';

export interface Anomaly {
  type: 'unusual_usage' | 'extended_possession' | 'maintenance_overdue';
  severity: 'low' | 'medium' | 'high';
  description: string;
  toolId?: string;
  recommendation: string;
}

export class AnomalyDetection {
  async detectAnomalies(): Promise<Anomaly[]> {
    const metrics = await toolUsageAnalytics.getToolUsageMetrics();
    const anomalies: Anomaly[] = [];

    // Detect unusual usage patterns
    for (const metric of metrics) {
      if (metric.utilizationRate > 95) {
        anomalies.push({
          type: 'unusual_usage',
          severity: 'high',
          description: `${metric.toolName} tem utilização excessiva (${metric.utilizationRate}%)`,
          toolId: metric.toolId,
          recommendation: 'Considere adquirir ferramentas adicionais ou revisar cronograma'
        });
      }

      if (metric.averageUsageTime > 8) {
        anomalies.push({
          type: 'extended_possession',
          severity: 'medium',
          description: `${metric.toolName} tem tempo médio de posse elevado (${metric.averageUsageTime}h)`,
          toolId: metric.toolId,
          recommendation: 'Verificar se a ferramenta está sendo devolvida adequadamente'
        });
      }
    }

    return anomalies;
  }
}

export const anomalyDetection = new AnomalyDetection();

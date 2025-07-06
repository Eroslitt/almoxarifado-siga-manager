interface PerformanceMetrics {
  timestamp: number;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  throughput: number;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  issues: string[];
  recommendations: string[];
}

class PerformanceService {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxDataPoints = 100;

  constructor() {
    this.startMetricsCollection();
  }

  private startMetricsCollection() {
    // Simulate real-time metrics collection
    setInterval(() => {
      const metric: PerformanceMetrics = {
        timestamp: Date.now(),
        responseTime: Math.random() * 500 + 50, // 50-550ms
        memoryUsage: Math.random() * 30 + 40, // 40-70%
        cpuUsage: Math.random() * 40 + 20, // 20-60%
        activeConnections: Math.floor(Math.random() * 50) + 10,
        throughput: Math.random() * 1000 + 500 // 500-1500 req/min
      };

      this.metrics.push(metric);
      
      // Keep only last N data points
      if (this.metrics.length > this.maxDataPoints) {
        this.metrics = this.metrics.slice(-this.maxDataPoints);
      }
    }, 5000);
  }

  getRealtimeMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }

  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  getSystemHealth(): SystemHealth {
    const current = this.getCurrentMetrics();
    if (!current) {
      return {
        status: 'warning',
        score: 0,
        issues: ['Sem dados de métricas disponíveis'],
        recommendations: ['Aguarde a coleta de dados iniciar']
      };
    }

    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Analyze response time
    if (current.responseTime > 300) {
      issues.push('Tempo de resposta elevado');
      recommendations.push('Otimizar consultas de database');
      score -= 20;
    }

    // Analyze memory usage
    if (current.memoryUsage > 80) {
      issues.push('Uso de memória crítico');
      recommendations.push('Implementar limpeza de cache');
      score -= 30;
    } else if (current.memoryUsage > 60) {
      issues.push('Uso de memória alto');
      recommendations.push('Monitorar crescimento de memória');
      score -= 10;
    }

    // Analyze CPU usage
    if (current.cpuUsage > 70) {
      issues.push('Uso de CPU crítico');
      recommendations.push('Otimizar processamento');
      score -= 25;
    } else if (current.cpuUsage > 50) {
      issues.push('Uso de CPU elevado');
      recommendations.push('Considerar scaling horizontal');
      score -= 10;
    }

    const status: SystemHealth['status'] = 
      score >= 80 ? 'healthy' : 
      score >= 60 ? 'warning' : 'critical';

    return {
      status,
      score: Math.max(score, 0),
      issues,
      recommendations
    };
  }

  getAverageMetrics(timeRange: '1h' | '6h' | '24h' = '1h'): Partial<PerformanceMetrics> {
    const now = Date.now();
    const ranges = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000
    };

    const cutoff = now - ranges[timeRange];
    const relevantMetrics = this.metrics.filter(m => m.timestamp >= cutoff);

    if (relevantMetrics.length === 0) return {};

    const sum = relevantMetrics.reduce((acc, metric) => ({
      responseTime: acc.responseTime + metric.responseTime,
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
      cpuUsage: acc.cpuUsage + metric.cpuUsage,
      activeConnections: acc.activeConnections + metric.activeConnections,
      throughput: acc.throughput + metric.throughput
    }), {
      responseTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      activeConnections: 0,
      throughput: 0
    });

    const count = relevantMetrics.length;
    return {
      responseTime: Math.round(sum.responseTime / count),
      memoryUsage: Math.round(sum.memoryUsage / count),
      cpuUsage: Math.round(sum.cpuUsage / count),
      activeConnections: Math.round(sum.activeConnections / count),
      throughput: Math.round(sum.throughput / count)
    };
  }

  generatePerformanceReport(): {
    summary: string;
    metrics: Partial<PerformanceMetrics>;
    health: SystemHealth;
    trends: {
      responseTime: 'improving' | 'stable' | 'degrading';
      memoryUsage: 'improving' | 'stable' | 'degrading';
      cpuUsage: 'improving' | 'stable' | 'degrading';
    };
  } {
    const current = this.getCurrentMetrics();
    const averages = this.getAverageMetrics('24h');
    const health = this.getSystemHealth();

    const trends = {
      responseTime: this.calculateTrend('responseTime'),
      memoryUsage: this.calculateTrend('memoryUsage'),
      cpuUsage: this.calculateTrend('cpuUsage')
    };

    const summary = `Sistema ${health.status === 'healthy' ? 'saudável' : 
                      health.status === 'warning' ? 'com alertas' : 'crítico'} 
                     com pontuação ${health.score}/100. 
                     ${health.issues.length} problema(s) identificado(s).`;

    return {
      summary,
      metrics: averages,
      health,
      trends
    };
  }

  private calculateTrend(metric: keyof PerformanceMetrics): 'improving' | 'stable' | 'degrading' {
    if (this.metrics.length < 10) return 'stable';

    const recent = this.metrics.slice(-5);
    const older = this.metrics.slice(-10, -5);

    const recentAvg = recent.reduce((sum, m) => sum + (m[metric] as number), 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + (m[metric] as number), 0) / older.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (Math.abs(change) < 5) return 'stable';
    
    // For response time, memory, and CPU - lower is better
    if (['responseTime', 'memoryUsage', 'cpuUsage'].includes(metric)) {
      return change < 0 ? 'improving' : 'degrading';
    } else {
      return change > 0 ? 'improving' : 'degrading';
    }
  }
}

export const performanceService = new PerformanceService();

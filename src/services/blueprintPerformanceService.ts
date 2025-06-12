
interface PerformanceMetrics {
  operationType: 'RETIRADA' | 'DEVOLUÇÃO' | 'CONSULTA';
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  errorType?: string;
}

class BlueprintPerformanceService {
  private metrics: PerformanceMetrics[] = [];
  private readonly MAX_METRICS = 1000; // Manter apenas os últimos 1000 registros

  startOperation(operationType: 'RETIRADA' | 'DEVOLUÇÃO' | 'CONSULTA'): string {
    const operationId = `${operationType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Usar performance.now() para precisão em milissegundos
    const startTime = performance.now();
    
    // Armazenar temporariamente
    (globalThis as any)[`perf_${operationId}`] = {
      operationType,
      startTime
    };
    
    return operationId;
  }

  endOperation(operationId: string, success: boolean, errorType?: string): number {
    const operationData = (globalThis as any)[`perf_${operationId}`];
    
    if (!operationData) {
      console.warn('Performance: Operação não encontrada:', operationId);
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - operationData.startTime;

    const metric: PerformanceMetrics = {
      operationType: operationData.operationType,
      startTime: operationData.startTime,
      endTime,
      duration,
      success,
      errorType
    };

    this.addMetric(metric);
    
    // Limpar dados temporários
    delete (globalThis as any)[`perf_${operationId}`];
    
    console.log(`⚡ Performance SGF-QR: ${operationData.operationType} executada em ${duration.toFixed(2)}ms`);
    
    return duration;
  }

  private addMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Manter apenas os últimos registros
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }
  }

  getStatistics(): {
    totalOperations: number;
    averageResponseTime: number;
    successRate: number;
    fastestOperation: number;
    slowestOperation: number;
    operationsByType: Record<string, number>;
    last24Hours: PerformanceMetrics[];
  } {
    if (this.metrics.length === 0) {
      return {
        totalOperations: 0,
        averageResponseTime: 0,
        successRate: 0,
        fastestOperation: 0,
        slowestOperation: 0,
        operationsByType: {},
        last24Hours: []
      };
    }

    const now = Date.now();
    const last24Hours = this.metrics.filter(m => 
      (now - m.endTime) < 24 * 60 * 60 * 1000 // 24 horas
    );

    const durations = this.metrics.map(m => m.duration);
    const successfulOps = this.metrics.filter(m => m.success).length;
    
    const operationsByType = this.metrics.reduce((acc, metric) => {
      acc[metric.operationType] = (acc[metric.operationType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOperations: this.metrics.length,
      averageResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
      successRate: (successfulOps / this.metrics.length) * 100,
      fastestOperation: Math.min(...durations),
      slowestOperation: Math.max(...durations),
      operationsByType,
      last24Hours
    };
  }

  // Verificar se o sistema está respondendo dentro do SLA (< 500ms)
  isPerformanceHealthy(): boolean {
    const stats = this.getStatistics();
    return stats.averageResponseTime < 500 && stats.successRate > 95;
  }

  // Relatório detalhado para gestores
  generatePerformanceReport(): string {
    const stats = this.getStatistics();
    
    return `
📊 RELATÓRIO DE PERFORMANCE - SGF-QR v2.0
═══════════════════════════════════════════

📈 Estatísticas Gerais:
   • Total de Operações: ${stats.totalOperations}
   • Tempo Médio de Resposta: ${stats.averageResponseTime.toFixed(2)}ms
   • Taxa de Sucesso: ${stats.successRate.toFixed(1)}%
   • Operação Mais Rápida: ${stats.fastestOperation.toFixed(2)}ms
   • Operação Mais Lenta: ${stats.slowestOperation.toFixed(2)}ms

🔄 Por Tipo de Operação:
${Object.entries(stats.operationsByType)
  .map(([type, count]) => `   • ${type}: ${count} operações`)
  .join('\n')}

🎯 Status do SLA:
   • Meta: < 500ms com 95%+ sucesso
   • Status: ${this.isPerformanceHealthy() ? '✅ SAUDÁVEL' : '⚠️ ATENÇÃO NECESSÁRIA'}

⏰ Últimas 24 Horas: ${stats.last24Hours.length} operações
    `;
  }

  // Limpar métricas antigas
  clearOldMetrics(): void {
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 dias
    this.metrics = this.metrics.filter(m => m.endTime > cutoff);
    console.log('🧹 Métricas antigas limpas, mantidos:', this.metrics.length, 'registros');
  }
}

export const blueprintPerformanceService = new BlueprintPerformanceService();

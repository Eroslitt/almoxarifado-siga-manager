
import { BlueprintOperationRequest, BlueprintOperationResponse, BlueprintLiveStatus } from '@/types/sgf-blueprint';
import { blueprintPerformanceService } from './blueprintPerformanceService';
import { BlueprintOperations } from './blueprint/blueprintOperations';
import { BlueprintStatusService } from './blueprint/blueprintStatusService';

// SGF-QR v2.0 - Serviço Core Conforme Blueprint com Performance Otimizada
class BlueprintToolsService {
  
  // PROCESSO DE RETIRADA (Checkout) - Conforme Blueprint com Métricas
  async processarRetirada(request: BlueprintOperationRequest): Promise<BlueprintOperationResponse> {
    return BlueprintOperations.processarRetirada(request);
  }

  // PROCESSO DE DEVOLUÇÃO (Check-in) - Conforme Blueprint com Métricas
  async processarDevolucao(request: BlueprintOperationRequest, observacao?: string): Promise<BlueprintOperationResponse> {
    return BlueprintOperations.processarDevolucao(request, observacao);
  }

  // OPERAÇÃO INTELIGENTE - Detecta automaticamente se é retirada ou devolução
  async processarOperacaoAutomatica(request: BlueprintOperationRequest): Promise<BlueprintOperationResponse> {
    return BlueprintOperations.processarOperacaoAutomatica(request);
  }

  // PAINEL AO VIVO - Conforme Blueprint com Performance
  async obterStatusAoVivo(): Promise<BlueprintLiveStatus[]> {
    return BlueprintStatusService.obterStatusAoVivo();
  }

  // Método para obter estatísticas de performance
  getPerformanceStats() {
    return blueprintPerformanceService.getStatistics();
  }

  // Método para gerar relatório de performance
  generatePerformanceReport(): string {
    return blueprintPerformanceService.generatePerformanceReport();
  }
}

export const blueprintToolsService = new BlueprintToolsService();

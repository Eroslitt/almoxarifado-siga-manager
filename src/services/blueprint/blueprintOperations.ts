
import { supabase } from '@/integrations/supabase/client';
import { BlueprintOperationRequest, BlueprintOperationResponse } from '@/types/sgf-blueprint';
import { blueprintPerformanceService } from '../blueprintPerformanceService';
import { blueprintWebSocketService } from '../blueprintWebSocketService';
import { BlueprintUtils } from './blueprintUtils';
import { BlueprintMockData } from './blueprintMockData';

// Check if we're in demo mode (no real DB tables yet)
const isDemoMode = true;

export class BlueprintOperations {
  // PROCESSO DE RETIRADA (Checkout) - Conforme Blueprint com Métricas
  static async processarRetirada(request: BlueprintOperationRequest): Promise<BlueprintOperationResponse> {
    const perfId = blueprintPerformanceService.startOperation('RETIRADA');
    console.log('🔄 Processando RETIRADA conforme blueprint:', request);

    try {
      // Use mock data for now
      const result = BlueprintMockData.mockRetirada(request);
      blueprintPerformanceService.endOperation(perfId, true);
      
      // Broadcast da mudança via WebSocket
      blueprintWebSocketService.broadcastStatusChange({
        ferramenta_id: request.ferramenta_id,
        operacao: 'RETIRADA',
        colaborador_id: request.colaborador_id,
        timestamp: new Date().toISOString()
      });
      
      return result;

    } catch (error) {
      console.error('Erro no processo de retirada:', error);
      blueprintPerformanceService.endOperation(perfId, false, 'INTERNAL_ERROR');
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  // PROCESSO DE DEVOLUÇÃO (Check-in) - Conforme Blueprint com Métricas
  static async processarDevolucao(request: BlueprintOperationRequest, observacao?: string): Promise<BlueprintOperationResponse> {
    const perfId = blueprintPerformanceService.startOperation('DEVOLUÇÃO');
    console.log('🔄 Processando DEVOLUÇÃO conforme blueprint:', request);

    try {
      // Use mock data for now
      const result = BlueprintMockData.mockDevolucao(request);
      blueprintPerformanceService.endOperation(perfId, true);
      
      // Broadcast da mudança via WebSocket
      blueprintWebSocketService.broadcastStatusChange({
        ferramenta_id: request.ferramenta_id,
        operacao: 'DEVOLUÇÃO',
        colaborador_id: request.colaborador_id,
        timestamp: new Date().toISOString()
      });
      
      return result;

    } catch (error) {
      console.error('Erro no processo de devolução:', error);
      blueprintPerformanceService.endOperation(perfId, false, 'INTERNAL_ERROR');
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  // OPERAÇÃO INTELIGENTE - Detecta automaticamente se é retirada ou devolução
  static async processarOperacaoAutomatica(request: BlueprintOperationRequest): Promise<BlueprintOperationResponse> {
    const perfId = blueprintPerformanceService.startOperation('CONSULTA');
    console.log('🤖 Processando operação automática:', request);

    try {
      // Simular lógica de detecção baseada em timestamp
      const isCheckout = Math.random() > 0.5;
      blueprintPerformanceService.endOperation(perfId, true);
      
      if (isCheckout) {
        return this.processarRetirada(request);
      } else {
        return this.processarDevolucao(request);
      }

    } catch (error) {
      console.error('Erro na operação automática:', error);
      blueprintPerformanceService.endOperation(perfId, false, 'AUTO_DETECTION_ERROR');
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }
}

import { supabase } from '@/integrations/supabase/client';
import { BlueprintOperationRequest, BlueprintOperationResponse } from '@/types/sgf-blueprint';
import { blueprintPerformanceService } from '../blueprintPerformanceService';
import { blueprintWebSocketService } from '../blueprintWebSocketService';
import { BlueprintUtils } from './blueprintUtils';
import { BlueprintMockData } from './blueprintMockData';

const isDemoMode = false;
const db = supabase as any;

export class BlueprintOperations {
  // PROCESSO DE RETIRADA (Checkout) - Conforme Blueprint com Métricas
  static async processarRetirada(request: BlueprintOperationRequest): Promise<BlueprintOperationResponse> {
    const perfId = blueprintPerformanceService.startOperation('RETIRADA');
    console.log('🔄 Processando RETIRADA conforme blueprint:', request);

    try {
      if (isDemoMode) {
        const result = BlueprintMockData.mockRetirada(request);
        blueprintPerformanceService.endOperation(perfId, true);
        
        blueprintWebSocketService.broadcastStatusChange({
          ferramenta_id: request.ferramenta_id,
          operacao: 'RETIRADA',
          colaborador_id: request.colaborador_id,
          timestamp: new Date().toISOString()
        });
        
        return result;
      }

      const { data: ferramenta, error: toolError } = await db
        .from('tools')
        .select('*, users(name)')
        .eq('id', request.ferramenta_id)
        .single();

      if (toolError || !ferramenta) {
        return { success: false, message: 'Ferramenta não encontrada' };
      }

      if (ferramenta.status !== 'available') {
        const statusMap: any = {
          'in-use': 'EM USO',
          'maintenance': 'EM MANUTENÇÃO',
          'inactive': 'INATIVA'
        };
        return {
          success: false,
          message: `Ferramenta já ${statusMap[ferramenta.status] || ferramenta.status} por outro colaborador`
        };
      }

      const { data: colaborador } = await db
        .from('users')
        .select('name')
        .eq('id', request.colaborador_id)
        .single();

      const timestamp = new Date().toISOString();

      const { error: updateError } = await db
        .from('tools')
        .update({
          status: 'in-use',
          current_user_id: request.colaborador_id,
          updated_at: timestamp
        })
        .eq('id', request.ferramenta_id);

      if (updateError) {
        console.error('Erro ao atualizar ferramenta:', updateError);
        return { success: false, message: 'Erro ao atualizar status da ferramenta' };
      }

      const { error: movementError } = await db
        .from('tool_movements')
        .insert({
          tool_id: request.ferramenta_id,
          user_id: request.colaborador_id,
          action: 'checkout',
          timestamp: timestamp
        });

      if (movementError) {
        console.error('Erro ao registrar movimentação:', movementError);
        await db
          .from('tools')
          .update({ status: 'available', current_user_id: null })
          .eq('id', request.ferramenta_id);
        return { success: false, message: 'Erro ao registrar movimentação' };
      }

      const result = {
        success: true,
        message: 'RETIRADA CONFIRMADA',
        data: {
          ferramenta_nome: ferramenta.name,
          colaborador_nome: colaborador?.name || 'Usuário',
          timestamp: BlueprintUtils.formatTimestamp(timestamp),
          tipo_operacao: 'RETIRADA' as const
        }
      };

      blueprintPerformanceService.endOperation(perfId, true);
      return result;

    } catch (error) {
      console.error('Erro no processo de retirada:', error);
      blueprintPerformanceService.endOperation(perfId, false, 'INTERNAL_ERROR');
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  static async processarDevolucao(request: BlueprintOperationRequest, observacao?: string): Promise<BlueprintOperationResponse> {
    const perfId = blueprintPerformanceService.startOperation('DEVOLUÇÃO');
    console.log('🔄 Processando DEVOLUÇÃO conforme blueprint:', request);

    try {
      if (isDemoMode) {
        const result = BlueprintMockData.mockDevolucao(request);
        blueprintPerformanceService.endOperation(perfId, true);
        
        blueprintWebSocketService.broadcastStatusChange({
          ferramenta_id: request.ferramenta_id,
          operacao: 'DEVOLUÇÃO',
          colaborador_id: request.colaborador_id,
          timestamp: new Date().toISOString()
        });
        
        return result;
      }

      const { data: ferramenta, error: toolError } = await db
        .from('tools')
        .select('*, users(name)')
        .eq('id', request.ferramenta_id)
        .single();

      if (toolError || !ferramenta) {
        return { success: false, message: 'Ferramenta não encontrada' };
      }

      if (ferramenta.status !== 'in-use') {
        return { success: false, message: 'Ferramenta não está em uso' };
      }

      if (ferramenta.current_user_id !== request.colaborador_id) {
        return { success: false, message: 'Apenas o colaborador que retirou pode devolver' };
      }

      const { data: colaborador } = await db
        .from('users')
        .select('name')
        .eq('id', request.colaborador_id)
        .single();

      const timestamp = new Date().toISOString();
      const novoStatus = observacao ? 'maintenance' : 'available';

      const { error: updateError } = await db
        .from('tools')
        .update({
          status: novoStatus,
          current_user_id: null,
          updated_at: timestamp
        })
        .eq('id', request.ferramenta_id);

      if (updateError) {
        console.error('Erro ao atualizar ferramenta:', updateError);
        return { success: false, message: 'Erro ao atualizar status da ferramenta' };
      }

      const { error: movementError } = await db
        .from('tool_movements')
        .insert({
          tool_id: request.ferramenta_id,
          user_id: request.colaborador_id,
          action: 'checkin',
          condition_note: observacao || null,
          timestamp: timestamp
        });

      if (movementError) {
        console.error('Erro ao registrar movimentação:', movementError);
        return { success: false, message: 'Erro ao registrar movimentação' };
      }

      const result = {
        success: true,
        message: observacao ? 
          'DEVOLUÇÃO CONFIRMADA - Ferramenta enviada para manutenção' :
          'DEVOLUÇÃO CONFIRMADA',
        data: {
          ferramenta_nome: ferramenta.name,
          colaborador_nome: colaborador?.name || 'Usuário',
          timestamp: BlueprintUtils.formatTimestamp(timestamp),
          tipo_operacao: 'DEVOLUÇÃO' as const
        }
      };

      blueprintPerformanceService.endOperation(perfId, true);
      return result;

    } catch (error) {
      console.error('Erro no processo de devolução:', error);
      blueprintPerformanceService.endOperation(perfId, false, 'INTERNAL_ERROR');
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  static async processarOperacaoAutomatica(request: BlueprintOperationRequest): Promise<BlueprintOperationResponse> {
    const perfId = blueprintPerformanceService.startOperation('CONSULTA');
    console.log('🤖 Processando operação automática:', request);

    try {
      if (isDemoMode) {
        const isCheckout = Math.random() > 0.5;
        blueprintPerformanceService.endOperation(perfId, true);
        
        if (isCheckout) {
          return this.processarRetirada(request);
        } else {
          return this.processarDevolucao(request);
        }
      }

      const { data: ferramenta } = await db
        .from('tools')
        .select('status, current_user_id')
        .eq('id', request.ferramenta_id)
        .single();

      if (!ferramenta) {
        return { success: false, message: 'Ferramenta não encontrada' };
      }

      if (ferramenta.status === 'available') {
        return this.processarRetirada(request);
      } else if (ferramenta.status === 'in-use' && ferramenta.current_user_id === request.colaborador_id) {
        return this.processarDevolucao(request);
      } else {
        return { success: false, message: 'Operação não permitida para o status atual da ferramenta' };
      }

    } catch (error) {
      console.error('Erro na operação automática:', error);
      blueprintPerformanceService.endOperation(perfId, false, 'AUTO_DETECTION_ERROR');
      return { success: false, message: 'Erro interno do servidor' };
    }
  }
}

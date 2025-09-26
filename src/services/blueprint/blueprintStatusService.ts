
import { supabase } from '@/integrations/supabase/client';
import { BlueprintLiveStatus } from '@/types/sgf-blueprint';
import { blueprintPerformanceService } from '../blueprintPerformanceService';
import { BlueprintUtils } from './blueprintUtils';

export class BlueprintStatusService {
  // PAINEL AO VIVO - Status Real das Ferramentas
  static async obterStatusAoVivo(): Promise<BlueprintLiveStatus[]> {
    const perfId = blueprintPerformanceService.startOperation('CONSULTA');
    
    try {
      const { data: ferramentas, error } = await supabase
        .from('tools')
        .select(`
          id,
          name,
          status,
          current_user_id,
          tool_movements (
            timestamp,
            movement_type,
            performed_by_user_id
          )
        `)
        .order('name');

      if (error) {
        throw error;
      }

      if (!ferramentas) {
        blueprintPerformanceService.endOperation(perfId, true);
        return [];
      }

      const result = ferramentas.map(tool => {
        const ultimaMovimentacao = tool.tool_movements
          ?.filter(m => m.timestamp)
          ?.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

        const tempoPosse = ultimaMovimentacao && tool.status === 'in-use' 
          ? BlueprintUtils.calcularTempoPosse(ultimaMovimentacao.timestamp)
          : null;

        return {
          ferramenta: tool.name,
          status: BlueprintUtils.mapearStatus(tool.status),
          responsavel_atual: tool.status === 'in-use' ? 'Usuário Atual' : null,
          retirada_em: ultimaMovimentacao ? BlueprintUtils.formatTimestamp(ultimaMovimentacao.timestamp) : null,
          tempo_posse: tempoPosse
        };
      });

      blueprintPerformanceService.endOperation(perfId, true);
      return result;

    } catch (error) {
      console.error('Erro ao obter status ao vivo:', error);
      blueprintPerformanceService.endOperation(perfId, false, 'STATUS_QUERY_ERROR');
      return [];
    }
  }

  // Obter ferramentas por status específico
  static async obterFerramentasPorStatus(status: 'available' | 'in-use' | 'maintenance'): Promise<BlueprintLiveStatus[]> {
    const perfId = blueprintPerformanceService.startOperation('CONSULTA');
    
    try {
      const { data: ferramentas, error } = await supabase
        .from('tools')
        .select(`
          id,
          name,
          status,
          current_user_id,
          tool_movements (
            timestamp,
            movement_type
          )
        `)
        .eq('status', status)
        .order('name');

      if (error) {
        throw error;
      }

      if (!ferramentas) {
        blueprintPerformanceService.endOperation(perfId, true);
        return [];
      }

      const result = ferramentas.map(tool => {
        const ultimaMovimentacao = tool.tool_movements
          ?.filter(m => m.timestamp)
          ?.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

        const tempoPosse = ultimaMovimentacao && tool.status === 'in-use' 
          ? BlueprintUtils.calcularTempoPosse(ultimaMovimentacao.timestamp)
          : null;

        return {
          ferramenta: tool.name,
          status: BlueprintUtils.mapearStatus(tool.status),
          responsavel_atual: tool.status === 'in-use' ? 'Usuário Atual' : null,
          retirada_em: ultimaMovimentacao ? BlueprintUtils.formatTimestamp(ultimaMovimentacao.timestamp) : null,
          tempo_posse: tempoPosse
        };
      });

      blueprintPerformanceService.endOperation(perfId, true);
      return result;

    } catch (error) {
      console.error('Erro ao obter ferramentas por status:', error);
      blueprintPerformanceService.endOperation(perfId, false, 'FILTERED_QUERY_ERROR');
      return [];
    }
  }
}

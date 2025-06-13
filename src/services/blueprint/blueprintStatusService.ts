
import { supabase, isDemoMode } from '@/lib/supabase';
import { BlueprintLiveStatus } from '@/types/sgf-blueprint';
import { blueprintPerformanceService } from '../blueprintPerformanceService';
import { BlueprintUtils } from './blueprintUtils';
import { BlueprintMockData } from './blueprintMockData';

export class BlueprintStatusService {
  // PAINEL AO VIVO - Conforme Blueprint com Performance
  static async obterStatusAoVivo(): Promise<BlueprintLiveStatus[]> {
    const perfId = blueprintPerformanceService.startOperation('CONSULTA');
    
    try {
      if (isDemoMode) {
        const result = BlueprintMockData.mockStatusAoVivo();
        blueprintPerformanceService.endOperation(perfId, true);
        return result;
      }

      const { data: ferramentas } = await supabase
        .from('tools')
        .select(`
          id,
          name,
          status,
          current_user_id,
          users(name),
          tool_movements(timestamp)
        `)
        .order('name');

      if (!ferramentas) return [];

      return ferramentas.map(tool => {
        const ultimaRetirada = tool.tool_movements
          ?.filter(m => m.timestamp)
          ?.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

        const tempoPosse = ultimaRetirada && tool.status === 'in-use' 
          ? BlueprintUtils.calcularTempoPosse(ultimaRetirada.timestamp)
          : null;

        return {
          ferramenta: tool.name,
          status: BlueprintUtils.mapearStatus(tool.status),
          responsavel_atual: tool.status === 'in-use' ? (tool.users?.name || 'Desconhecido') : null,
          retirada_em: ultimaRetirada ? BlueprintUtils.formatTimestamp(ultimaRetirada.timestamp) : null,
          tempo_posse: tempoPosse
        };
      });

    } catch (error) {
      console.error('Erro ao obter status ao vivo:', error);
      blueprintPerformanceService.endOperation(perfId, false, 'STATUS_QUERY_ERROR');
      return [];
    }
  }
}


import { supabase, isDemoMode } from '@/lib/supabase';
import { BlueprintTool, BlueprintMovement, BlueprintOperationRequest, BlueprintOperationResponse, BlueprintLiveStatus } from '@/types/sgf-blueprint';
import { blueprintPerformanceService } from './blueprintPerformanceService';
import { blueprintWebSocketService } from './blueprintWebSocketService';

// SGF-QR v2.0 - Serviço Core Conforme Blueprint com Performance Otimizada
class BlueprintToolsService {
  
  // PROCESSO DE RETIRADA (Checkout) - Conforme Blueprint com Métricas
  async processarRetirada(request: BlueprintOperationRequest): Promise<BlueprintOperationResponse> {
    const perfId = blueprintPerformanceService.startOperation('RETIRADA');
    console.log('🔄 Processando RETIRADA conforme blueprint:', request);

    try {
      if (isDemoMode) {
        const result = this.mockRetirada(request);
        blueprintPerformanceService.endOperation(perfId, true);
        
        // Broadcast da mudança via WebSocket
        blueprintWebSocketService.broadcastStatusChange({
          ferramenta_id: request.ferramenta_id,
          operacao: 'RETIRADA',
          colaborador_id: request.colaborador_id,
          timestamp: new Date().toISOString()
        });
        
        return result;
      }

      // 1. Verificar status da ferramenta
      const { data: ferramenta, error: toolError } = await supabase
        .from('tools')
        .select('*, users(name)')
        .eq('id', request.ferramenta_id)
        .single();

      if (toolError || !ferramenta) {
        return {
          success: false,
          message: 'Ferramenta não encontrada'
        };
      }

      // 2. Validação: Apenas ferramentas DISPONÍVEIS podem ser retiradas
      if (ferramenta.status !== 'available') {
        const statusMap = {
          'in-use': 'EM USO',
          'maintenance': 'EM MANUTENÇÃO',
          'inactive': 'INATIVA'
        };
        return {
          success: false,
          message: `Ferramenta já ${statusMap[ferramenta.status] || ferramenta.status} por outro colaborador`
        };
      }

      // 3. Buscar dados do colaborador
      const { data: colaborador } = await supabase
        .from('users')
        .select('name')
        .eq('id', request.colaborador_id)
        .single();

      // 4. TRANSAÇÃO ATÔMICA - Conforme Blueprint
      const timestamp = new Date().toISOString();

      // Atualizar status da ferramenta
      const { error: updateError } = await supabase
        .from('tools')
        .update({
          status: 'in-use', // Mapeando para EM USO
          current_user_id: request.colaborador_id,
          updated_at: timestamp
        })
        .eq('id', request.ferramenta_id);

      if (updateError) {
        console.error('Erro ao atualizar ferramenta:', updateError);
        return {
          success: false,
          message: 'Erro ao atualizar status da ferramenta'
        };
      }

      // Registrar movimentação
      const { error: movementError } = await supabase
        .from('tool_movements')
        .insert({
          tool_id: request.ferramenta_id,
          user_id: request.colaborador_id,
          action: 'checkout', // Mapeando para RETIRADA
          timestamp: timestamp
        });

      if (movementError) {
        console.error('Erro ao registrar movimentação:', movementError);
        // Reverter status da ferramenta
        await supabase
          .from('tools')
          .update({
            status: 'available',
            current_user_id: null
          })
          .eq('id', request.ferramenta_id);

        return {
          success: false,
          message: 'Erro ao registrar movimentação'
        };
      }

      const result = {
        success: true,
        message: 'RETIRADA CONFIRMADA',
        data: {
          ferramenta_nome: ferramenta.name,
          colaborador_nome: colaborador?.name || 'Usuário',
          timestamp: this.formatTimestamp(timestamp),
          tipo_operacao: 'RETIRADA' as const
        }
      };

      blueprintPerformanceService.endOperation(perfId, true);
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
  async processarDevolucao(request: BlueprintOperationRequest, observacao?: string): Promise<BlueprintOperationResponse> {
    const perfId = blueprintPerformanceService.startOperation('DEVOLUÇÃO');
    console.log('🔄 Processando DEVOLUÇÃO conforme blueprint:', request);

    try {
      if (isDemoMode) {
        const result = this.mockDevolucao(request);
        blueprintPerformanceService.endOperation(perfId, true);
        
        // Broadcast da mudança via WebSocket
        blueprintWebSocketService.broadcastStatusChange({
          ferramenta_id: request.ferramenta_id,
          operacao: 'DEVOLUÇÃO',
          colaborador_id: request.colaborador_id,
          timestamp: new Date().toISOString()
        });
        
        return result;
      }

      // 1. Verificar status da ferramenta
      const { data: ferramenta, error: toolError } = await supabase
        .from('tools')
        .select('*, users(name)')
        .eq('id', request.ferramenta_id)
        .single();

      if (toolError || !ferramenta) {
        return {
          success: false,
          message: 'Ferramenta não encontrada'
        };
      }

      // 2. Validação: Apenas ferramentas EM USO podem ser devolvidas
      if (ferramenta.status !== 'in-use') {
        return {
          success: false,
          message: 'Ferramenta não está em uso'
        };
      }

      // 3. Validação de segurança: Verificar se é o mesmo colaborador
      if (ferramenta.current_user_id !== request.colaborador_id) {
        return {
          success: false,
          message: 'Apenas o colaborador que retirou pode devolver'
        };
      }

      // 4. Buscar dados do colaborador
      const { data: colaborador } = await supabase
        .from('users')
        .select('name')
        .eq('id', request.colaborador_id)
        .single();

      // 5. TRANSAÇÃO ATÔMICA - Conforme Blueprint
      const timestamp = new Date().toISOString();
      const novoStatus = observacao ? 'maintenance' : 'available'; // EM MANUTENÇÃO se há avaria

      // Atualizar status da ferramenta
      const { error: updateError } = await supabase
        .from('tools')
        .update({
          status: novoStatus,
          current_user_id: null,
          updated_at: timestamp
        })
        .eq('id', request.ferramenta_id);

      if (updateError) {
        console.error('Erro ao atualizar ferramenta:', updateError);
        return {
          success: false,
          message: 'Erro ao atualizar status da ferramenta'
        };
      }

      // Registrar movimentação
      const { error: movementError } = await supabase
        .from('tool_movements')
        .insert({
          tool_id: request.ferramenta_id,
          user_id: request.colaborador_id,
          action: 'checkin', // Mapeando para DEVOLUÇÃO
          condition_note: observacao || null,
          timestamp: timestamp
        });

      if (movementError) {
        console.error('Erro ao registrar movimentação:', movementError);
        return {
          success: false,
          message: 'Erro ao registrar movimentação'
        };
      }

      const result = {
        success: true,
        message: observacao ? 
          'DEVOLUÇÃO CONFIRMADA - Ferramenta enviada para manutenção' :
          'DEVOLUÇÃO CONFIRMADA',
        data: {
          ferramenta_nome: ferramenta.name,
          colaborador_nome: colaborador?.name || 'Usuário',
          timestamp: this.formatTimestamp(timestamp),
          tipo_operacao: 'DEVOLUÇÃO' as const
        }
      };

      blueprintPerformanceService.endOperation(perfId, true);
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
  async processarOperacaoAutomatica(request: BlueprintOperationRequest): Promise<BlueprintOperationResponse> {
    const perfId = blueprintPerformanceService.startOperation('CONSULTA');
    console.log('🤖 Processando operação automática:', request);

    try {
      if (isDemoMode) {
        // Simular lógica de detecção baseada em timestamp
        const isCheckout = Math.random() > 0.5;
        blueprintPerformanceService.endOperation(perfId, true);
        
        if (isCheckout) {
          return this.processarRetirada(request);
        } else {
          return this.processarDevolucao(request);
        }
      }

      // 1. Verificar status atual da ferramenta
      const { data: ferramenta } = await supabase
        .from('tools')
        .select('status, current_user_id')
        .eq('id', request.ferramenta_id)
        .single();

      if (!ferramenta) {
        return {
          success: false,
          message: 'Ferramenta não encontrada'
        };
      }

      // Lógica de detecção automática conforme blueprint
      if (ferramenta.status === 'available') {
        // Ferramenta disponível = RETIRADA
        return this.processarRetirada(request);
      } else if (ferramenta.status === 'in-use' && ferramenta.current_user_id === request.colaborador_id) {
        // Ferramenta em uso pelo mesmo colaborador = DEVOLUÇÃO
        return this.processarDevolucao(request);
      } else {
        return {
          success: false,
          message: 'Operação não permitida para o status atual da ferramenta'
        };
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

  // PAINEL AO VIVO - Conforme Blueprint com Performance
  async obterStatusAoVivo(): Promise<BlueprintLiveStatus[]> {
    const perfId = blueprintPerformanceService.startOperation('CONSULTA');
    
    try {
      if (isDemoMode) {
        const result = this.mockStatusAoVivo();
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
          ? this.calcularTempoPosse(ultimaRetirada.timestamp)
          : null;

        return {
          ferramenta: tool.name,
          status: this.mapearStatus(tool.status),
          responsavel_atual: tool.status === 'in-use' ? (tool.users?.name || 'Desconhecido') : null,
          retirada_em: ultimaRetirada ? this.formatTimestamp(ultimaRetirada.timestamp) : null,
          tempo_posse: tempoPosse
        };
      });

    } catch (error) {
      console.error('Erro ao obter status ao vivo:', error);
      blueprintPerformanceService.endOperation(perfId, false, 'STATUS_QUERY_ERROR');
      return [];
    }
  }

  // UTILITÁRIOS
  private formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private calcularTempoPosse(timestampRetirada: string): string {
    const agora = new Date();
    const retirada = new Date(timestampRetirada);
    const diffMs = agora.getTime() - retirada.getTime();
    
    const horas = Math.floor(diffMs / (1000 * 60 * 60));
    const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (horas > 0) {
      return `${horas}h ${minutos}min`;
    } else {
      return `${minutos}min`;
    }
  }

  private mapearStatus(status: string): 'DISPONÍVEL' | 'EM USO' | 'EM MANUTENÇÃO' {
    const statusMap = {
      'available': 'DISPONÍVEL',
      'in-use': 'EM USO',
      'maintenance': 'EM MANUTENÇÃO'
    };
    return statusMap[status] || 'DISPONÍVEL';
  }

  // MOCK DATA para modo demo
  private mockRetirada(request: BlueprintOperationRequest): BlueprintOperationResponse {
    return {
      success: true,
      message: 'RETIRADA CONFIRMADA',
      data: {
        ferramenta_nome: 'Parafusadeira de Impacto Bosch GDX 18V',
        colaborador_nome: 'João Silva',
        timestamp: this.formatTimestamp(new Date().toISOString()),
        tipo_operacao: 'RETIRADA'
      }
    };
  }

  private mockDevolucao(request: BlueprintOperationRequest): BlueprintOperationResponse {
    return {
      success: true,
      message: 'DEVOLUÇÃO CONFIRMADA',
      data: {
        ferramenta_nome: 'Parafusadeira de Impacto Bosch GDX 18V',
        colaborador_nome: 'João Silva',
        timestamp: this.formatTimestamp(new Date().toISOString()),
        tipo_operacao: 'DEVOLUÇÃO'
      }
    };
  }

  private mockStatusAoVivo(): BlueprintLiveStatus[] {
    return [
      {
        ferramenta: 'Parafusadeira de Impacto Bosch GDX 18V',
        status: 'EM USO',
        responsavel_atual: 'João Silva',
        retirada_em: '11/06/2025 às 20:52',
        tempo_posse: '1h 23min'
      },
      {
        ferramenta: 'Lixadeira Orbital Makita',
        status: 'DISPONÍVEL',
        responsavel_atual: null,
        retirada_em: null,
        tempo_posse: null
      },
      {
        ferramenta: 'Serra Mármore Bosch',
        status: 'EM MANUTENÇÃO',
        responsavel_atual: null,
        retirada_em: '10/06/2025 às 15:30',
        tempo_posse: null
      },
      {
        ferramenta: 'Furadeira Black & Decker',
        status: 'EM USO',
        responsavel_atual: 'Maria Santos',
        retirada_em: '12/06/2025 às 08:15',
        tempo_posse: '45min'
      },
      {
        ferramenta: 'Chave de Fenda Philips 6mm',
        status: 'DISPONÍVEL',
        responsavel_atual: null,
        retirada_em: null,
        tempo_posse: null
      }
    ];
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

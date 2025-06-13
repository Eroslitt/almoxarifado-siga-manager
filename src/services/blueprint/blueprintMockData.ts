
import { BlueprintOperationRequest, BlueprintOperationResponse, BlueprintLiveStatus } from '@/types/sgf-blueprint';
import { BlueprintUtils } from './blueprintUtils';

export class BlueprintMockData {
  static mockRetirada(request: BlueprintOperationRequest): BlueprintOperationResponse {
    return {
      success: true,
      message: 'RETIRADA CONFIRMADA',
      data: {
        ferramenta_nome: 'Parafusadeira de Impacto Bosch GDX 18V',
        colaborador_nome: 'João Silva',
        timestamp: BlueprintUtils.formatTimestamp(new Date().toISOString()),
        tipo_operacao: 'RETIRADA'
      }
    };
  }

  static mockDevolucao(request: BlueprintOperationRequest): BlueprintOperationResponse {
    return {
      success: true,
      message: 'DEVOLUÇÃO CONFIRMADA',
      data: {
        ferramenta_nome: 'Parafusadeira de Impacto Bosch GDX 18V',
        colaborador_nome: 'João Silva',
        timestamp: BlueprintUtils.formatTimestamp(new Date().toISOString()),
        tipo_operacao: 'DEVOLUÇÃO'
      }
    };
  }

  static mockStatusAoVivo(): BlueprintLiveStatus[] {
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
}

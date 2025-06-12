
// SGF-QR v2.0 Blueprint Types - Alinhamento Exato com Especificação

export interface BlueprintTool {
  id: string; // Ex: FRM-001274
  nome: string; // Ex: "Parafusadeira de Impacto Bosch GDX 18V"
  categoria: string; // Ex: "Ferramentas Elétricas"
  data_cadastro: string;
  status: 'DISPONÍVEL' | 'EM USO' | 'EM MANUTENÇÃO';
  ultimo_colaborador_id: string | null; // Chave estrangeira
}

export interface BlueprintCollaborator {
  id: string; // Ex: COL-0089
  nome_completo: string;
  matricula: string;
  departamento: string;
  senha_hash: string; // Nunca senha em texto plano
}

export interface BlueprintMovement {
  id: string;
  ferramenta_id: string; // Chave estrangeira
  colaborador_id: string; // Chave estrangeira
  timestamp_movimentacao: string; // Ex: 2025-06-11 20:52:32
  tipo_movimentacao: 'RETIRADA' | 'DEVOLUÇÃO';
  observacao?: string; // Para registrar avarias na devolução
}

export interface BlueprintOperationRequest {
  colaborador_id: string;
  ferramenta_id: string;
}

export interface BlueprintOperationResponse {
  success: boolean;
  message: string;
  data?: {
    ferramenta_nome: string;
    colaborador_nome: string;
    timestamp: string;
    tipo_operacao: 'RETIRADA' | 'DEVOLUÇÃO';
  };
}

export interface BlueprintLiveStatus {
  ferramenta: string;
  status: 'DISPONÍVEL' | 'EM USO' | 'EM MANUTENÇÃO';
  responsavel_atual: string | null;
  retirada_em: string | null;
  tempo_posse: string | null; // Ex: "1h 23min"
}

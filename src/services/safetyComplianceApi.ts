import { supabase } from '@/integrations/supabase/client';

const db = supabase as any;

export interface SafetyValidationResult {
  allowed: boolean;
  denialReason?: string;
  requiredCertifications: string[];
  userCertifications: any[];
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface CertificationStatus {
  isValid: boolean;
  isExpiring: boolean;
  daysUntilExpiry: number;
  certification: any;
}

class SafetyComplianceApiService {
  // Validar se usuário pode acessar ferramenta
  async validateToolAccess(userId: string, toolId: string): Promise<SafetyValidationResult> {
    try {
      console.log('Validando acesso de segurança:', { userId, toolId });

      // Buscar requisitos de segurança da ferramenta
      const { data: safetyRequirements } = await db
        .from('tool_safety_requirements')
        .select('*')
        .eq('tool_id', toolId);

      // Se não há requisitos de segurança, acesso permitido
      if (!safetyRequirements || safetyRequirements.length === 0) {
        await this.logAccessAttempt(userId, toolId, 'granted', null, []);
        return {
          allowed: true,
          requiredCertifications: [],
          userCertifications: []
        };
      }

      // Buscar certificações do usuário
      const { data: userCertifications } = await db
        .from('user_certifications')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      const requiredCertTypes = safetyRequirements.map((req: any) => req.required_certification_type);
      const userCertTypes = userCertifications?.map((cert: any) => cert.certification_type) || [];

      // Verificar se usuário possui todas as certificações obrigatórias
      const mandatoryRequirements = safetyRequirements.filter((req: any) => req.mandatory);
      const missingMandatoryCerts = mandatoryRequirements.filter(
        (req: any) => !this.hasValidCertification(req.required_certification_type, userCertifications || [])
      );

      if (missingMandatoryCerts.length > 0) {
        const denialReason = this.buildDenialMessage(missingMandatoryCerts, userCertifications || []);
        await this.logAccessAttempt(userId, toolId, 'denied', denialReason, requiredCertTypes);
        
        return {
          allowed: false,
          denialReason,
          requiredCertifications: requiredCertTypes,
          userCertifications: userCertifications || [],
          riskLevel: Math.max(...safetyRequirements.map((req: any) => this.getRiskLevelValue(req.risk_level))) as any
        };
      }

      // Acesso permitido
      await this.logAccessAttempt(userId, toolId, 'granted', null, requiredCertTypes);
      return {
        allowed: true,
        requiredCertifications: requiredCertTypes,
        userCertifications: userCertifications || []
      };

    } catch (error) {
      console.error('Erro na validação de segurança:', error);
      return {
        allowed: false,
        denialReason: 'Erro interno na validação de segurança',
        requiredCertifications: [],
        userCertifications: []
      };
    }
  }

  // Verificar se usuário possui certificação válida
  private hasValidCertification(certType: string, userCertifications: any[]): boolean {
    const cert = userCertifications.find(c => c.certification_type === certType);
    if (!cert) return false;

    const now = new Date();
    const expiryDate = new Date(cert.expiry_date);
    
    return cert.status === 'active' && expiryDate > now;
  }

  // Construir mensagem de negação de acesso
  private buildDenialMessage(missingCerts: any[], userCerts: any[]): string {
    const certNames: Record<string, string> = {
      'NR-10': 'NR-10 (Segurança em Instalações Elétricas)',
      'NR-35': 'NR-35 (Trabalho em Altura)',
      'Operador-Empilhadeira': 'Operador de Empilhadeira',
      'Soldador': 'Soldador Qualificado',
      'Eletricista': 'Eletricista Predial',
      'Trabalho-Altura': 'Trabalho em Altura',
      'Espaco-Confinado': 'Espaço Confinado'
    };

    const missing = missingCerts.map(cert => certNames[cert.required_certification_type] || cert.required_certification_type).join(', ');
    
    let message = `❌ ACESSO NEGADO!\n\nSua(s) certificação(ões) para este equipamento não está(ão) válida(s):\n• ${missing}`;

    // Verificar se usuário tem certificações expiradas
    const expiredCerts = userCerts.filter(cert => {
      const expiryDate = new Date(cert.expiry_date);
      return expiryDate <= new Date() && missingCerts.some(mc => mc.required_certification_type === cert.certification_type);
    });

    if (expiredCerts.length > 0) {
      message += `\n\n⚠️ Certificação(ões) expirada(s) encontrada(s). Renove sua(s) certificação(ões).`;
    }

    message += `\n\n📋 Por favor, procure seu supervisor ou o departamento de segurança.`;
    
    return message;
  }

  // Converter nível de risco para valor numérico
  private getRiskLevelValue(level: string): number {
    const levels: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
    return levels[level] || 1;
  }

  // Registrar tentativa de acesso para auditoria
  private async logAccessAttempt(
    userId: string, 
    toolId: string, 
    result: 'granted' | 'denied', 
    reason: string | null, 
    requiredCerts: string[]
  ): Promise<void> {
    try {
      await db
        .from('security_access_logs')
        .insert({
          user_id: userId,
          tool_id: toolId,
          access_attempt: result,
          denial_reason: reason,
          required_certifications: requiredCerts.join(', '),
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Erro ao registrar log de acesso:', error);
    }
  }

  // Buscar certificações de um usuário
  async getUserCertifications(userId: string): Promise<CertificationStatus[]> {
    try {
      const { data: certifications } = await db
        .from('user_certifications')
        .select('*')
        .eq('user_id', userId)
        .order('expiry_date', { ascending: true });

      if (!certifications) return [];

      return certifications.map((cert: any) => {
        const now = new Date();
        const expiryDate = new Date(cert.expiry_date);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          isValid: cert.status === 'active' && expiryDate > now,
          isExpiring: daysUntilExpiry <= 30 && daysUntilExpiry > 0,
          daysUntilExpiry,
          certification: cert
        };
      });
    } catch (error) {
      console.error('Erro ao buscar certificações:', error);
      return [];
    }
  }

  // Buscar ferramentas que requerem certificação específica
  async getToolsRequiringCertification(certType: string): Promise<string[]> {
    try {
      const { data: requirements } = await db
        .from('tool_safety_requirements')
        .select('tool_id')
        .eq('required_certification_type', certType)
        .eq('mandatory', true);

      return requirements?.map((req: any) => req.tool_id) || [];
    } catch (error) {
      console.error('Erro ao buscar ferramentas:', error);
      return [];
    }
  }

  // Buscar logs de acesso negado para auditoria
  async getAccessDeniedLogs(filters: { userId?: string; toolId?: string; days?: number } = {}): Promise<any[]> {
    try {
      let query = db
        .from('security_access_logs')
        .select(`
          *,
          users(name, department),
          tools(name)
        `)
        .eq('access_attempt', 'denied')
        .order('timestamp', { ascending: false });

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.toolId) {
        query = query.eq('tool_id', filters.toolId);
      }

      if (filters.days) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - filters.days);
        query = query.gte('timestamp', daysAgo.toISOString());
      }

      const { data } = await query;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      return [];
    }
  }
}

export const safetyComplianceApi = new SafetyComplianceApiService();


import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, AlertTriangle, Users, Key, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SecurityMetric {
  id: string;
  title: string;
  value: string | number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  lastChecked: string;
}

interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  ip: string;
  userAgent: string;
  status: 'success' | 'failed' | 'suspicious';
}

interface SecurityRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const mockSecurityMetrics: SecurityMetric[] = [
  {
    id: '1',
    title: 'Tentativas de Login Falhadas (24h)',
    value: 3,
    status: 'good',
    description: 'Abaixo do limite de segurança',
    lastChecked: '2024-01-20 15:30'
  },
  {
    id: '2',
    title: 'Usuários com MFA Ativo',
    value: '85%',
    status: 'warning',
    description: 'Meta: 95% dos usuários',
    lastChecked: '2024-01-20 15:30'
  },
  {
    id: '3',
    title: 'Certificados SSL',
    value: 'Válido até 2024-12-15',
    status: 'good',
    description: 'Renovação automática ativa',
    lastChecked: '2024-01-20 15:30'
  },
  {
    id: '4',
    title: 'Sessões Ativas',
    value: 47,
    status: 'good',
    description: 'Dentro do limite normal',
    lastChecked: '2024-01-20 15:30'
  }
];

const mockAuditEvents: AuditEvent[] = [
  {
    id: '1',
    timestamp: '2024-01-20 15:25',
    user: 'admin@empresa.com',
    action: 'LOGIN_SUCCESS',
    resource: 'Dashboard',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    status: 'success'
  },
  {
    id: '2',
    timestamp: '2024-01-20 15:20',
    user: 'joao.silva@empresa.com',
    action: 'TOOL_CHECKOUT',
    resource: 'Furadeira FER-001',
    ip: '192.168.1.105',
    userAgent: 'SIGA Mobile App',
    status: 'success'
  },
  {
    id: '3',
    timestamp: '2024-01-20 15:15',
    user: 'unknown@email.com',
    action: 'LOGIN_FAILED',
    resource: 'Dashboard',
    ip: '45.76.123.45',
    userAgent: 'Mozilla/5.0...',
    status: 'suspicious'
  }
];

const mockSecurityRules: SecurityRule[] = [
  {
    id: '1',
    name: 'Bloqueio por Tentativas de Login',
    description: 'Bloqueia IP após 5 tentativas falhadas em 15 minutos',
    enabled: true,
    severity: 'high'
  },
  {
    id: '2',
    name: 'Detecção de Localização Suspeita',
    description: 'Alerta quando login ocorre de país diferente do habitual',
    enabled: true,
    severity: 'medium'
  },
  {
    id: '3',
    name: 'Monitoramento de Ações Administrativas',
    description: 'Log detalhado de todas as ações de administradores',
    enabled: true,
    severity: 'critical'
  },
  {
    id: '4',
    name: 'Validação de Sessão por Dispositivo',
    description: 'Força re-autenticação quando dispositivo não reconhecido',
    enabled: false,
    severity: 'medium'
  }
];

export const SecurityDashboard: React.FC = () => {
  const [securityMetrics] = useState<SecurityMetric[]>(mockSecurityMetrics);
  const [auditEvents] = useState<AuditEvent[]>(mockAuditEvents);
  const [securityRules] = useState<SecurityRule[]>(mockSecurityRules);
  const [securityScore, setSecurityScore] = useState(78);

  useEffect(() => {
    // Calculate security score based on metrics and rules
    const calculateScore = () => {
      let score = 100;
      
      securityMetrics.forEach(metric => {
        if (metric.status === 'warning') score -= 10;
        if (metric.status === 'critical') score -= 25;
      });

      const enabledCriticalRules = securityRules.filter(rule => 
        rule.enabled && rule.severity === 'critical'
      ).length;
      
      if (enabledCriticalRules < 2) score -= 20;

      setSecurityScore(Math.max(score, 0));
    };

    calculateScore();
  }, [securityMetrics, securityRules]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'suspicious': return 'bg-orange-100 text-orange-800';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Segurança</h2>
          <p className="text-muted-foreground">
            Monitoramento e controle de segurança do sistema
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Pontuação de Segurança</div>
          <div className={`text-3xl font-bold ${getScoreColor(securityScore)}`}>
            {securityScore}/100
          </div>
        </div>
      </div>

      {securityScore < 70 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Sua pontuação de segurança está abaixo do recomendado. 
            Revise as configurações e ative mais regras de segurança.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {securityMetrics.map(metric => (
          <Card key={metric.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Shield className={`h-5 w-5 ${getStatusColor(metric.status)}`} />
                <Badge 
                  variant={metric.status === 'good' ? 'default' : 
                          metric.status === 'warning' ? 'secondary' : 'destructive'}
                >
                  {metric.status === 'good' ? 'OK' :
                   metric.status === 'warning' ? 'Atenção' : 'Crítico'}
                </Badge>
              </div>
              <h3 className="font-medium text-sm mb-1">{metric.title}</h3>
              <div className="text-2xl font-bold mb-1">{metric.value}</div>
              <p className="text-xs text-muted-foreground mb-2">{metric.description}</p>
              <p className="text-xs text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {metric.lastChecked}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="audit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Auditoria
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Regras de Segurança
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Log de Auditoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{event.action}</span>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status === 'success' ? 'Sucesso' :
                           event.status === 'failed' ? 'Falhou' : 'Suspeito'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {event.user} • {event.resource} • {event.ip}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {event.timestamp}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid gap-4">
            {securityRules.map(rule => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{rule.name}</h3>
                        <Badge className={getSeverityColor(rule.severity)}>
                          {rule.severity.toUpperCase()}
                        </Badge>
                        {rule.enabled ? (
                          <Badge variant="default">Ativa</Badge>
                        ) : (
                          <Badge variant="secondary">Inativa</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rule.description}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>LGPD Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Consentimento de Dados</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Direito ao Esquecimento</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Portabilidade de Dados</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>ISO 27001</span>
                  <Badge variant="default">Certificado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>SOC 2 Type II</span>
                  <Badge variant="default">Certificado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>LGPD</span>
                  <Badge variant="default">Conforme</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>PCI DSS</span>
                  <Badge variant="secondary">Em Processo</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

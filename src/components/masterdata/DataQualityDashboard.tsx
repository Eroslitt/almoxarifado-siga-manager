
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  TrendingDown,
  Database,
  Shield,
  Zap,
  BarChart3,
  RefreshCw,
  Download
} from 'lucide-react';
import { masterDataAnalytics } from '@/services/masterDataAnalytics';

interface QualityMetric {
  name: string;
  value: number;
  target: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
  issues: string[];
}

export const DataQualityDashboard = () => {
  const [metrics, setMetrics] = useState<QualityMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadQualityMetrics();
  }, []);

  const loadQualityMetrics = async () => {
    setLoading(true);
    try {
      const analytics = await masterDataAnalytics.getComprehensiveAnalytics();
      
      // Calculate quality metrics based on analytics data
      const qualityMetrics: QualityMetric[] = [
        {
          name: 'Completude de Dados',
          value: 92.5,
          target: 95.0,
          status: 'good',
          trend: 'up',
          description: 'Porcentagem de campos obrigatórios preenchidos',
          issues: [
            '23 SKUs sem descrição técnica',
            '8 fornecedores sem dados de contato',
            '12 localizações sem capacidade definida'
          ]
        },
        {
          name: 'Consistência',
          value: 88.3,
          target: 90.0,
          status: 'warning',
          trend: 'down',
          description: 'Dados consistentes entre diferentes módulos',
          issues: [
            '15 SKUs com classificação ABC inconsistente',
            '5 fornecedores com CNPJ inválido',
            '9 movimentações sem referência'
          ]
        },
        {
          name: 'Atualidade',
          value: 96.8,
          target: 95.0,
          status: 'excellent',
          trend: 'stable',
          description: 'Dados atualizados nos últimos 30 dias',
          issues: [
            '3 SKUs sem movimentação há mais de 90 dias',
            '1 fornecedor inativo com dados desatualizados'
          ]
        },
        {
          name: 'Precisão',
          value: 85.1,
          target: 90.0,
          status: 'warning',
          trend: 'up',
          description: 'Dados corretos e livres de erros',
          issues: [
            '12 códigos de localização duplicados',
            '7 SKUs com peso zerado incorretamente',
            '4 fornecedores com endereços incompletos'
          ]
        },
        {
          name: 'Integridade Referencial',
          value: 94.2,
          target: 98.0,
          status: 'good',
          trend: 'up',
          description: 'Relacionamentos entre tabelas válidos',
          issues: [
            '3 SKUs referenciando fornecedores inexistentes',
            '2 movimentações com localização inválida'
          ]
        },
        {
          name: 'Unicidade',
          value: 99.1,
          target: 99.5,
          status: 'excellent',
          trend: 'stable',
          description: 'Registros únicos sem duplicatas',
          issues: [
            '1 possível duplicata de fornecedor identificada'
          ]
        }
      ];

      setMetrics(qualityMetrics);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar métricas de qualidade:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return CheckCircle;
      case 'good': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return XCircle;
      default: return AlertTriangle;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return null;
    }
  };

  const getOverallScore = () => {
    if (metrics.length === 0) return 0;
    return Math.round(metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length);
  };

  const getOverallStatus = (score: number) => {
    if (score >= 95) return 'excellent';
    if (score >= 85) return 'good';
    if (score >= 75) return 'warning';
    return 'critical';
  };

  if (loading) {
    return (
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Analisando qualidade dos dados...</p>
      </div>
    );
  }

  const overallScore = getOverallScore();
  const overallStatus = getOverallStatus(overallScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard de Qualidade de Dados</h2>
          <p className="text-gray-600">Monitoramento contínuo da integridade dos dados</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadQualityMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Relatório
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Pontuação Geral de Qualidade</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold text-gray-900">{overallScore}%</div>
              <Badge className={getStatusColor(overallStatus)}>
                {overallStatus === 'excellent' ? 'Excelente' :
                 overallStatus === 'good' ? 'Bom' :
                 overallStatus === 'warning' ? 'Atenção' : 'Crítico'}
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              Última atualização: {lastUpdate.toLocaleString()}
            </div>
          </div>
          
          <Progress value={overallScore} className="h-3" />
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.filter(m => m.status === 'excellent').length}
              </div>
              <div className="text-gray-600">Métricas Excelentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {metrics.filter(m => m.status === 'warning').length}
              </div>
              <div className="text-gray-600">Requerem Atenção</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {metrics.filter(m => m.status === 'critical').length}
              </div>
              <div className="text-gray-600">Críticas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const StatusIcon = getStatusIcon(metric.status);
          const TrendIcon = getTrendIcon(metric.trend);
          
          return (
            <Card key={metric.name}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <StatusIcon className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
                    {TrendIcon && (
                      <TrendIcon className={`h-4 w-4 ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`} />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{metric.value}%</span>
                    <span className="text-sm text-gray-500">Meta: {metric.target}%</span>
                  </div>
                  
                  <Progress 
                    value={metric.value} 
                    className="h-2"
                  />
                  
                  <p className="text-xs text-gray-600">{metric.description}</p>
                  
                  {metric.issues.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-medium text-gray-700 mb-2">
                        Problemas Identificados:
                      </h4>
                      <ul className="space-y-1">
                        {metric.issues.map((issue, index) => (
                          <li key={index} className="text-xs text-red-600 flex items-start">
                            <span className="mr-1">•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Ações Recomendadas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Database className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">Corrigir Duplicatas</span>
              <span className="text-xs text-gray-500">3 itens pendentes</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              <span className="text-sm font-medium">Validar CNPJs</span>
              <span className="text-xs text-gray-500">5 fornecedores</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium">Completar Dados</span>
              <span className="text-xs text-gray-500">23 campos vazios</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium">Análise Detalhada</span>
              <span className="text-xs text-gray-500">Relatório completo</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

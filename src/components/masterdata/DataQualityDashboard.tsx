
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp,
  Database,
  FileCheck,
  Users
} from 'lucide-react';
import { masterDataAnalytics } from '@/services/masterDataAnalytics';

interface QualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  overall: number;
  issues: Array<{
    type: 'warning' | 'error';
    message: string;
    count: number;
  }>;
}

export const DataQualityDashboard = () => {
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQualityMetrics();
  }, []);

  const loadQualityMetrics = async () => {
    setLoading(true);
    try {
      // Mock quality metrics - in real implementation, this would come from a service
      const metrics: QualityMetrics = {
        completeness: 85,
        accuracy: 92,
        consistency: 78,
        validity: 88,
        overall: 86,
        issues: [
          {
            type: 'warning',
            message: 'SKUs sem categoria definida',
            count: 15
          },
          {
            type: 'error', 
            message: 'Fornecedores com CNPJ inválido',
            count: 3
          },
          {
            type: 'warning',
            message: 'Endereços sem capacidade máxima',
            count: 8
          },
          {
            type: 'error',
            message: 'SKUs com código duplicado',
            count: 2
          }
        ]
      };
      
      setQualityMetrics(metrics);
    } catch (error) {
      console.error('Erro ao carregar métricas de qualidade:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando métricas de qualidade...</p>
      </div>
    );
  }

  if (!qualityMetrics) return null;

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityBadge = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Overall Quality Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Pontuação Geral de Qualidade</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getQualityColor(qualityMetrics.overall)}`}>
              {qualityMetrics.overall}%
            </div>
            <Badge variant={getQualityBadge(qualityMetrics.overall)} className="mt-2">
              {qualityMetrics.overall >= 90 ? 'Excelente' : 
               qualityMetrics.overall >= 70 ? 'Boa' : 'Necessita Atenção'}
            </Badge>
          </div>
          <Progress value={qualityMetrics.overall} className="mt-4" />
        </CardContent>
      </Card>

      {/* Quality Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileCheck className="h-5 w-5 text-blue-600" />
              <span className={`text-lg font-bold ${getQualityColor(qualityMetrics.completeness)}`}>
                {qualityMetrics.completeness}%
              </span>
            </div>
            <div className="text-sm font-medium">Completude</div>
            <div className="text-xs text-gray-600">Campos obrigatórios preenchidos</div>
            <Progress value={qualityMetrics.completeness} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className={`text-lg font-bold ${getQualityColor(qualityMetrics.accuracy)}`}>
                {qualityMetrics.accuracy}%
              </span>
            </div>
            <div className="text-sm font-medium">Precisão</div>
            <div className="text-xs text-gray-600">Dados corretos e válidos</div>
            <Progress value={qualityMetrics.accuracy} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Database className="h-5 w-5 text-purple-600" />
              <span className={`text-lg font-bold ${getQualityColor(qualityMetrics.consistency)}`}>
                {qualityMetrics.consistency}%
              </span>
            </div>
            <div className="text-sm font-medium">Consistência</div>
            <div className="text-xs text-gray-600">Padronização entre registros</div>
            <Progress value={qualityMetrics.consistency} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-orange-600" />
              <span className={`text-lg font-bold ${getQualityColor(qualityMetrics.validity)}`}>
                {qualityMetrics.validity}%
              </span>
            </div>
            <div className="text-sm font-medium">Validade</div>
            <div className="text-xs text-gray-600">Conformidade com regras</div>
            <Progress value={qualityMetrics.validity} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Issues Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Problemas Identificados</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {qualityMetrics.issues.map((issue, index) => (
              <Alert key={index} variant={issue.type === 'error' ? 'destructive' : 'default'}>
                {issue.type === 'error' ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <AlertDescription className="flex items-center justify-between">
                  <span>{issue.message}</span>
                  <Badge variant={issue.type === 'error' ? 'destructive' : 'secondary'}>
                    {issue.count} {issue.count === 1 ? 'item' : 'itens'}
                  </Badge>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quality Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Tendências de Qualidade</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+5%</div>
              <div className="text-sm text-gray-600">Melhoria esta semana</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600">Problemas resolvidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">3</div>
              <div className="text-sm text-gray-600">Novos problemas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Zap, 
  Eye, 
  Clock,
  DollarSign,
  Lightbulb,
  Download,
  RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Progress } from '@/components/ui/progress';

interface AIInsight {
  id: string;
  type: 'prediction' | 'anomaly' | 'optimization' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
  recommendation?: string;
  savings?: number;
  timeframe?: string;
}

interface PredictiveMetric {
  name: string;
  current: number;
  predicted: number;
  trend: 'up' | 'down' | 'stable';
  accuracy: number;
}

const mockInsights: AIInsight[] = [
  {
    id: '1',
    type: 'prediction',
    title: 'Pico de Demanda Previsto',
    description: 'Baseado nos padrões históricos, prevemos um aumento de 35% na demanda por ferramentas elétricas na próxima semana.',
    impact: 'high',
    confidence: 87,
    actionable: true,
    recommendation: 'Considere aumentar o estoque de furadeiras e parafusadeiras em 25%',
    timeframe: '7 dias'
  },
  {
    id: '2',
    type: 'anomaly',
    title: 'Padrão Anômalo Detectado',
    description: 'A ferramenta "Serra Circular Bosch" está sendo utilizada 3x mais que o normal por um único usuário.',
    impact: 'medium',
    confidence: 94,
    actionable: true,
    recommendation: 'Verificar se há necessidade de manutenção ou se o usuário precisa de treinamento'
  },
  {
    id: '3',
    type: 'optimization',
    title: 'Oportunidade de Economia',
    description: 'Realocando 12 ferramentas subutilizadas, é possível economizar até R$ 2.400/mês em custos de manutenção.',
    impact: 'high',
    confidence: 91,
    actionable: true,
    recommendation: 'Redistribuir ferramentas entre setores com base na análise de utilização',
    savings: 2400
  },
  {
    id: '4',
    type: 'trend',
    title: 'Tendência de Crescimento',
    description: 'O uso de ferramentas sustentáveis cresceu 45% nos últimos 3 meses, indicando mudança de preferência.',
    impact: 'medium',
    confidence: 78,
    actionable: true,
    recommendation: 'Investir em mais ferramentas elétricas e reduzir pneumáticas'
  }
];

const predictiveMetrics: PredictiveMetric[] = [
  { name: 'Utilização Geral', current: 78, predicted: 85, trend: 'up', accuracy: 89 },
  { name: 'Custos de Manutenção', current: 12500, predicted: 11200, trend: 'down', accuracy: 92 },
  { name: 'Tempo Médio de Uso', current: 4.2, predicted: 3.8, trend: 'down', accuracy: 86 },
  { name: 'Satisfação Usuários', current: 8.3, predicted: 8.7, trend: 'up', accuracy: 84 }
];

const utilizationTrendData = [
  { month: 'Jan', atual: 65, previsto: 68, otimizado: 75 },
  { month: 'Fev', atual: 78, previsto: 82, otimizado: 88 },
  { month: 'Mar', atual: 82, previsto: 85, otimizado: 92 },
  { month: 'Abr', atual: 75, previsto: 78, otimizado: 85 },
  { month: 'Mai', atual: 88, previsto: 92, otimizado: 95 },
  { month: 'Jun', atual: 92, previsto: 95, otimizado: 98 }
];

const costOptimizationData = [
  { category: 'Manutenção', atual: 15000, otimizado: 12000, economia: 3000 },
  { category: 'Aquisições', atual: 25000, otimizado: 22000, economia: 3000 },
  { category: 'Operacional', atual: 8000, otimizado: 7200, economia: 800 },
  { category: 'Treinamento', atual: 3000, otimizado: 2500, economia: 500 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AIAnalyticsDashboard: React.FC = () => {
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');

  const refreshAnalytics = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <TrendingUp className="h-5 w-5" />;
      case 'anomaly': return <AlertTriangle className="h-5 w-5" />;
      case 'optimization': return <Target className="h-5 w-5" />;
      case 'trend': return <Eye className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            Analytics com IA
          </h1>
          <p className="text-gray-600 mt-2">Insights inteligentes e previsões para otimização do almoxarifado</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={refreshAnalytics}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">
            <Lightbulb className="h-4 w-4 mr-2" />
            Insights IA
          </TabsTrigger>
          <TabsTrigger value="predictions">
            <TrendingUp className="h-4 w-4 mr-2" />
            Previsões
          </TabsTrigger>
          <TabsTrigger value="optimization">
            <Target className="h-4 w-4 mr-2" />
            Otimização
          </TabsTrigger>
          <TabsTrigger value="trends">
            <Eye className="h-4 w-4 mr-2" />
            Tendências
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockInsights.map((insight) => (
              <Card 
                key={insight.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedInsight?.id === insight.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedInsight(insight)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <CardTitle className="text-sm">{insight.title}</CardTitle>
                    </div>
                    <Badge className={getImpactColor(insight.impact)}>
                      {insight.impact}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Confiança</span>
                    <span className="text-xs font-medium">{insight.confidence}%</span>
                  </div>
                  <Progress value={insight.confidence} className="h-2 mb-3" />
                  
                  {insight.actionable && (
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-xs text-yellow-600">Ação recomendada</span>
                    </div>
                  )}
                  
                  {insight.savings && (
                    <div className="flex items-center gap-2 mt-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-600">
                        Economia: R$ {insight.savings.toLocaleString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedInsight && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getInsightIcon(selectedInsight.type)}
                  Detalhes do Insight
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{selectedInsight.title}</h4>
                    <p className="text-gray-600">{selectedInsight.description}</p>
                  </div>
                  
                  {selectedInsight.recommendation && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">Recomendação</h5>
                      <p className="text-blue-800">{selectedInsight.recommendation}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Confiança: </span>
                      <span className="font-medium">{selectedInsight.confidence}%</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Impacto: </span>
                      <Badge className={getImpactColor(selectedInsight.impact)}>
                        {selectedInsight.impact}
                      </Badge>
                    </div>
                    {selectedInsight.timeframe && (
                      <div>
                        <span className="text-sm text-gray-500">Prazo: </span>
                        <span className="font-medium">{selectedInsight.timeframe}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm">Aplicar Recomendação</Button>
                    <Button variant="outline" size="sm">Agendar Revisão</Button>
                    <Button variant="ghost" size="sm">Descartar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {predictiveMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{metric.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Atual</span>
                      <span className="font-medium">
                        {typeof metric.current === 'number' && metric.current > 100 
                          ? `R$ ${metric.current.toLocaleString()}` 
                          : metric.current}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Previsto</span>
                      <span className={`font-medium ${
                        metric.trend === 'up' ? 'text-green-600' : 
                        metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {typeof metric.predicted === 'number' && metric.predicted > 100 
                          ? `R$ ${metric.predicted.toLocaleString()}` 
                          : metric.predicted}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Precisão</span>
                      <span className="text-sm">{metric.accuracy}%</span>
                    </div>
                    <Progress value={metric.accuracy} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Projeção de Utilização</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={utilizationTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="atual" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="previsto" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="otimizado" stackId="1" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Oportunidades de Otimização de Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costOptimizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      `R$ ${value.toLocaleString()}`, 
                      name === 'atual' ? 'Atual' : name === 'otimizado' ? 'Otimizado' : 'Economia'
                    ]}
                  />
                  <Bar dataKey="atual" fill="#8884d8" />
                  <Bar dataKey="otimizado" fill="#82ca9d" />
                  <Bar dataKey="economia" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Economia Total Projetada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    R$ 7.300
                  </div>
                  <div className="text-sm text-gray-600">por mês</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Baseado em otimizações identificadas pela IA
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ROI das Otimizações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    234%
                  </div>
                  <div className="text-sm text-gray-600">em 12 meses</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Considerando implementação das recomendações
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendências de Uso por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Elétricas', value: 35, color: '#0088FE' },
                        { name: 'Manuais', value: 25, color: '#00C49F' },
                        { name: 'Pneumáticas', value: 20, color: '#FFBB28' },
                        { name: 'Medição', value: 20, color: '#FF8042' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {[
                        { name: 'Elétricas', value: 35, color: '#0088FE' },
                        { name: 'Manuais', value: 25, color: '#00C49F' },
                        { name: 'Pneumáticas', value: 20, color: '#FFBB28' },
                        { name: 'Medição', value: 20, color: '#FF8042' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Padrões Sazonais Detectados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <div>
                      <span className="font-medium">Pico de Inverno</span>
                      <p className="text-sm text-gray-600">+40% uso de ferramentas elétricas</p>
                    </div>
                    <Badge>Jun-Ago</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <div>
                      <span className="font-medium">Temporada de Construção</span>
                      <p className="text-sm text-gray-600">+60% demanda geral</p>
                    </div>
                    <Badge>Set-Nov</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                    <div>
                      <span className="font-medium">Manutenção Preventiva</span>
                      <p className="text-sm text-gray-600">+25% ferramentas em revisão</p>
                    </div>
                    <Badge>Dez-Jan</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

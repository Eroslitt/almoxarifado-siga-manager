import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  ClipboardCheck, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  FileText,
  Building2,
  QrCode,
  Plus,
  Activity,
  Eye
} from 'lucide-react';

interface DashboardProps {
  onModuleChange?: (module: string) => void;
}

export const DashboardMain: React.FC<DashboardProps> = ({ onModuleChange }) => {
  const quickActions = [
    {
      id: 'epi-control',
      title: 'Controle de EPIs',
      description: 'Sistema digitalizado com assinaturas em dispositivos móveis',
      icon: Shield,
      color: 'bg-green-500',
      features: [
        'Assinatura digital em tablets/smartphones',
        'Controle de vencimento automático',
        'Histórico completo de distribuições',
        'Certificados de entrega digitais'
      ],
      stats: { total: 45, available: 32, inUse: 8, expired: 5 }
    },
    {
      id: 'material-verification',
      title: 'Verificação de Materiais',
      description: 'Controle de qualidade na chegada de materiais à obra',
      icon: ClipboardCheck,
      color: 'bg-blue-500',
      features: [
        'Checklist digital de qualidade',
        'Fotos e documentação integrada',
        'Aprovação/rejeição automática',
        'Relatórios de conformidade'
      ],
      stats: { total: 28, pending: 12, approved: 14, rejected: 2 }
    },
    {
      id: 'stock',
      title: 'Gestão de Estoque',
      description: 'Controle completo de inventário e movimentações',
      icon: Package,
      color: 'bg-purple-500',
      features: [
        'Controle de entrada e saída',
        'Níveis mínimos e máximos',
        'Rastreabilidade completa',
        'Relatórios de movimentação'
      ],
      stats: { total: 156, lowStock: 8, outOfStock: 3, categories: 12 }
    },
    {
      id: 'reports',
      title: 'Relatórios e Analytics',
      description: 'Análises detalhadas e relatórios customizados',
      icon: BarChart3,
      color: 'bg-orange-500',
      features: [
        'Dashboards em tempo real',
        'Relatórios PDF automáticos',
        'Análise de tendências',
        'Exportação de dados'
      ],
      stats: { daily: 15, weekly: 8, monthly: 25, custom: 12 }
    }
  ];

  const recentActivities = [
    {
      type: 'epi',
      message: 'EPI Capacete entregue para João Silva',
      time: '2 min atrás',
      icon: Shield,
      color: 'text-green-600'
    },
    {
      type: 'material',
      message: 'Material Cimento Portland aprovado na verificação',
      time: '15 min atrás',
      icon: ClipboardCheck,
      color: 'text-blue-600'
    },
    {
      type: 'stock',
      message: 'Estoque de Luvas de Segurança baixo (5 unidades)',
      time: '1 hora atrás',
      icon: AlertTriangle,
      color: 'text-yellow-600'
    },
    {
      type: 'user',
      message: 'Novo usuário Maria Santos cadastrado',
      time: '2 horas atrás',
      icon: Users,
      color: 'text-purple-600'
    }
  ];

  const handleQuickAction = (moduleId: string) => {
    onModuleChange?.(moduleId);
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Sistema SIGA Almoxarifado
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Plataforma completa para gestão profissional de EPIs, materiais e almoxarifado. 
          Controle digital, assinaturas móveis e relatórios em tempo real.
        </p>
        <div className="flex justify-center space-x-4">
          <Badge variant="secondary" className="bg-green-100 text-green-800 px-4 py-2">
            <CheckCircle className="h-4 w-4 mr-2" />
            Premium Ativo
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-4 py-2">
            <Activity className="h-4 w-4 mr-2" />
            Sistema Online
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EPIs Ativos</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">32</div>
            <p className="text-xs text-gray-500">45 total cadastrados</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verificações Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">12</div>
            <p className="text-xs text-gray-500">28 total este mês</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens em Estoque</CardTitle>
            <Package className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">156</div>
            <p className="text-xs text-gray-500">12 categorias ativas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformidade</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">98%</div>
            <p className="text-xs text-gray-500">+5% este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Features */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Funcionalidades Principais
          </h2>
          <p className="text-gray-600">
            Acesse todas as ferramentas da plataforma com um clique
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-lg ${action.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{action.title}</CardTitle>
                        <CardDescription className="text-base">
                          {action.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(action.stats).map(([key, value]) => (
                      <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{value}</div>
                        <div className="text-sm text-gray-500 capitalize">{key}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Recursos:</h4>
                    <ul className="space-y-1">
                      {action.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => handleQuickAction(action.id)}
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Acessar
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleQuickAction('reports')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Atividades Recentes</span>
          </CardTitle>
          <CardDescription>
            Últimas movimentações do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                  <Icon className={`h-5 w-5 ${activity.color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleQuickAction('tools-qr')}>
          <CardHeader className="text-center">
            <QrCode className="h-12 w-12 mx-auto text-gray-600 mb-2" />
            <CardTitle>Ferramentas QR</CardTitle>
            <CardDescription>
              Geração e leitura de códigos QR para identificação
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleQuickAction('master-data')}>
          <CardHeader className="text-center">
            <Building2 className="h-12 w-12 mx-auto text-gray-600 mb-2" />
            <CardTitle>Dados Mestres</CardTitle>
            <CardDescription>
              Configuração de categorias, fornecedores e locais
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleQuickAction('more-options')}>
          <CardHeader className="text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-600 mb-2" />
            <CardTitle>Configurações</CardTitle>
            <CardDescription>
              Personalização e configurações avançadas
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default DashboardMain;
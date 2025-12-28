import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Search,
  Bell,
  Package,
  User,
  RefreshCw,
  Database
} from 'lucide-react';

interface MoreOptionsModuleProps {
  onModuleChange?: (module: string) => void;
}

export const MoreOptionsModule = ({ onModuleChange }: MoreOptionsModuleProps) => {
  const additionalOptions = [
    {
      id: 'personalized-dashboard',
      title: 'Dashboard Personalizado',
      description: 'Customize sua visualização',
      icon: Package,
      color: 'text-blue-600'
    },
    {
      id: 'ai-analytics',
      title: 'Analytics IA',
      description: 'Análises inteligentes',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      id: 'realtime-analytics',
      title: 'Analytics Tempo Real',
      description: 'Monitoramento em tempo real',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      id: 'workflow-manager',
      title: 'Gestão de Workflows',
      description: 'Controle de processos e aprovações',
      icon: Search,
      color: 'text-orange-600'
    },
    {
      id: 'connector-hub',
      title: 'Hub de Conectores',
      description: 'Integrações com sistemas externos',
      icon: Package,
      color: 'text-cyan-600'
    },
    {
      id: 'performance-monitor',
      title: 'Monitor de Performance',
      description: 'Acompanhe a performance do sistema',
      icon: Search,
      color: 'text-green-600'
    },
    {
      id: 'sync-monitor',
      title: 'Monitor de Sincronização',
      description: 'Gerencie dados offline e sincronização',
      icon: RefreshCw,
      color: 'text-blue-600'
    },
    {
      id: 'api-manager',
      title: 'Gerenciamento de APIs',
      description: 'Gerencie suas integrações',
      icon: Database,
      color: 'text-orange-600'
    },
    {
      id: 'security-dashboard',
      title: 'Dashboard de Segurança',
      description: 'Monitore a segurança do sistema',
      icon: Bell,
      color: 'text-red-600'
    },
    {
      id: 'masterdata',
      title: 'Master Data Avançado',
      description: 'Configurações avançadas de dados',
      icon: Package,
      color: 'text-indigo-600'
    }
  ];

  return (
    <PageContainer
      title="Mais Opções"
      description="Funcionalidades avançadas e configurações"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {additionalOptions.map((option) => {
          const Icon = option.icon;
          
          return (
            <Card 
              key={option.id}
              className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20"
              onClick={() => onModuleChange?.(option.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-muted`}>
                    <Icon className={`h-6 w-6 ${option.color}`} />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    {option.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  {option.description}
                </p>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onModuleChange?.(option.id);
                  }}
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
};

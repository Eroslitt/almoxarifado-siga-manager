import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  FolderMinus, 
  TrendingUp, 
  Search,
  Bell,
  Folder
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
      icon: FolderMinus,
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
      id: 'performance-monitor',
      title: 'Monitor de Performance',
      description: 'Acompanhe a performance',
      icon: Search,
      color: 'text-green-600'
    },
    {
      id: 'api-manager',
      title: 'Gerenciamento de APIs',
      description: 'Gerencie suas integrações',
      icon: Settings,
      color: 'text-orange-600'
    },
    {
      id: 'security-dashboard',
      title: 'Dashboard de Segurança',
      description: 'Monitore a segurança',
      icon: Bell,
      color: 'text-red-600'
    },
    {
      id: 'masterdata',
      title: 'Master Data Avançado',
      description: 'Configurações avançadas',
      icon: Folder,
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
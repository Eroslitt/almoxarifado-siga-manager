
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Clock, 
  User, 
  Wrench,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ToolsOverview = () => {
  const { toast } = useToast();

  const handleViewDetails = (tool: any) => {
    toast({
      title: `Detalhes - ${tool.name}`,
      description: `ID: ${tool.id} | Usuário: ${tool.user} (${tool.department}) | Em uso desde ${tool.since} há ${tool.duration}`,
    });
  };
  const currentlyInUse = [
    {
      id: 'FER-08172',
      name: 'Furadeira de Impacto Makita',
      user: 'João Silva',
      department: 'Manutenção',
      since: '14:30',
      duration: '2h 15m',
      overdue: false
    },
    {
      id: 'FER-03945',
      name: 'Esmerilhadeira Angular',
      user: 'Carlos Oliveira',
      department: 'Produção',
      since: '09:15',
      duration: '7h 30m',
      overdue: true
    },
    {
      id: 'FER-05621',
      name: 'Parafusadeira Elétrica',
      user: 'Ana Costa',
      department: 'Montagem',
      since: '13:45',
      duration: '3h 00m',
      overdue: false
    }
  ];

  const maintenanceQueue = [
    {
      id: 'FER-02134',
      name: 'Chave de Impacto',
      issue: 'Cabo com mau contato',
      reportedBy: 'Maria Santos',
      priority: 'high'
    },
    {
      id: 'FER-07891',
      name: 'Morsa de Bancada',
      issue: 'Parafuso de aperto danificado',
      reportedBy: 'Roberto Lima',
      priority: 'medium'
    }
  ];

  const utilizationStats = {
    daily: 78,
    weekly: 65,
    monthly: 72
  };

  return (
    <div className="space-y-6">
      {/* Ferramentas Atualmente em Uso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>Ferramentas Atualmente em Uso</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentlyInUse.map((tool) => (
              <div key={tool.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h4 className="font-semibold">{tool.name}</h4>
                      <p className="text-sm text-gray-600">
                        ID: {tool.id} • {tool.user} ({tool.department})
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          Desde {tool.since} • Há {tool.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {tool.overdue && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Atrasado
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(tool)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fila de Manutenção */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-orange-600" />
              <span>Fila de Manutenção</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {maintenanceQueue.map((item) => (
                <div key={item.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.issue}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Reportado por: {item.reportedBy}
                      </p>
                    </div>
                    <Badge 
                      variant={item.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {item.priority === 'high' ? 'Alta' : 'Média'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas de Utilização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Taxa de Utilização</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Hoje</span>
                  <span className="font-medium">{utilizationStats.daily}%</span>
                </div>
                <Progress value={utilizationStats.daily} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Esta Semana</span>
                  <span className="font-medium">{utilizationStats.weekly}%</span>
                </div>
                <Progress value={utilizationStats.weekly} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Este Mês</span>
                  <span className="font-medium">{utilizationStats.monthly}%</span>
                </div>
                <Progress value={utilizationStats.monthly} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

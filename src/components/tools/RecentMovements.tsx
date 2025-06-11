
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface Movement {
  id: number;
  tool: string;
  toolId: string;
  user: string;
  action: string;
  timestamp: string;
  status: string;
  condition?: string;
}

interface RecentMovementsProps {
  movements: Movement[];
}

export const RecentMovements = ({ movements }: RecentMovementsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in-use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponível';
      case 'in-use': return 'Em Uso';
      case 'maintenance': return 'Manutenção';
      default: return 'Desconhecido';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Movimentações Recentes</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {movements.map((movement) => (
            <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div>
                    <h4 className="font-medium">{movement.tool}</h4>
                    <p className="text-sm text-gray-600">
                      ID: {movement.toolId} • {movement.action} por {movement.user}
                    </p>
                    <p className="text-xs text-gray-500">{movement.timestamp}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(movement.status)}>
                  {getStatusText(movement.status)}
                </Badge>
                {movement.condition && (
                  <span className="text-xs text-gray-500">
                    Condição: {movement.condition}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

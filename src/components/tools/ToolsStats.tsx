
import { Card, CardContent } from '@/components/ui/card';
import { Wrench, User, AlertTriangle } from 'lucide-react';

interface ToolsStatsProps {
  stats: {
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
  };
}

export const ToolsStats = ({ stats }: ToolsStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Wrench className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total de Ferramentas</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-green-600 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Disponíveis</p>
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <User className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Em Uso</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inUse}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Em Manutenção</p>
              <p className="text-2xl font-bold text-red-600">{stats.maintenance}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

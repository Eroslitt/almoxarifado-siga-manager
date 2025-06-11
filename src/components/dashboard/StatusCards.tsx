
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  QrCode,
  Users,
  Wrench
} from 'lucide-react';

export const StatusCards = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5 text-purple-600" />
            <span>Status Ferramentas QR</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600">Disponíveis</span>
              <span className="font-semibold">98</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-600">Em Uso</span>
              <span className="font-semibold">35</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-600">Manutenção</span>
              <span className="font-semibold">12</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Operadores Ativos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Recebimento</span>
              <span className="font-semibold">3/3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Separação</span>
              <span className="font-semibold">5/6</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Expedição</span>
              <span className="font-semibold">2/2</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="h-5 w-5 text-orange-600" />
            <span>Performance QR</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Taxa de Utilização</span>
                <span>73%</span>
              </div>
              <Progress value={73} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Tempo Médio de Uso</span>
                <span>4.2h</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

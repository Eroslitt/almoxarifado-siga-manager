
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  Clock,
  User,
  Wrench
} from 'lucide-react';

export const ToolsReports = () => {
  const utilizationData = [
    { name: 'Seg', utilizacao: 65 },
    { name: 'Ter', utilizacao: 78 },
    { name: 'Qua', utilizacao: 82 },
    { name: 'Qui', utilizacao: 75 },
    { name: 'Sex', utilizacao: 88 },
    { name: 'Sáb', utilizacao: 45 },
    { name: 'Dom', utilizacao: 20 },
  ];

  const categoryData = [
    { name: 'Elétricas', value: 35, color: '#3b82f6' },
    { name: 'Manuais', value: 45, color: '#10b981' },
    { name: 'Pneumáticas', value: 15, color: '#f59e0b' },
    { name: 'Medição', value: 5, color: '#ef4444' },
  ];

  const topUsers = [
    { name: 'João Silva', department: 'Manutenção', checkouts: 45, avgTime: '4.2h' },
    { name: 'Carlos Oliveira', department: 'Produção', checkouts: 38, avgTime: '3.8h' },
    { name: 'Ana Costa', department: 'Montagem', checkouts: 32, avgTime: '5.1h' },
    { name: 'Maria Santos', department: 'Qualidade', checkouts: 28, avgTime: '2.9h' },
  ];

  const maintenanceStats = [
    { tool: 'Furadeira de Impacto', issues: 8, avgRepairTime: '2.5 dias' },
    { tool: 'Esmerilhadeira Angular', issues: 6, avgRepairTime: '1.8 dias' },
    { tool: 'Chave de Impacto', issues: 5, avgRepairTime: '3.2 dias' },
    { tool: 'Parafusadeira Elétrica', issues: 4, avgRepairTime: '1.5 dias' },
  ];

  return (
    <div className="space-y-6">
      {/* Controles Superiores */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Relatórios e Analytics</h2>
          <p className="text-gray-600">Análise detalhada do uso de ferramentas</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Período
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Taxa de Utilização</p>
                <p className="text-2xl font-bold text-green-600">73%</p>
                <p className="text-xs text-gray-500">+5% vs mês anterior</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Tempo Médio de Uso</p>
                <p className="text-2xl font-bold">4.2h</p>
                <p className="text-xs text-gray-500">Por checkout</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Checkouts Hoje</p>
                <p className="text-2xl font-bold">28</p>
                <p className="text-xs text-gray-500">+12 vs ontem</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wrench className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">MTTR Manutenção</p>
                <p className="text-2xl font-bold">2.1d</p>
                <p className="text-xs text-gray-500">Tempo médio de reparo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Utilização Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Utilização']} />
                <Bar dataKey="utilizacao" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabelas de Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topUsers.map((user, index) => (
                <div key={user.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{user.name}</h4>
                      <p className="text-sm text-gray-600">{user.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{user.checkouts} checkouts</p>
                    <p className="text-sm text-gray-600">Média: {user.avgTime}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Manutenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenanceStats.map((item, index) => (
                <div key={item.tool} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{item.tool}</h4>
                    <Badge variant="secondary">{item.issues} ocorrências</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Tempo médio de reparo: {item.avgRepairTime}</p>
                  </div>
                  <div className="mt-2">
                    <Progress value={(10 - item.issues) * 10} className="h-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Download, 
  Calendar, 
  TrendingUp,
  Package,
  Clock,
  AlertTriangle
} from 'lucide-react';

export const ReportsModule = () => {
  const accuracyData = [
    { month: 'Jan', isa: 97.5, target: 98 },
    { month: 'Fev', isa: 98.2, target: 98 },
    { month: 'Mar', isa: 97.8, target: 98 },
    { month: 'Abr', isa: 98.7, target: 98 },
    { month: 'Mai', isa: 98.1, target: 98 },
    { month: 'Jun', isa: 98.9, target: 98 },
  ];

  const turnoverData = [
    { category: 'Eletrônicos', giro: 8.5 },
    { category: 'Ferramentas', giro: 6.2 },
    { category: 'EPI', giro: 12.1 },
    { category: 'Consumíveis', giro: 15.3 },
    { category: 'Peças', giro: 4.8 },
  ];

  const abcData = [
    { name: 'Curva A', value: 20, color: '#3b82f6' },
    { name: 'Curva B', value: 30, color: '#10b981' },
    { name: 'Curva C', value: 50, color: '#f59e0b' },
  ];

  const performanceData = [
    { day: 'Seg', picking: 4.2, packing: 2.1, shipping: 1.8 },
    { day: 'Ter', picking: 3.8, packing: 2.3, shipping: 1.5 },
    { day: 'Qua', picking: 4.5, packing: 2.0, shipping: 2.1 },
    { day: 'Qui', picking: 4.1, packing: 2.4, shipping: 1.9 },
    { day: 'Sex', picking: 3.9, packing: 2.2, shipping: 1.7 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios e BI</h1>
          <p className="text-gray-600 mt-1">Análises e indicadores de performance</p>
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

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">ISA Médio</p>
                <p className="text-2xl font-bold text-green-600">98.4%</p>
                <p className="text-xs text-green-600">+0.3% vs mês anterior</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Giro Médio</p>
                <p className="text-2xl font-bold">9.4x</p>
                <p className="text-xs text-blue-600">ano</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Lead Time</p>
                <p className="text-2xl font-bold">4.1 min</p>
                <p className="text-xs text-green-600">-0.2 min vs meta</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Itens Críticos</p>
                <p className="text-2xl font-bold">1.2%</p>
                <p className="text-xs text-orange-600">do total de SKUs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Acuracidade de Estoque (ISA)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[95, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'ISA']} />
                <Line 
                  type="monotone" 
                  dataKey="isa" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Giro de Estoque por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={turnoverData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}x`, 'Giro/Ano']} />
                <Bar dataKey="giro" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição ABC</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={abcData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {abcData.map((entry, index) => (
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
            <CardTitle>Tempos de Processo (min)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="picking" fill="#3b82f6" name="Picking" />
                <Bar dataKey="packing" fill="#10b981" name="Packing" />
                <Bar dataKey="shipping" fill="#f59e0b" name="Expedição" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Indicadores */}
      <Card>
        <CardHeader>
          <CardTitle>Indicadores de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Indicador</th>
                  <th className="text-left p-2">Atual</th>
                  <th className="text-left p-2">Meta</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Tendência</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">Acuracidade de Estoque (ISA)</td>
                  <td className="p-2">98.4%</td>
                  <td className="p-2">≥98%</td>
                  <td className="p-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Atingido
                    </span>
                  </td>
                  <td className="p-2 text-green-600">↗ +0.3%</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Tempo Médio de Picking</td>
                  <td className="p-2">4.1 min</td>
                  <td className="p-2">≤4.5 min</td>
                  <td className="p-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Atingido
                    </span>
                  </td>
                  <td className="p-2 text-green-600">↗ -0.2 min</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Itens em Estoque Crítico</td>
                  <td className="p-2">1.2%</td>
                  <td className="p-2">≤2%</td>
                  <td className="p-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Atingido
                    </span>
                  </td>
                  <td className="p-2 text-red-600">↗ +0.1%</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Ocupação do Almoxarifado</td>
                  <td className="p-2">76%</td>
                  <td className="p-2">70-85%</td>
                  <td className="p-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Atingido
                    </span>
                  </td>
                  <td className="p-2 text-blue-600">→ Estável</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

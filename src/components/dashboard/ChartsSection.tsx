
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const ChartsSection = () => {
  const stockData = [
    { name: 'Jan', entradas: 4000, saidas: 2400 },
    { name: 'Fev', entradas: 3000, saidas: 1398 },
    { name: 'Mar', entradas: 2000, saidas: 9800 },
    { name: 'Abr', entradas: 2780, saidas: 3908 },
    { name: 'Mai', entradas: 1890, saidas: 4800 },
    { name: 'Jun', entradas: 2390, saidas: 3800 },
  ];

  const categoryData = [
    { name: 'Eletrônicos', value: 4000 },
    { name: 'Ferramentas', value: 3000 },
    { name: 'Consumíveis', value: 2000 },
    { name: 'EPI', value: 2780 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Movimentação de Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="entradas" 
                stackId="1" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="saidas" 
                stackId="1" 
                stroke="#ef4444" 
                fill="#ef4444" 
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estoque por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

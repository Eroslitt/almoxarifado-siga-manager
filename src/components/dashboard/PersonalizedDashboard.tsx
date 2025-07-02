
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Plus, 
  GripVertical, 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  Users, 
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Cell, BarChart, Bar } from 'recharts';

interface Widget {
  id: string;
  type: 'kpi' | 'chart' | 'list' | 'calendar' | 'activity';
  title: string;
  size: 'small' | 'medium' | 'large';
  data: any;
  position: { x: number; y: number };
}

const mockWidgets: Widget[] = [
  {
    id: '1',
    type: 'kpi',
    title: 'Ferramentas Ativas',
    size: 'small',
    data: { value: 145, change: '+12%', trend: 'up' },
    position: { x: 0, y: 0 }
  },
  {
    id: '2',
    type: 'kpi',
    title: 'Estoque Crítico',
    size: 'small',
    data: { value: 23, change: '-5%', trend: 'down' },
    position: { x: 1, y: 0 }
  },
  {
    id: '3',
    type: 'chart',
    title: 'Utilização Mensal',
    size: 'medium',
    data: {
      chartData: [
        { month: 'Jan', usage: 65 },
        { month: 'Fev', usage: 78 },
        { month: 'Mar', usage: 82 },
        { month: 'Abr', usage: 75 },
        { month: 'Mai', usage: 88 },
        { month: 'Jun', usage: 92 }
      ]
    },
    position: { x: 2, y: 0 }
  },
  {
    id: '4',
    type: 'list',
    title: 'Alertas Recentes',
    size: 'medium',
    data: {
      items: [
        { id: 1, text: 'Furadeira precisa manutenção', priority: 'high', time: '2h' },
        { id: 2, text: 'Estoque baixo - Parafusos M6', priority: 'medium', time: '4h' },
        { id: 3, text: 'Nova ferramenta cadastrada', priority: 'low', time: '6h' }
      ]
    },
    position: { x: 0, y: 1 }
  },
  {
    id: '5',
    type: 'activity',
    title: 'Atividade em Tempo Real',
    size: 'large',
    data: {
      activities: [
        { user: 'João Silva', action: 'Retirou', item: 'Serra Circular', time: '14:30' },
        { user: 'Maria Santos', action: 'Devolveu', item: 'Furadeira', time: '14:25' },
        { user: 'Pedro Costa', action: 'Solicitou', item: 'Chave Inglesa', time: '14:20' }
      ]
    },
    position: { x: 1, y: 1 }
  }
];

const chartColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export const PersonalizedDashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>(mockWidgets);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<'compact' | 'comfortable' | 'spacious'>('comfortable');

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
  };

  const renderKPIWidget = (widget: Widget) => (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{widget.data.value}</div>
          <div className={`flex items-center text-sm ${
            widget.data.trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className="h-4 w-4 mr-1" />
            {widget.data.change}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderChartWidget = (widget: Widget) => (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={widget.data.chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="usage" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderListWidget = (widget: Widget) => (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {widget.data.items.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${
                  item.priority === 'high' ? 'text-red-500' :
                  item.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'
                }`} />
                <span className="text-sm">{item.text}</span>
              </div>
              <span className="text-xs text-gray-500">{item.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderActivityWidget = (widget: Widget) => (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Ao vivo</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {widget.data.activities.map((activity: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <span className="text-sm font-medium">{activity.user}</span>
                  <p className="text-xs text-gray-600">
                    {activity.action} {activity.item}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'kpi': return renderKPIWidget(widget);
      case 'chart': return renderChartWidget(widget);
      case 'list': return renderListWidget(widget);
      case 'activity': return renderActivityWidget(widget);
      default: return null;
    }
  };

  const getGridSize = (size: string) => {
    switch (size) {
      case 'small': return 'col-span-1 row-span-1';
      case 'medium': return 'col-span-2 row-span-1';
      case 'large': return 'col-span-3 row-span-2';
      default: return 'col-span-1 row-span-1';
    }
  };

  const getLayoutSpacing = () => {
    switch (selectedLayout) {
      case 'compact': return 'gap-2';
      case 'comfortable': return 'gap-4';
      case 'spacious': return 'gap-6';
      default: return 'gap-4';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Personalizado</h1>
          <p className="text-gray-600">Configure seus widgets para uma visão personalizada</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Layout:</span>
            <select
              value={selectedLayout}
              onChange={(e) => setSelectedLayout(e.target.value as any)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="compact">Compacto</option>
              <option value="comfortable">Confortável</option>
              <option value="spacious">Espaçoso</option>
            </select>
          </div>
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isEditing ? 'Concluir' : 'Editar'}
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Widget
          </Button>
        </div>
      </div>

      {isEditing ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`grid grid-cols-4 auto-rows-fr ${getLayoutSpacing()} min-h-96`}
              >
                {widgets.map((widget, index) => (
                  <Draggable key={widget.id} draggableId={widget.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${getGridSize(widget.size)} ${
                          snapshot.isDragging ? 'opacity-75 transform rotate-3' : ''
                        }`}
                      >
                        <div className="relative h-full">
                          <div
                            {...provided.dragHandleProps}
                            className="absolute top-2 right-2 z-10 p-1 bg-white rounded shadow cursor-move"
                          >
                            <GripVertical className="h-4 w-4 text-gray-400" />
                          </div>
                          {renderWidget(widget)}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className={`grid grid-cols-4 auto-rows-fr ${getLayoutSpacing()} min-h-96`}>
          {widgets.map((widget) => (
            <div key={widget.id} className={getGridSize(widget.size)}>
              {renderWidget(widget)}
            </div>
          ))}
        </div>
      )}

      {/* Widget Templates */}
      {isEditing && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Widgets Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <BarChart3 className="h-6 w-6 mb-2" />
                <span className="text-sm">Gráfico KPI</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <PieChart className="h-6 w-6 mb-2" />
                <span className="text-sm">Gráfico Pizza</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Activity className="h-6 w-6 mb-2" />
                <span className="text-sm">Atividades</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Calendar className="h-6 w-6 mb-2" />
                <span className="text-sm">Calendário</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMaintenance } from '@/hooks/useMaintenance';
import { Calendar, Clock, AlertTriangle, CheckCircle, DollarSign, Wrench } from 'lucide-react';

export const MaintenanceDashboard: React.FC = () => {
  const { 
    tasks, 
    schedule, 
    history, 
    costs, 
    isLoading, 
    scheduleTask, 
    updateTaskStatus 
  } = useMaintenance();
  
  const [selectedTab, setSelectedTab] = useState<'schedule' | 'tasks' | 'history' | 'costs'>('schedule');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'due_soon': return 'text-yellow-600 bg-yellow-100';
      case 'normal': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    await updateTaskStatus(taskId, 'completed', {
      actualDuration: Math.random() * 4 + 1, // Mock actual duration
      cost: Math.random() * 200 + 50 // Mock cost
    });
  };

  if (isLoading) {
    return <div className="p-6 text-center">Carregando dados de manutenção...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Sistema de Manutenção Preventiva</h2>
        <p className="text-gray-600">Gerencie manutenções, cronogramas e custos</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Agendadas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tasks.filter(t => t.status === 'scheduled').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-orange-600">
                  {tasks.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
              <Wrench className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Atrasadas</p>
                <p className="text-2xl font-bold text-red-600">
                  {schedule.filter(s => s.urgency === 'overdue').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Custo Médio</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {costs?.averageCost?.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { key: 'schedule', label: 'Cronograma', icon: Calendar },
          { key: 'tasks', label: 'Tarefas', icon: Wrench },
          { key: 'history', label: 'Histórico', icon: CheckCircle },
          { key: 'costs', label: 'Custos', icon: DollarSign }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              selectedTab === key 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Manutenções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {schedule.map((item) => (
                  <div key={item.toolId} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{item.toolName}</span>
                        <Badge className={getUrgencyColor(item.urgency)}>
                          {item.urgency === 'overdue' ? 'Atrasada' :
                           item.urgency === 'due_soon' ? 'Em breve' : 'Normal'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Próxima: {new Date(item.nextMaintenance).toLocaleDateString('pt-BR')}</p>
                        <p>Horas atuais: {item.currentHours}/{item.intervalHours}h</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`w-16 h-2 rounded-full ${
                        item.urgency === 'overdue' ? 'bg-red-200' :
                        item.urgency === 'due_soon' ? 'bg-yellow-200' : 'bg-green-200'
                      }`}>
                        <div 
                          className={`h-full rounded-full ${
                            item.urgency === 'overdue' ? 'bg-red-500' :
                            item.urgency === 'due_soon' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, (item.currentHours / item.intervalHours) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agendar Nova Manutenção</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ferramenta</label>
                  <select className="w-full p-2 border rounded">
                    <option>Selecione uma ferramenta...</option>
                    <option>Furadeira de Impacto Makita</option>
                    <option>Serra Circular Bosch</option>
                    <option>Esmerilhadeira Dewalt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <select className="w-full p-2 border rounded">
                    <option>Preventiva</option>
                    <option>Corretiva</option>
                    <option>Inspeção</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Data Agendada</label>
                  <input type="date" className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea 
                    className="w-full p-2 border rounded" 
                    rows={3}
                    placeholder="Descreva os procedimentos de manutenção..."
                  />
                </div>
                <Button className="w-full">Agendar Manutenção</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'tasks' && (
        <Card>
          <CardHeader>
            <CardTitle>Tarefas de Manutenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{task.toolName}</span>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline">
                        {task.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{task.description}</p>
                    <div className="text-xs text-gray-500">
                      <span>Agendado: {new Date(task.scheduledDate).toLocaleString('pt-BR')}</span>
                      {task.assignedTo && <span> • Responsável: {task.assignedTo}</span>}
                      <span> • Duração estimada: {task.estimatedDuration}h</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      task.status === 'completed' ? 'default' :
                      task.status === 'in_progress' ? 'secondary' :
                      task.status === 'scheduled' ? 'outline' : 'destructive'
                    }>
                      {task.status === 'completed' ? 'Concluída' :
                       task.status === 'in_progress' ? 'Em andamento' :
                       task.status === 'scheduled' ? 'Agendada' : 'Cancelada'}
                    </Badge>
                    {task.status === 'scheduled' && (
                      <Button size="sm" onClick={() => handleCompleteTask(task.id)}>
                        Concluir
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTab === 'costs' && costs && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>Custo Total (Mensal)</span>
                  <span className="font-bold">R$ {costs.totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>Custo Médio por Tarefa</span>
                  <span className="font-bold">R$ {costs.averageCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>Total de Tarefas</span>
                  <span className="font-bold">{costs.taskCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Breakdown por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {costs.breakdown.map((item) => (
                  <div key={item.type} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium capitalize">{item.type}</p>
                      <p className="text-sm text-gray-600">{item.count} tarefas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">R$ {item.cost.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">
                        {item.count > 0 ? `R$ ${(item.cost / item.count).toFixed(2)}/tarefa` : '-'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

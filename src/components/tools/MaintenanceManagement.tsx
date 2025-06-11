
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wrench, Calendar, DollarSign, Plus, Play, CheckCircle } from 'lucide-react';
import { maintenanceApi } from '@/services/maintenanceApi';
import { toolsApi } from '@/services/toolsApi';
import { MaintenanceSchedule, Tool } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const MaintenanceManagement = () => {
  const [maintenances, setMaintenances] = useState<MaintenanceSchedule[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [newMaintenance, setNewMaintenance] = useState({
    toolId: '',
    type: 'preventive' as MaintenanceSchedule['type'],
    scheduledDate: '',
    notes: ''
  });

  const [completionForm, setCompletionForm] = useState({
    id: '',
    cost: '',
    notes: '',
    partsUsed: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [maintenanceData, toolsData] = await Promise.all([
      maintenanceApi.getScheduledMaintenance(),
      toolsApi.getTools()
    ]);
    
    setMaintenances(maintenanceData);
    setTools(toolsData.data);
    setLoading(false);
  };

  const handleScheduleMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await maintenanceApi.scheduleMaintenanceService({
      toolId: newMaintenance.toolId,
      type: newMaintenance.type,
      scheduledDate: newMaintenance.scheduledDate,
      notes: newMaintenance.notes || undefined
    });

    if (result.success) {
      toast({ title: "Sucesso", description: result.message });
      setShowScheduleForm(false);
      setNewMaintenance({ toolId: '', type: 'preventive', scheduledDate: '', notes: '' });
      loadData();
    } else {
      toast({ title: "Erro", description: result.message, variant: "destructive" });
    }
  };

  const handleStartMaintenance = async (maintenanceId: string) => {
    const result = await maintenanceApi.startMaintenance(maintenanceId);
    if (result.success) {
      toast({ title: "Sucesso", description: result.message });
      loadData();
    } else {
      toast({ title: "Erro", description: result.message, variant: "destructive" });
    }
  };

  const handleCompleteMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await maintenanceApi.completeMaintenance(
      completionForm.id,
      completionForm.cost ? parseFloat(completionForm.cost) : undefined,
      completionForm.notes || undefined,
      completionForm.partsUsed ? JSON.parse(completionForm.partsUsed) : undefined
    );

    if (result.success) {
      toast({ title: "Sucesso", description: result.message });
      setCompletionForm({ id: '', cost: '', notes: '', partsUsed: '' });
      loadData();
    } else {
      toast({ title: "Erro", description: result.message, variant: "destructive" });
    }
  };

  const getStatusColor = (status: MaintenanceSchedule['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: MaintenanceSchedule['status']) => {
    switch (status) {
      case 'scheduled': return 'Agendada';
      case 'in-progress': return 'Em Andamento';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return 'Desconhecido';
    }
  };

  const getTypeText = (type: MaintenanceSchedule['type']) => {
    switch (type) {
      case 'preventive': return 'Preventiva';
      case 'corrective': return 'Corretiva';
      case 'inspection': return 'Inspeção';
      default: return 'Outro';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Carregando manutenções...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas de Manutenção */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Agendadas</p>
                <p className="text-2xl font-bold">
                  {maintenances.filter(m => m.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wrench className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold">
                  {maintenances.filter(m => m.status === 'in-progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Custo Mensal</p>
                <p className="text-2xl font-bold">
                  R$ {maintenances
                    .filter(m => m.cost && m.completed_date && 
                      new Date(m.completed_date).getMonth() === new Date().getMonth())
                    .reduce((sum, m) => sum + (m.cost || 0), 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <Wrench className="h-5 w-5" />
              <span>Gestão de Manutenção</span>
            </CardTitle>
            <Button onClick={() => setShowScheduleForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agendar Manutenção
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showScheduleForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Agendar Manutenção</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleScheduleMaintenance} className="space-y-4">
                  <div>
                    <Label htmlFor="tool">Ferramenta</Label>
                    <select
                      id="tool"
                      className="w-full p-2 border rounded"
                      value={newMaintenance.toolId}
                      onChange={(e) => setNewMaintenance(prev => ({ ...prev, toolId: e.target.value }))}
                      required
                    >
                      <option value="">Selecione uma ferramenta</option>
                      {tools.map(tool => (
                        <option key={tool.id} value={tool.id}>
                          {tool.name} - {tool.location}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Tipo de Manutenção</Label>
                      <select
                        id="type"
                        className="w-full p-2 border rounded"
                        value={newMaintenance.type}
                        onChange={(e) => setNewMaintenance(prev => ({ 
                          ...prev, 
                          type: e.target.value as MaintenanceSchedule['type'] 
                        }))}
                        required
                      >
                        <option value="preventive">Preventiva</option>
                        <option value="corrective">Corretiva</option>
                        <option value="inspection">Inspeção</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="scheduledDate">Data Agendada</Label>
                      <Input
                        id="scheduledDate"
                        type="datetime-local"
                        value={newMaintenance.scheduledDate}
                        onChange={(e) => setNewMaintenance(prev => ({ ...prev, scheduledDate: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={newMaintenance.notes}
                      onChange={(e) => setNewMaintenance(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Descreva o serviço necessário..."
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit">Agendar</Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowScheduleForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {maintenances.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma manutenção agendada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {maintenances.map((maintenance) => (
                <div key={maintenance.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getStatusColor(maintenance.status)}>
                          {getStatusText(maintenance.status)}
                        </Badge>
                        <Badge variant="outline">
                          {getTypeText(maintenance.type)}
                        </Badge>
                      </div>
                      <h4 className="font-semibold">{(maintenance as any).tools?.name}</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Agendado para: {new Date(maintenance.scheduled_date).toLocaleString('pt-BR')}</p>
                        {maintenance.notes && <p>Observações: {maintenance.notes}</p>}
                        {maintenance.cost && <p>Custo: R$ {maintenance.cost.toFixed(2)}</p>}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {maintenance.status === 'scheduled' && (
                        <Button 
                          size="sm"
                          onClick={() => handleStartMaintenance(maintenance.id)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      {maintenance.status === 'in-progress' && (
                        <Button 
                          size="sm"
                          onClick={() => setCompletionForm({ 
                            id: maintenance.id, 
                            cost: '', 
                            notes: '', 
                            partsUsed: '' 
                          })}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Concluir
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {completionForm.id === maintenance.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded">
                      <h5 className="font-medium mb-3">Concluir Manutenção</h5>
                      <form onSubmit={handleCompleteMaintenance} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="cost">Custo (R$)</Label>
                            <Input
                              id="cost"
                              type="number"
                              step="0.01"
                              value={completionForm.cost}
                              onChange={(e) => setCompletionForm(prev => ({ ...prev, cost: e.target.value }))}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label htmlFor="partsUsed">Peças Utilizadas (JSON)</Label>
                            <Input
                              id="partsUsed"
                              value={completionForm.partsUsed}
                              onChange={(e) => setCompletionForm(prev => ({ ...prev, partsUsed: e.target.value }))}
                              placeholder='{"parafusos": 5, "óleo": "1L"}'
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="completionNotes">Relatório Final</Label>
                          <Textarea
                            id="completionNotes"
                            value={completionForm.notes}
                            onChange={(e) => setCompletionForm(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Descreva o serviço realizado..."
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button type="submit" size="sm">Finalizar</Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCompletionForm({ id: '', cost: '', notes: '', partsUsed: '' })}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

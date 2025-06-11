import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { kittingApi } from '@/services/kittingApi';
import { toolsApi } from '@/services/toolsApi';
import { WorkTemplateWithItems } from '@/types/kitting';
import { Tool } from '@/types/database';
import { 
  Plus, 
  Settings, 
  Clock, 
  Users, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Wrench
} from 'lucide-react';

export const WorkTemplateManager = () => {
  const [templates, setTemplates] = useState<WorkTemplateWithItems[]>([]);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Form states
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState('');
  const [templateDepartment, setTemplateDepartment] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState(60);
  const [selectedTools, setSelectedTools] = useState<{
    toolId: string;
    quantity: number;
    priority: 'essential' | 'recommended' | 'optional';
    notes: string;
  }[]>([]);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadTemplates();
    loadAvailableTools();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await kittingApi.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableTools = async () => {
    try {
      const { data } = await toolsApi.getTools({ limit: 100 });
      setAvailableTools(data);
    } catch (error) {
      console.error('Erro ao carregar ferramentas:', error);
    }
  };

  const handleCreateTemplate = async () => {
    if (!user || !templateName || selectedTools.length === 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios e adicione pelo menos uma ferramenta",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const result = await kittingApi.createTemplate({
        name: templateName,
        description: templateDescription,
        category: templateCategory,
        department: templateDepartment,
        estimatedDuration,
        items: selectedTools
      }, user.id);

      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Template criado com sucesso",
        });
        setShowCreateDialog(false);
        resetForm();
        loadTemplates();
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao criar template:', error);
      toast({
        title: "Erro",
        description: "Erro interno do servidor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTemplateName('');
    setTemplateDescription('');
    setTemplateCategory('');
    setTemplateDepartment('');
    setEstimatedDuration(60);
    setSelectedTools([]);
  };

  const addToolToTemplate = () => {
    setSelectedTools([...selectedTools, {
      toolId: '',
      quantity: 1,
      priority: 'recommended',
      notes: ''
    }]);
  };

  const updateTemplateTool = (index: number, field: string, value: any) => {
    const updated = [...selectedTools];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedTools(updated);
  };

  const removeTemplateTool = (index: number) => {
    setSelectedTools(selectedTools.filter((_, i) => i !== index));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'essential': return 'bg-red-100 text-red-800';
      case 'recommended': return 'bg-blue-100 text-blue-800';
      case 'optional': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acesso Negado</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Você precisa estar logado para gerenciar templates.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Templates de Trabalho</h2>
          <p className="text-gray-600">Gerencie modelos de kits de ferramentas para diferentes tipos de trabalho</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Template de Trabalho</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-name">Nome do Template *</Label>
                  <Input
                    id="template-name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Ex: Instalação de Painel Elétrico"
                  />
                </div>
                
                <div>
                  <Label htmlFor="template-category">Categoria</Label>
                  <Input
                    id="template-category"
                    value={templateCategory}
                    onChange={(e) => setTemplateCategory(e.target.value)}
                    placeholder="Ex: Elétrica, Hidráulica"
                  />
                </div>
                
                <div>
                  <Label htmlFor="template-department">Departamento</Label>
                  <Input
                    id="template-department"
                    value={templateDepartment}
                    onChange={(e) => setTemplateDepartment(e.target.value)}
                    placeholder="Ex: Manutenção, Produção"
                  />
                </div>
                
                <div>
                  <Label htmlFor="estimated-duration">Duração Estimada (min)</Label>
                  <Input
                    id="estimated-duration"
                    type="number"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                    min={15}
                    max={480}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="template-description">Descrição</Label>
                <Textarea
                  id="template-description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Descreva o tipo de trabalho e suas especificidades..."
                  rows={3}
                />
              </div>

              {/* Ferramentas do Template */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label>Ferramentas do Template *</Label>
                  <Button onClick={addToolToTemplate} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Ferramenta
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {selectedTools.map((toolItem, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <Label>Ferramenta</Label>
                          <Select
                            value={toolItem.toolId}
                            onValueChange={(value) => updateTemplateTool(index, 'toolId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTools.map((tool) => (
                                <SelectItem key={tool.id} value={tool.id}>
                                  {tool.name} - {tool.location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Quantidade</Label>
                          <Input
                            type="number"
                            value={toolItem.quantity}
                            onChange={(e) => updateTemplateTool(index, 'quantity', Number(e.target.value))}
                            min={1}
                            max={10}
                          />
                        </div>
                        
                        <div>
                          <Label>Prioridade</Label>
                          <Select
                            value={toolItem.priority}
                            onValueChange={(value) => updateTemplateTool(index, 'priority', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="essential">Essencial</SelectItem>
                              <SelectItem value="recommended">Recomendada</SelectItem>
                              <SelectItem value="optional">Opcional</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-end">
                          <Button
                            onClick={() => removeTemplateTool(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Observações</Label>
                        <Input
                          value={toolItem.notes}
                          onChange={(e) => updateTemplateTool(index, 'notes', e.target.value)}
                          placeholder="Observações sobre esta ferramenta..."
                        />
                      </div>
                    </div>
                  ))}
                  
                  {selectedTools.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Nenhuma ferramenta adicionada. Clique em "Adicionar Ferramenta" para começar.
                    </p>
                  )}
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateTemplate} disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Template'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <p>Carregando templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum template criado ainda</p>
            <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
              Criar Primeiro Template
            </Button>
          </div>
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  </div>
                  <Badge className={template.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {template.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Informações básicas */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{template.estimated_duration_minutes} min</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{template.usage_count} usos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <span>{(template.success_rate * 100).toFixed(1)}% sucesso</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Wrench className="h-4 w-4 text-gray-500" />
                      <span>{template.items.length} itens</span>
                    </div>
                  </div>

                  {/* Categorias */}
                  <div className="flex flex-wrap gap-2">
                    {template.category && (
                      <Badge variant="outline">{template.category}</Badge>
                    )}
                    {template.department && (
                      <Badge variant="outline">{template.department}</Badge>
                    )}
                  </div>

                  {/* Preview dos itens */}
                  <div>
                    <Label className="text-xs text-gray-500">FERRAMENTAS:</Label>
                    <div className="mt-2 space-y-1">
                      {template.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="truncate">{item.tool.name}</span>
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority === 'essential' ? 'ESS' : 
                             item.priority === 'recommended' ? 'REC' : 'OPT'}
                          </Badge>
                        </div>
                      ))}
                      {template.items.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{template.items.length - 3} mais...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Usar Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

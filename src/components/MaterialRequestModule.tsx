import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package, Clock, CheckCircle, XCircle, AlertTriangle, Trash2, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMobile } from '@/hooks/use-mobile';

interface MaterialRequestItem {
  id: string;
  material_name: string;
  quantity: number;
  unit: string;
  estimated_price: number;
  notes?: string;
}

interface MaterialRequest {
  id: string;
  request_number: string;
  requester_name: string;
  department: string;
  project_code: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'in_progress' | 'delivered' | 'rejected';
  items: MaterialRequestItem[];
  total_estimated_value: number;
  requested_at: string;
  approved_at?: string;
  approved_by?: string;
  delivered_at?: string;
  delivered_by?: string;
  notes?: string;
}

export const MaterialRequestModule = () => {
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [newRequest, setNewRequest] = useState({
    requester_name: '',
    department: '',
    project_code: '',
    priority: 'normal' as const,
    notes: ''
  });
  const [requestItems, setRequestItems] = useState<Omit<MaterialRequestItem, 'id'>[]>([]);
  const [newItem, setNewItem] = useState({
    material_name: '',
    quantity: 0,
    unit: '',
    estimated_price: 0,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useMobile();
  const { toast } = useToast();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('material_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const addItemToRequest = () => {
    if (!newItem.material_name || newItem.quantity <= 0) {
      toast({
        title: "Dados incompletos",
        description: "Preencha nome do material e quantidade.",
        variant: "destructive"
      });
      return;
    }

    const item = {
      ...newItem,
      id: Date.now().toString()
    };

    setRequestItems(prev => [...prev, item as MaterialRequestItem]);
    setNewItem({
      material_name: '',
      quantity: 0,
      unit: '',
      estimated_price: 0,
      notes: ''
    });

    toast({
      title: "Item adicionado",
      description: "Material adicionado à requisição."
    });
  };

  const removeItemFromRequest = (index: number) => {
    setRequestItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return requestItems.reduce((total, item) => total + (item.quantity * item.estimated_price), 0);
  };

  const submitRequest = async () => {
    if (!newRequest.requester_name || requestItems.length === 0) {
      toast({
        title: "Dados incompletos",
        description: "Preencha nome do solicitante e adicione pelo menos um item.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get request number from function
      const { data: requestNumber, error: fnError } = await (supabase as any)
        .rpc('generate_request_number');

      if (fnError) throw fnError;

      const requestData = {
        ...newRequest,
        request_number: requestNumber,
        items: requestItems,
        total_estimated_value: calculateTotal(),
        status: 'pending'
      };

      const { error } = await (supabase as any)
        .from('material_requests')
        .insert([requestData]);

      if (error) throw error;

      toast({
        title: "Requisição enviada",
        description: `Requisição ${requestNumber} criada com sucesso.`
      });

      // Reset form
      setNewRequest({
        requester_name: '',
        department: '',
        project_code: '',
        priority: 'normal',
        notes: ''
      });
      setRequestItems([]);

      // Reload requests
      loadRequests();

    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar requisição.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const approveRequest = async (requestId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('material_requests')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: 'Encarregado' // In a real app, this would be the logged user
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Requisição aprovada",
        description: "Material liberado para retirada."
      });

      loadRequests();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao aprovar requisição.",
        variant: "destructive"
      });
    }
  };

  const markAsDelivered = async (requestId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('material_requests')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
          delivered_by: 'Almoxarife' // In a real app, this would be the logged user
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Entrega confirmada",
        description: "Material entregue com sucesso."
      });

      loadRequests();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao confirmar entrega.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' as const, icon: Clock },
      approved: { label: 'Aprovado', variant: 'default' as const, icon: CheckCircle },
      in_progress: { label: 'Em Andamento', variant: 'secondary' as const, icon: Package },
      delivered: { label: 'Entregue', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Rejeitado', variant: 'destructive' as const, icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: 'Baixa', variant: 'secondary' as const },
      normal: { label: 'Normal', variant: 'secondary' as const },
      high: { label: 'Alta', variant: 'default' as const },
      urgent: { label: 'Urgente', variant: 'destructive' as const }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.normal;

    return (
      <Badge variant={config.variant}>
        {priority === 'urgent' && <AlertTriangle className="h-3 w-3 mr-1" />}
        {config.label}
      </Badge>
    );
  };

  return (
    <PageContainer
      title="Requisição de Materiais"
      description="Sistema automatizado de requisição para almoxarifado"
    >
      <Tabs defaultValue="new-request" className="space-y-6">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
          <TabsTrigger value="new-request">Nova Requisição</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          {!isMobile && <TabsTrigger value="history">Histórico</TabsTrigger>}
        </TabsList>

        <TabsContent value="new-request" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nova Requisição de Material
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div className="space-y-2">
                  <Label htmlFor="requester_name">Nome do Solicitante</Label>
                  <Input
                    id="requester_name"
                    value={newRequest.requester_name}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, requester_name: e.target.value }))}
                    placeholder="Nome completo"
                    className={isMobile ? "text-base" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Setor/Departamento</Label>
                  <Input
                    id="department"
                    value={newRequest.department}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Ex: Obras, Manutenção"
                    className={isMobile ? "text-base" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project_code">Código do Projeto</Label>
                  <Input
                    id="project_code"
                    value={newRequest.project_code}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, project_code: e.target.value }))}
                    placeholder="Ex: OBR-2024-001"
                    className={isMobile ? "text-base" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select onValueChange={(value) => setNewRequest(prev => ({ ...prev, priority: value as any }))}>
                    <SelectTrigger className={isMobile ? "text-base" : ""}>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={newRequest.notes}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Informações adicionais sobre a requisição"
                  rows={2}
                  className={isMobile ? "text-base" : ""}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adicionar Materiais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
                <div className="space-y-2">
                  <Label htmlFor="material_name">Material</Label>
                  <Input
                    id="material_name"
                    value={newItem.material_name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, material_name: e.target.value }))}
                    placeholder="Nome do material"
                    className={isMobile ? "text-base" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    placeholder="0"
                    className={isMobile ? "text-base" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidade</Label>
                  <Select onValueChange={(value) => setNewItem(prev => ({ ...prev, unit: value }))}>
                    <SelectTrigger className={isMobile ? "text-base" : ""}>
                      <SelectValue placeholder="Unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="un">Unidades</SelectItem>
                      <SelectItem value="kg">Quilogramas</SelectItem>
                      <SelectItem value="m">Metros</SelectItem>
                      <SelectItem value="m2">Metros²</SelectItem>
                      <SelectItem value="m3">Metros³</SelectItem>
                      <SelectItem value="saco">Sacos</SelectItem>
                      <SelectItem value="caixa">Caixas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_price">Preço Unit. (R$)</Label>
                  <Input
                    id="estimated_price"
                    type="number"
                    step="0.01"
                    value={newItem.estimated_price}
                    onChange={(e) => setNewItem(prev => ({ ...prev, estimated_price: Number(e.target.value) }))}
                    placeholder="0.00"
                    className={isMobile ? "text-base" : ""}
                  />
                </div>
              </div>

              <Button 
                onClick={addItemToRequest} 
                className={`w-full ${isMobile ? 'h-12 text-base' : ''}`}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>

              {requestItems.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Itens da Requisição</h4>
                  {requestItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.material_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit} × R$ {item.estimated_price.toFixed(2)} = R$ {(item.quantity * item.estimated_price).toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItemFromRequest(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="text-right font-medium">
                    Total Estimado: R$ {calculateTotal().toFixed(2)}
                  </div>
                </div>
              )}

              <Button 
                onClick={submitRequest} 
                disabled={isSubmitting || requestItems.length === 0}
                className={`w-full ${isMobile ? 'h-12 text-base' : ''}`}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Requisição'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Requisições Pendentes de Aprovação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.filter(req => req.status === 'pending').map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{request.request_number}</h3>
                        <p className="text-sm text-muted-foreground">
                          {request.requester_name} - {request.department}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {getPriorityBadge(request.priority)}
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <p>Projeto: {request.project_code}</p>
                      <p>Items: {request.items.length}</p>
                      <p>Valor Estimado: R$ {request.total_estimated_value.toFixed(2)}</p>
                      <p>Solicitado em: {new Date(request.requested_at).toLocaleString('pt-BR')}</p>
                    </div>

                    {request.status === 'pending' && (
                      <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
                        <Button 
                          onClick={() => approveRequest(request.id)}
                          className={`flex-1 ${isMobile ? 'h-12' : ''}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprovar e Liberar
                        </Button>
                      </div>
                    )}

                    {request.status === 'approved' && (
                      <Button 
                        onClick={() => markAsDelivered(request.id)}
                        variant="outline"
                        className={`w-full ${isMobile ? 'h-12' : ''}`}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Confirmar Entrega
                      </Button>
                    )}
                  </div>
                ))}

                {requests.filter(req => req.status === 'pending').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma requisição pendente
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {!isMobile && (
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Requisições</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{request.request_number}</h3>
                          <p className="text-sm text-muted-foreground">
                            {request.requester_name} - {request.department}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {getPriorityBadge(request.priority)}
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Projeto: {request.project_code}</p>
                        <p>Items: {request.items.length}</p>
                        <p>Valor: R$ {request.total_estimated_value.toFixed(2)}</p>
                        <p>Solicitado: {new Date(request.requested_at).toLocaleString('pt-BR')}</p>
                        {request.approved_at && (
                          <p>Aprovado: {new Date(request.approved_at).toLocaleString('pt-BR')}</p>
                        )}
                        {request.delivered_at && (
                          <p>Entregue: {new Date(request.delivered_at).toLocaleString('pt-BR')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </PageContainer>
  );
};
import React, { useState, useRef, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Shield, User, Calendar, CheckCircle, XCircle, Clock, Edit3, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthBanner } from '@/components/AuthBanner';
import { supabase } from '@/integrations/supabase/client';

interface EPI {
  id: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  serial_number: string;
  certificate_number: string;
  status: 'available' | 'assigned' | 'maintenance' | 'expired';
  location: string;
  expiry_date: string;
  created_at: string;
}

interface EPIAssignment {
  id: string;
  epi_id: string;
  employee_name: string;
  employee_document: string;
  assigned_at: string;
  returned_at?: string;
  status: 'active' | 'returned';
  signature_data: string;
  notes: string;
}

export const EPIControlModule = () => {
  const [epis, setEpis] = useState<EPI[]>([]);
  const [assignments, setAssignments] = useState<EPIAssignment[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newEPI, setNewEPI] = useState({
    name: '',
    type: '',
    brand: '',
    model: '',
    serial_number: '',
    certificate_number: '',
    location: '',
    expiry_date: ''
  });
  const [newAssignment, setNewAssignment] = useState({
    epi_id: '',
    employee_name: '',
    employee_document: '',
    notes: ''
  });
  const [isSignatureMode, setIsSignatureMode] = useState(false);
  const [signature, setSignature] = useState('');
  const [isEPIDialogOpen, setIsEPIDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser();
    loadEPIs();
    loadAssignments();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadEPIs = async () => {
    try {
      const { data, error } = await supabase
        .from('epis')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEpis(data?.map(item => ({
        ...item,
        status: item.status as 'available' | 'assigned' | 'maintenance' | 'expired'
      })) || []);
    } catch (error) {
      console.error('Error loading EPIs:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar EPIs",
        variant: "destructive",
      });
    }
  };

  const loadAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('epi_assignments')
        .select('*')
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      setAssignments(data?.map(item => ({
        ...item,
        status: item.status as 'active' | 'returned'
      })) || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const handleEPISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('epis')
        .insert([{
          ...newEPI,
          user_id: user.id,
          status: 'available'
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "EPI cadastrado com sucesso.",
      });

      setNewEPI({
        name: '',
        type: '',
        brand: '',
        model: '',
        serial_number: '',
        certificate_number: '',
        location: '',
        expiry_date: ''
      });
      
      setIsEPIDialogOpen(false);
      loadEPIs();
    } catch (error) {
      console.error('Error creating EPI:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar EPI",
        variant: "destructive",
      });
    }
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signature) {
      toast({
        title: "Assinatura necessária",
        description: "Por favor, assine o documento.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('epi_assignments')
        .insert([{
          ...newAssignment,
          user_id: user.id,
          signature_data: signature,
          status: 'active'
        }]);

      if (error) throw error;

      // Update EPI status to assigned
      await supabase
        .from('epis')
        .update({ status: 'assigned' })
        .eq('id', newAssignment.epi_id);

      toast({
        title: "Sucesso!",
        description: "EPI atribuído com sucesso.",
      });

      setNewAssignment({
        epi_id: '',
        employee_name: '',
        employee_document: '',
        notes: ''
      });
      setSignature('');
      
      setIsAssignmentDialogOpen(false);
      loadEPIs();
      loadAssignments();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Erro",
        description: "Erro ao atribuir EPI",
        variant: "destructive",
      });
    }
  };

  const handleReturnEPI = async (assignmentId: string, epiId: string) => {
    try {
      await supabase
        .from('epi_assignments')
        .update({ 
          status: 'returned', 
          returned_at: new Date().toISOString() 
        })
        .eq('id', assignmentId);

      await supabase
        .from('epis')
        .update({ status: 'available' })
        .eq('id', epiId);

      toast({
        title: "Sucesso!",
        description: "EPI devolvido com sucesso.",
      });

      loadEPIs();
      loadAssignments();
    } catch (error) {
      console.error('Error returning EPI:', error);
      toast({
        title: "Erro",
        description: "Erro ao devolver EPI",
        variant: "destructive",
      });
    }
  };

  const startSignature = () => {
    setIsSignatureMode(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const signatureData = canvas.toDataURL();
      setSignature(signatureData);
      toast({
        title: "Assinatura capturada",
        description: "Assinatura digital salva com sucesso."
      });
      setIsSignatureMode(false);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignature('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Disponível';
      case 'assigned': return 'Atribuído';
      case 'maintenance': return 'Manutenção';
      case 'expired': return 'Vencido';
      default: return status;
    }
  };

  const availableEPIs = epis.filter(epi => epi.status === 'available');
  const assignedEPIs = epis.filter(epi => epi.status === 'assigned');
  const maintenanceEPIs = epis.filter(epi => epi.status === 'maintenance');
  const expiredEPIs = epis.filter(epi => epi.status === 'expired');

  return (
    <PageContainer>
      <AuthBanner user={currentUser} onAuthChange={getCurrentUser} />
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle de EPIs</h1>
          <p className="text-gray-600 mt-1">Gestão de equipamentos de proteção individual</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isEPIDialogOpen} onOpenChange={setIsEPIDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo EPI
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo EPI</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleEPISubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome do EPI *</Label>
                    <Input
                      id="name"
                      value={newEPI.name}
                      onChange={(e) => setNewEPI({ ...newEPI, name: e.target.value })}
                      required
                      placeholder="Ex: Capacete de Segurança"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Input
                      id="type"
                      value={newEPI.type}
                      onChange={(e) => setNewEPI({ ...newEPI, type: e.target.value })}
                      placeholder="Ex: Proteção para cabeça"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="brand">Marca</Label>
                    <Input
                      id="brand"
                      value={newEPI.brand}
                      onChange={(e) => setNewEPI({ ...newEPI, brand: e.target.value })}
                      placeholder="Ex: 3M"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="model">Modelo</Label>
                    <Input
                      id="model"
                      value={newEPI.model}
                      onChange={(e) => setNewEPI({ ...newEPI, model: e.target.value })}
                      placeholder="Ex: H-700"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="serial_number">Número de Série</Label>
                    <Input
                      id="serial_number"
                      value={newEPI.serial_number}
                      onChange={(e) => setNewEPI({ ...newEPI, serial_number: e.target.value })}
                      placeholder="Número de série"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="certificate_number">Número do Certificado</Label>
                    <Input
                      id="certificate_number"
                      value={newEPI.certificate_number}
                      onChange={(e) => setNewEPI({ ...newEPI, certificate_number: e.target.value })}
                      placeholder="CA do produto"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      value={newEPI.location}
                      onChange={(e) => setNewEPI({ ...newEPI, location: e.target.value })}
                      placeholder="Ex: Armário A-01"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="expiry_date">Data de Validade</Label>
                    <Input
                      id="expiry_date"
                      type="date"
                      value={newEPI.expiry_date}
                      onChange={(e) => setNewEPI({ ...newEPI, expiry_date: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEPIDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Cadastrar EPI
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <User className="h-4 w-4 mr-2" />
                Atribuir EPI
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Atribuir EPI a Funcionário</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="epi_select">Selecionar EPI</Label>
                  <Select value={newAssignment.epi_id} onValueChange={(value) => setNewAssignment({ ...newAssignment, epi_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um EPI disponível" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEPIs.map((epi) => (
                        <SelectItem key={epi.id} value={epi.id}>
                          {epi.name} - {epi.brand} {epi.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employee_name">Nome do Funcionário *</Label>
                    <Input
                      id="employee_name"
                      value={newAssignment.employee_name}
                      onChange={(e) => setNewAssignment({ ...newAssignment, employee_name: e.target.value })}
                      required
                      placeholder="Nome completo"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="employee_document">CPF/Matrícula</Label>
                    <Input
                      id="employee_document"
                      value={newAssignment.employee_document}
                      onChange={(e) => setNewAssignment({ ...newAssignment, employee_document: e.target.value })}
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="assignment_notes">Observações</Label>
                  <Textarea
                    id="assignment_notes"
                    value={newAssignment.notes}
                    onChange={(e) => setNewAssignment({ ...newAssignment, notes: e.target.value })}
                    placeholder="Observações sobre a atribuição"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label>Assinatura Digital *</Label>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={200}
                      className="border border-gray-300 bg-white rounded cursor-crosshair w-full"
                      onMouseDown={(e) => {
                        if (!isSignatureMode) return;
                        const canvas = canvasRef.current;
                        const rect = canvas?.getBoundingClientRect();
                        if (canvas && rect) {
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            ctx.beginPath();
                            ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                          }
                        }
                      }}
                      onMouseMove={(e) => {
                        if (!isSignatureMode || e.buttons !== 1) return;
                        const canvas = canvasRef.current;
                        const rect = canvas?.getBoundingClientRect();
                        if (canvas && rect) {
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                            ctx.stroke();
                          }
                        }
                      }}
                    />
                    <div className="flex gap-2 mt-2">
                      <Button type="button" onClick={startSignature} variant="outline" size="sm">
                        Iniciar Assinatura
                      </Button>
                      <Button type="button" onClick={saveSignature} variant="outline" size="sm">
                        Salvar Assinatura
                      </Button>
                      <Button type="button" onClick={clearSignature} variant="outline" size="sm">
                        Limpar
                      </Button>
                    </div>
                    {signature && (
                      <div className="mt-2">
                        <Badge variant="default">Assinatura capturada</Badge>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Atribuir EPI
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Disponíveis</p>
                <p className="text-2xl font-bold text-green-600">{availableEPIs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Atribuídos</p>
                <p className="text-2xl font-bold text-blue-600">{assignedEPIs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Manutenção</p>
                <p className="text-2xl font-bold text-yellow-600">{maintenanceEPIs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">{expiredEPIs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="epis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="epis">EPIs Cadastrados</TabsTrigger>
          <TabsTrigger value="assignments">Atribuições</TabsTrigger>
        </TabsList>

        <TabsContent value="epis">
          <Card>
            <CardHeader>
              <CardTitle>EPIs Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {epis.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum EPI cadastrado</p>
                  </div>
                ) : (
                  epis.map((epi) => (
                    <div key={epi.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{epi.name}</h3>
                            <Badge className={getStatusColor(epi.status)}>
                              {getStatusLabel(epi.status)}
                            </Badge>
                            {epi.expiry_date && new Date(epi.expiry_date) < new Date() && (
                              <Badge variant="destructive">Vencido</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Marca/Modelo:</span>
                              <p>{epi.brand} {epi.model}</p>
                            </div>
                            <div>
                              <span className="font-medium">Certificado:</span>
                              <p>{epi.certificate_number || 'Não informado'}</p>
                            </div>
                            <div>
                              <span className="font-medium">Localização:</span>
                              <p>{epi.location || 'Não definida'}</p>
                            </div>
                            <div>
                              <span className="font-medium">Validade:</span>
                              <p>{epi.expiry_date ? new Date(epi.expiry_date).toLocaleDateString('pt-BR') : 'Não definida'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Atribuições de EPIs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma atribuição registrada</p>
                  </div>
                ) : (
                  assignments.map((assignment) => {
                    const epi = epis.find(e => e.id === assignment.epi_id);
                    return (
                      <div key={assignment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{assignment.employee_name}</h3>
                              <Badge className={assignment.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                                {assignment.status === 'active' ? 'Ativo' : 'Devolvido'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">EPI:</span>
                                <p>{epi?.name || 'EPI não encontrado'}</p>
                              </div>
                              <div>
                                <span className="font-medium">Documento:</span>
                                <p>{assignment.employee_document || 'Não informado'}</p>
                              </div>
                              <div>
                                <span className="font-medium">Atribuído em:</span>
                                <p>{new Date(assignment.assigned_at).toLocaleDateString('pt-BR')}</p>
                              </div>
                              <div>
                                <span className="font-medium">Status:</span>
                                <p>{assignment.returned_at ? `Devolvido em ${new Date(assignment.returned_at).toLocaleDateString('pt-BR')}` : 'Em uso'}</p>
                              </div>
                            </div>
                          </div>
                          {assignment.status === 'active' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleReturnEPI(assignment.id, assignment.epi_id)}
                            >
                              Devolver EPI
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};
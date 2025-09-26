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
import { Plus, Shield, FileText, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadEPIs();
    loadAssignments();
  }, []);

  const loadEPIs = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('epis')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEpis(data || []);
    } catch (error) {
      console.error('Error loading EPIs:', error);
    }
  };

  const loadAssignments = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('epi_assignments')
        .select('*')
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const handleEPIInputChange = (field: string, value: any) => {
    setNewEPI(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAssignmentInputChange = (field: string, value: any) => {
    setNewAssignment(prev => ({
      ...prev,
      [field]: value
    }));
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
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
  };

  const addEPI = async () => {
    try {
      const { error } = await (supabase as any)
        .from('epis')
        .insert([{
          ...newEPI,
          status: 'available'
        }]);

      if (error) throw error;

      toast({
        title: "EPI cadastrado",
        description: "EPI adicionado com sucesso ao sistema."
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

      loadEPIs();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar EPI.",
        variant: "destructive"
      });
    }
  };

  const assignEPI = async () => {
    try {
      const canvas = canvasRef.current;
      const signature = canvas?.toDataURL() || '';

      if (!signature || signature === 'data:,') {
        toast({
          title: "Assinatura obrigatória",
          description: "É necessário capturar a assinatura do funcionário.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await (supabase as any)
        .from('epi_assignments')
        .insert([{
          ...newAssignment,
          signature_data: signature,
          status: 'active'
        }]);

      if (error) throw error;

      // Update EPI status to assigned
      await (supabase as any)
        .from('epis')
        .update({ status: 'assigned' })
        .eq('id', newAssignment.epi_id);

      toast({
        title: "EPI entregue",
        description: "EPI entregue com sucesso ao funcionário."
      });

      setNewAssignment({
        epi_id: '',
        employee_name: '',
        employee_document: '',
        notes: ''
      });
      clearSignature();
      setIsSignatureMode(false);

      loadEPIs();
      loadAssignments();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao entregar EPI.",
        variant: "destructive"
      });
    }
  };

  const returnEPI = async (assignmentId: string, epiId: string) => {
    try {
      await (supabase as any)
        .from('epi_assignments')
        .update({ 
          status: 'returned',
          returned_at: new Date().toISOString()
        })
        .eq('id', assignmentId);

      await (supabase as any)
        .from('epis')
        .update({ status: 'available' })
        .eq('id', epiId);

      toast({
        title: "EPI devolvido",
        description: "EPI devolvido com sucesso."
      });

      loadEPIs();
      loadAssignments();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao devolver EPI.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      available: "default",
      assigned: "secondary",
      maintenance: "destructive",
      expired: "destructive"
    };
    
    const labels = {
      available: "Disponível",
      assigned: "Em Uso",
      maintenance: "Manutenção",
      expired: "Vencido"
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <PageContainer
      title="Controle de EPIs"
      description="Sistema de controle de EPIs com assinaturas digitais"
    >
      <Tabs defaultValue="assignments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assignments">Entregas</TabsTrigger>
          <TabsTrigger value="epis">Cadastro EPIs</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Entrega de EPI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="epi_select">Selecionar EPI</Label>
                  <Select onValueChange={(value) => handleAssignmentInputChange('epi_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um EPI disponível" />
                    </SelectTrigger>
                    <SelectContent>
                      {epis.filter(epi => epi.status === 'available').map((epi) => (
                        <SelectItem key={epi.id} value={epi.id}>
                          {epi.name} - {epi.type} ({epi.serial_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee_name">Nome do Funcionário</Label>
                  <Input
                    id="employee_name"
                    value={newAssignment.employee_name}
                    onChange={(e) => handleAssignmentInputChange('employee_name', e.target.value)}
                    placeholder="Nome completo do funcionário"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee_document">CPF/Documento</Label>
                  <Input
                    id="employee_document"
                    value={newAssignment.employee_document}
                    onChange={(e) => handleAssignmentInputChange('employee_document', e.target.value)}
                    placeholder="CPF ou número do documento"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignment_notes">Observações</Label>
                <Textarea
                  id="assignment_notes"
                  value={newAssignment.notes}
                  onChange={(e) => handleAssignmentInputChange('notes', e.target.value)}
                  placeholder="Observações sobre a entrega"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <Label>Assinatura do Funcionário</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {!isSignatureMode ? (
                    <div className="text-center">
                      <Button onClick={startSignature} variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Capturar Assinatura
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Solicite ao funcionário que assine no campo abaixo:
                      </p>
                      <canvas
                        ref={canvasRef}
                        width={400}
                        height={200}
                        className="border border-gray-300 rounded w-full cursor-crosshair bg-white"
                        onMouseDown={(e) => {
                          const canvas = canvasRef.current;
                          if (canvas) {
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              const rect = canvas.getBoundingClientRect();
                              ctx.beginPath();
                              ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                            }
                          }
                        }}
                        onMouseMove={(e) => {
                          const canvas = canvasRef.current;
                          if (canvas && e.buttons === 1) {
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              const rect = canvas.getBoundingClientRect();
                              ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                              ctx.stroke();
                            }
                          }
                        }}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          const canvas = canvasRef.current;
                          if (canvas) {
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              const rect = canvas.getBoundingClientRect();
                              const touch = e.touches[0];
                              ctx.beginPath();
                              ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
                            }
                          }
                        }}
                        onTouchMove={(e) => {
                          e.preventDefault();
                          const canvas = canvasRef.current;
                          if (canvas) {
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              const rect = canvas.getBoundingClientRect();
                              const touch = e.touches[0];
                              ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
                              ctx.stroke();
                            }
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <Button onClick={clearSignature} variant="outline" size="sm">
                          Limpar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={assignEPI} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Entregar EPI
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="epis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Cadastrar Novo EPI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="epi_name">Nome do EPI</Label>
                  <Input
                    id="epi_name"
                    value={newEPI.name}
                    onChange={(e) => handleEPIInputChange('name', e.target.value)}
                    placeholder="Ex: Capacete de Segurança"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="epi_type">Tipo</Label>
                  <Select onValueChange={(value) => handleEPIInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="capacete">Capacete</SelectItem>
                      <SelectItem value="oculos">Óculos de Proteção</SelectItem>
                      <SelectItem value="luvas">Luvas</SelectItem>
                      <SelectItem value="bota">Bota de Segurança</SelectItem>
                      <SelectItem value="colete">Colete Refletivo</SelectItem>
                      <SelectItem value="respirador">Respirador</SelectItem>
                      <SelectItem value="protetor_auricular">Protetor Auricular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="epi_brand">Marca</Label>
                  <Input
                    id="epi_brand"
                    value={newEPI.brand}
                    onChange={(e) => handleEPIInputChange('brand', e.target.value)}
                    placeholder="Marca do EPI"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="epi_model">Modelo</Label>
                  <Input
                    id="epi_model"
                    value={newEPI.model}
                    onChange={(e) => handleEPIInputChange('model', e.target.value)}
                    placeholder="Modelo do EPI"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serial_number">Número de Série</Label>
                  <Input
                    id="serial_number"
                    value={newEPI.serial_number}
                    onChange={(e) => handleEPIInputChange('serial_number', e.target.value)}
                    placeholder="Número de série único"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certificate_number">Certificado CA</Label>
                  <Input
                    id="certificate_number"
                    value={newEPI.certificate_number}
                    onChange={(e) => handleEPIInputChange('certificate_number', e.target.value)}
                    placeholder="Número do Certificado de Aprovação"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={newEPI.location}
                    onChange={(e) => handleEPIInputChange('location', e.target.value)}
                    placeholder="Local de armazenamento"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Data de Validade</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={newEPI.expiry_date}
                    onChange={(e) => handleEPIInputChange('expiry_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={addEPI} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar EPI
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>EPIs Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {epis.map((epi) => (
                  <div key={epi.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{epi.name}</h3>
                      {getStatusBadge(epi.status)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Tipo: {epi.type}</p>
                      <p>Marca/Modelo: {epi.brand} {epi.model}</p>
                      <p>Série: {epi.serial_number}</p>
                      <p>CA: {epi.certificate_number}</p>
                      <p>Local: {epi.location}</p>
                      {epi.expiry_date && (
                        <p>Validade: {new Date(epi.expiry_date).toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Entregas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments.map((assignment) => {
                  const epi = epis.find(e => e.id === assignment.epi_id);
                  return (
                    <div key={assignment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{assignment.employee_name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'}>
                            {assignment.status === 'active' ? 'Em Uso' : 'Devolvido'}
                          </Badge>
                          {assignment.status === 'active' && epi && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => returnEPI(assignment.id, assignment.epi_id)}
                            >
                              Devolver
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>EPI: {epi?.name} - {epi?.type}</p>
                        <p>Documento: {assignment.employee_document}</p>
                        <p>Entregue em: {new Date(assignment.assigned_at).toLocaleString('pt-BR')}</p>
                        {assignment.returned_at && (
                          <p>Devolvido em: {new Date(assignment.returned_at).toLocaleString('pt-BR')}</p>
                        )}
                        {assignment.notes && <p>Obs: {assignment.notes}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};
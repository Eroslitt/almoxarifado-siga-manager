import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText, CheckCircle, XCircle, Clock, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MaterialVerification {
  id: string;
  material_name: string;
  supplier?: string;
  batch_number?: string;
  quantity?: number;
  unit?: string;
  delivery_date?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  quality_check?: any;
  inspector_name?: string;
  notes?: string;
  created_at: string;
}

const MaterialVerification = () => {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<MaterialVerification[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    material_name: '',
    supplier: '',
    batch_number: '',
    quantity: '',
    unit: '',
    delivery_date: '',
    inspector_name: '',
    notes: '',
    quality_check: {
      appearance: '',
      dimensions: '',
      certificates: '',
      packaging: ''
    }
  });

  const statusConfig = {
    pending: { label: 'Pendente', color: 'bg-yellow-500', icon: Clock },
    approved: { label: 'Aprovado', color: 'bg-green-500', icon: CheckCircle },
    rejected: { label: 'Rejeitado', color: 'bg-red-500', icon: XCircle }
  };

  const units = ['kg', 'g', 'ton', 'm', 'cm', 'mm', 'm²', 'm³', 'L', 'mL', 'unid', 'pç', 'cx', 'sc'];

  useEffect(() => {
    if (user) {
      fetchVerifications();
    }
  }, [user]);

  const fetchVerifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('material_verifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVerifications((data || []) as MaterialVerification[]);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar verificações: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('material_verifications')
        .insert({
          ...formData,
          user_id: user.id,
          quantity: formData.quantity ? parseInt(formData.quantity) : null,
          delivery_date: formData.delivery_date || null,
          verification_status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Verificação cadastrada com sucesso!",
      });

      setFormData({
        material_name: '',
        supplier: '',
        batch_number: '',
        quantity: '',
        unit: '',
        delivery_date: '',
        inspector_name: '',
        notes: '',
        quality_check: {
          appearance: '',
          dimensions: '',
          certificates: '',
          packaging: ''
        }
      });
      setIsDialogOpen(false);
      fetchVerifications();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar verificação: " + error.message,
        variant: "destructive",
      });
    }
  };

  const updateVerificationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('material_verifications')
        .update({ verification_status: status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Status atualizado para ${statusConfig[status as keyof typeof statusConfig].label}`,
      });

      fetchVerifications();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status: " + error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge variant="secondary" className={`${config.color} text-white`}>
        <Icon className="h-4 w-4 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Verificação de Materiais</h1>
          <p className="text-muted-foreground">
            Controle de qualidade na chegada de materiais à obra
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Verificação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Verificação de Material</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material_name">Nome do Material *</Label>
                  <Input
                    id="material_name"
                    value={formData.material_name}
                    onChange={(e) => setFormData({ ...formData, material_name: e.target.value })}
                    placeholder="Ex: Cimento Portland"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Fornecedor</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Nome do fornecedor"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batch_number">Lote</Label>
                  <Input
                    id="batch_number"
                    value={formData.batch_number}
                    onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                    placeholder="Número do lote"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidade</Label>
                  <Select 
                    value={formData.unit} 
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery_date">Data de Entrega</Label>
                  <Input
                    id="delivery_date"
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inspector_name">Nome do Inspetor</Label>
                  <Input
                    id="inspector_name"
                    value={formData.inspector_name}
                    onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                    placeholder="Nome do responsável pela inspeção"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold">Checklist de Qualidade</Label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appearance">Aparência</Label>
                    <Select 
                      value={formData.quality_check.appearance} 
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        quality_check: { ...formData.quality_check, appearance: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Avalie a aparência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conforme">Conforme</SelectItem>
                        <SelectItem value="nao_conforme">Não Conforme</SelectItem>
                        <SelectItem value="nao_aplicavel">Não Aplicável</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dimensions">Dimensões</Label>
                    <Select 
                      value={formData.quality_check.dimensions} 
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        quality_check: { ...formData.quality_check, dimensions: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Avalie as dimensões" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conforme">Conforme</SelectItem>
                        <SelectItem value="nao_conforme">Não Conforme</SelectItem>
                        <SelectItem value="nao_aplicavel">Não Aplicável</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certificates">Certificados</Label>
                    <Select 
                      value={formData.quality_check.certificates} 
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        quality_check: { ...formData.quality_check, certificates: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Verifique os certificados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conforme">Conforme</SelectItem>
                        <SelectItem value="nao_conforme">Não Conforme</SelectItem>
                        <SelectItem value="nao_aplicavel">Não Aplicável</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="packaging">Embalagem</Label>
                    <Select 
                      value={formData.quality_check.packaging} 
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        quality_check: { ...formData.quality_check, packaging: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Avalie a embalagem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conforme">Conforme</SelectItem>
                        <SelectItem value="nao_conforme">Não Conforme</SelectItem>
                        <SelectItem value="nao_aplicavel">Não Aplicável</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações sobre a verificação..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Cadastrar Verificação</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifications.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {verifications.filter(v => v.verification_status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {verifications.filter(v => v.verification_status === 'approved').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejeitados</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {verifications.filter(v => v.verification_status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Verificações de Materiais</CardTitle>
          <CardDescription>
            Histórico de verificações realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Data Entrega</TableHead>
                <TableHead>Inspetor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verifications.map((verification) => (
                <TableRow key={verification.id}>
                  <TableCell className="font-medium">{verification.material_name}</TableCell>
                  <TableCell>{verification.supplier || '-'}</TableCell>
                  <TableCell>
                    {verification.quantity && verification.unit 
                      ? `${verification.quantity} ${verification.unit}` 
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    {verification.delivery_date 
                      ? new Date(verification.delivery_date).toLocaleDateString('pt-BR')
                      : '-'
                    }
                  </TableCell>
                  <TableCell>{verification.inspector_name || '-'}</TableCell>
                  <TableCell>{getStatusBadge(verification.verification_status)}</TableCell>
                  <TableCell>
                    {verification.verification_status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => updateVerificationStatus(verification.id, 'approved')}
                        >
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => updateVerificationStatus(verification.id, 'rejected')}
                        >
                          Rejeitar
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {verifications.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma verificação cadastrada ainda. Clique em "Nova Verificação" para começar.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialVerification;
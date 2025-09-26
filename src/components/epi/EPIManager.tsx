import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Shield, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EPI {
  id: string;
  name: string;
  type: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  certificate_number?: string;
  expiry_date?: string;
  status: 'available' | 'in_use' | 'maintenance' | 'expired';
  location?: string;
  created_at: string;
}

const EPIManager = () => {
  const { user } = useAuth();
  const [epis, setEpis] = useState<EPI[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    brand: '',
    model: '',
    serial_number: '',
    certificate_number: '',
    expiry_date: '',
    location: ''
  });

  const epiTypes = [
    'Capacete de Segurança',
    'Óculos de Proteção',
    'Luvas de Segurança',
    'Calçado de Segurança',
    'Protetor Auricular',
    'Máscara Respiratória',
    'Cinto de Segurança',
    'Vestimenta de Proteção',
    'Outro'
  ];

  const statusConfig = {
    available: { label: 'Disponível', color: 'bg-green-500', icon: CheckCircle },
    in_use: { label: 'Em Uso', color: 'bg-blue-500', icon: Shield },
    maintenance: { label: 'Manutenção', color: 'bg-yellow-500', icon: Wrench },
    expired: { label: 'Vencido', color: 'bg-red-500', icon: AlertTriangle }
  };

  useEffect(() => {
    if (user) {
      fetchEPIs();
    }
  }, [user]);

  const fetchEPIs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('epis')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEpis((data || []) as EPI[]);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar EPIs: " + error.message,
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
        .from('epis')
        .insert({
          ...formData,
          user_id: user.id,
          expiry_date: formData.expiry_date || null
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "EPI cadastrado com sucesso!",
      });

      setFormData({
        name: '',
        type: '',
        brand: '',
        model: '',
        serial_number: '',
        certificate_number: '',
        expiry_date: '',
        location: ''
      });
      setIsDialogOpen(false);
      fetchEPIs();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar EPI: " + error.message,
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

  const isExpiringSoon = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiry <= thirtyDaysFromNow && expiry > today;
  };

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Controle de EPIs</h1>
          <p className="text-muted-foreground">
            Gerencie equipamentos de proteção individual da sua empresa
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar EPI
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo EPI</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do EPI *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {epiTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serial_number">Número de Série</Label>
                  <Input
                    id="serial_number"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certificate_number">Número do CA</Label>
                  <Input
                    id="certificate_number"
                    value={formData.certificate_number}
                    onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Data de Vencimento</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ex: Almoxarifado A"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Cadastrar EPI</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de EPIs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{epis.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {epis.filter(epi => epi.status === 'available').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Uso</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {epis.filter(epi => epi.status === 'in_use').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {epis.filter(epi => epi.status === 'expired').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* EPIs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de EPIs</CardTitle>
          <CardDescription>
            Todos os equipamentos de proteção cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Marca/Modelo</TableHead>
                <TableHead>CA</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Localização</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {epis.map((epi) => (
                <TableRow key={epi.id}>
                  <TableCell className="font-medium">{epi.name}</TableCell>
                  <TableCell>{epi.type}</TableCell>
                  <TableCell>
                    {epi.brand && epi.model ? `${epi.brand} - ${epi.model}` : epi.brand || epi.model || '-'}
                  </TableCell>
                  <TableCell>{epi.certificate_number || '-'}</TableCell>
                  <TableCell>
                    {epi.expiry_date ? (
                      <div className="flex items-center space-x-2">
                        <span>{new Date(epi.expiry_date).toLocaleDateString('pt-BR')}</span>
                        {isExpiringSoon(epi.expiry_date) && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(epi.status)}</TableCell>
                  <TableCell>{epi.location || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {epis.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum EPI cadastrado ainda. Clique em "Adicionar EPI" para começar.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EPIManager;
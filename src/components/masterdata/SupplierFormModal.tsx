
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { masterDataApi } from '@/services/masterDataApi';
import { validationService } from '@/services/validationService';

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supplier?: any;
}

export const SupplierFormModal = ({ isOpen, onClose, onSuccess, supplier }: SupplierFormModalProps) => {
  const [formData, setFormData] = useState({
    company_name: supplier?.company_name || '',
    trade_name: supplier?.trade_name || '',
    cnpj: supplier?.cnpj || '',
    email: supplier?.contact_info?.email || '',
    phone: supplier?.contact_info?.phone || '',
    contact_person: supplier?.contact_info?.contact_person || '',
    address: supplier?.address || '',
    lead_time_days: supplier?.lead_time_days || '7',
    status: supplier?.status || 'active'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const validation = validationService.validateSupplier({
        ...formData,
        lead_time_days: parseInt(formData.lead_time_days)
      });

      if (!validation.isValid) {
        setErrors(validation.errors);
        setLoading(false);
        return;
      }

      const supplierData = {
        company_name: formData.company_name,
        trade_name: formData.trade_name,
        cnpj: formData.cnpj,
        contact_info: {
          email: formData.email,
          phone: formData.phone,
          contact_person: formData.contact_person
        },
        address: formData.address,
        lead_time_days: parseInt(formData.lead_time_days),
        status: formData.status
      };

      if (supplier) {
        await masterDataApi.updateSupplier(supplier.id, supplierData);
        toast({
          title: "Sucesso",
          description: "Fornecedor atualizado com sucesso",
        });
      } else {
        await masterDataApi.createSupplier(supplierData);
        toast({
          title: "Sucesso",
          description: "Fornecedor criado com sucesso",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      toast({
        title: "Erro",
        description: (error as Error).message || "Erro ao salvar fornecedor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <ul className="text-red-600 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">Razão Social*</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                placeholder="Ex: Empresa Exemplo Ltda"
                required
              />
            </div>

            <div>
              <Label htmlFor="trade_name">Nome Fantasia</Label>
              <Input
                id="trade_name"
                value={formData.trade_name}
                onChange={(e) => setFormData({...formData, trade_name: e.target.value})}
                placeholder="Ex: Exemplo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cnpj">CNPJ*</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                placeholder="00.000.000/0000-00"
                required
              />
            </div>

            <div>
              <Label htmlFor="lead_time_days">Lead Time (dias)</Label>
              <Input
                id="lead_time_days"
                type="number"
                value={formData.lead_time_days}
                onChange={(e) => setFormData({...formData, lead_time_days: e.target.value})}
                placeholder="7"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="contato@exemplo.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="(11) 1234-5678"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="contact_person">Pessoa de Contato</Label>
            <Input
              id="contact_person"
              value={formData.contact_person}
              onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
              placeholder="Nome do responsável"
            />
          </div>

          <div>
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Endereço completo"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="blocked">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : (supplier ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

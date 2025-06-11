
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
    ie: supplier?.ie || '',
    email: supplier?.contact_info?.email || '',
    phone: supplier?.contact_info?.phone || '',
    contact_person: supplier?.contact_info?.contact_person || '',
    street: supplier?.address?.street || '',
    number: supplier?.address?.number || '',
    complement: supplier?.address?.complement || '',
    district: supplier?.address?.district || '',
    city: supplier?.address?.city || '',
    state: supplier?.address?.state || '',
    zip_code: supplier?.address?.zip_code || '',
    payment_terms: supplier?.payment_terms || '',
    lead_time_days: supplier?.lead_time_days || '7',
    rating: supplier?.rating || '5',
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
        lead_time_days: parseInt(formData.lead_time_days),
        rating: parseInt(formData.rating)
      });

      if (!validation.isValid) {
        setErrors(validation.errors);
        setLoading(false);
        return;
      }

      const supplierData = {
        company_name: formData.company_name,
        trade_name: formData.trade_name || null,
        cnpj: formData.cnpj,
        ie: formData.ie || null,
        address: {
          street: formData.street,
          number: formData.number,
          complement: formData.complement || undefined,
          district: formData.district,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code
        },
        contact_info: {
          phone: formData.phone,
          email: formData.email,
          contact_person: formData.contact_person || undefined
        },
        payment_terms: formData.payment_terms || null,
        lead_time_days: parseInt(formData.lead_time_days),
        rating: parseInt(formData.rating),
        status: formData.status as 'active' | 'inactive' | 'blocked'
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <ul className="text-red-600 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informações da Empresa</h3>
            
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
                <Label htmlFor="ie">Inscrição Estadual</Label>
                <Input
                  id="ie"
                  value={formData.ie}
                  onChange={(e) => setFormData({...formData, ie: e.target.value})}
                  placeholder="000.000.000.000"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Endereço</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="street">Logradouro*</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => setFormData({...formData, street: e.target.value})}
                  placeholder="Rua, Avenida, etc."
                  required
                />
              </div>

              <div>
                <Label htmlFor="number">Número*</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => setFormData({...formData, number: e.target.value})}
                  placeholder="123"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={formData.complement}
                  onChange={(e) => setFormData({...formData, complement: e.target.value})}
                  placeholder="Sala, Andar, etc."
                />
              </div>

              <div>
                <Label htmlFor="district">Bairro*</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                  placeholder="Nome do bairro"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">Cidade*</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="Nome da cidade"
                  required
                />
              </div>

              <div>
                <Label htmlFor="state">Estado*</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  placeholder="SP"
                  maxLength={2}
                  required
                />
              </div>

              <div>
                <Label htmlFor="zip_code">CEP*</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                  placeholder="00000-000"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contato</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email*</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="contato@exemplo.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone*</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="(11) 1234-5678"
                  required
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
          </div>

          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informações Comerciais</h3>
            
            <div>
              <Label htmlFor="payment_terms">Condições de Pagamento</Label>
              <Textarea
                id="payment_terms"
                value={formData.payment_terms}
                onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                placeholder="Ex: 30/60/90 dias"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="lead_time_days">Lead Time (dias)*</Label>
                <Input
                  id="lead_time_days"
                  type="number"
                  value={formData.lead_time_days}
                  onChange={(e) => setFormData({...formData, lead_time_days: e.target.value})}
                  placeholder="7"
                  required
                />
              </div>

              <div>
                <Label htmlFor="rating">Avaliação (1-5)*</Label>
                <Select value={formData.rating} onValueChange={(value) => setFormData({...formData, rating: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Ruim</SelectItem>
                    <SelectItem value="2">2 - Regular</SelectItem>
                    <SelectItem value="3">3 - Bom</SelectItem>
                    <SelectItem value="4">4 - Muito Bom</SelectItem>
                    <SelectItem value="5">5 - Excelente</SelectItem>
                  </SelectContent>
                </Select>
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
            </div>
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

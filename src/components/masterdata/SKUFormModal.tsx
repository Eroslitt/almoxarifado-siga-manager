
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

interface SKUFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sku?: any;
}

export const SKUFormModal = ({ isOpen, onClose, onSuccess, sku }: SKUFormModalProps) => {
  const [formData, setFormData] = useState({
    sku_code: sku?.sku_code || '',
    description: sku?.description || '',
    technical_specs: sku?.technical_specs || '',
    category_id: sku?.category_id || '',
    subcategory_id: sku?.subcategory_id || '',
    unit_of_measure: sku?.unit_of_measure || 'piece',
    weight: sku?.weight || '',
    abc_classification: sku?.abc_classification || 'C',
    xyz_classification: sku?.xyz_classification || 'Z',
    min_stock: sku?.min_stock || '',
    max_stock: sku?.max_stock || '',
    reorder_point: sku?.reorder_point || '',
    default_supplier_id: sku?.default_supplier_id || '',
    status: sku?.status || 'active'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const validation = validationService.validateSKU({
        ...formData,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        min_stock: parseInt(formData.min_stock),
        max_stock: parseInt(formData.max_stock),
        reorder_point: parseInt(formData.reorder_point)
      });

      if (!validation.isValid) {
        setErrors(validation.errors);
        setLoading(false);
        return;
      }

      const skuData = {
        sku_code: formData.sku_code,
        description: formData.description,
        technical_specs: formData.technical_specs || null,
        unit_of_measure: formData.unit_of_measure as 'piece' | 'kg' | 'liter' | 'box' | 'meter' | 'pack',
        dimensions: null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        abc_classification: formData.abc_classification as 'A' | 'B' | 'C',
        xyz_classification: formData.xyz_classification as 'X' | 'Y' | 'Z',
        min_stock: parseInt(formData.min_stock),
        max_stock: parseInt(formData.max_stock),
        reorder_point: parseInt(formData.reorder_point),
        default_supplier_id: formData.default_supplier_id || null,
        alternative_suppliers: null,
        photo_url: null,
        category_id: formData.category_id || null,
        subcategory_id: formData.subcategory_id || null,
        status: formData.status as 'active' | 'inactive' | 'discontinued'
      };

      if (sku) {
        await masterDataApi.updateSKU(sku.id, skuData);
        toast({
          title: "Sucesso",
          description: "SKU atualizado com sucesso",
        });
      } else {
        await masterDataApi.createSKU(skuData);
        toast({
          title: "Sucesso",
          description: "SKU criado com sucesso",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar SKU:', error);
      toast({
        title: "Erro",
        description: (error as Error).message || "Erro ao salvar SKU",
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
          <DialogTitle>{sku ? 'Editar SKU' : 'Novo SKU'}</DialogTitle>
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
              <Label htmlFor="sku_code">Código SKU*</Label>
              <Input
                id="sku_code"
                value={formData.sku_code}
                onChange={(e) => setFormData({...formData, sku_code: e.target.value})}
                placeholder="Ex: PAR-M6-20"
                required
              />
            </div>

            <div>
              <Label htmlFor="unit_of_measure">Unidade de Medida</Label>
              <Select value={formData.unit_of_measure} onValueChange={(value) => setFormData({...formData, unit_of_measure: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="piece">Peça</SelectItem>
                  <SelectItem value="pack">Pacote</SelectItem>
                  <SelectItem value="meter">Metro</SelectItem>
                  <SelectItem value="liter">Litro</SelectItem>
                  <SelectItem value="kg">Quilograma</SelectItem>
                  <SelectItem value="box">Caixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição*</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descrição detalhada do item"
              required
            />
          </div>

          <div>
            <Label htmlFor="technical_specs">Especificações Técnicas</Label>
            <Textarea
              id="technical_specs"
              value={formData.technical_specs}
              onChange={(e) => setFormData({...formData, technical_specs: e.target.value})}
              placeholder="Especificações técnicas detalhadas"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.001"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                placeholder="0.000"
              />
            </div>

            <div>
              <Label htmlFor="min_stock">Estoque Mínimo*</Label>
              <Input
                id="min_stock"
                type="number"
                value={formData.min_stock}
                onChange={(e) => setFormData({...formData, min_stock: e.target.value})}
                placeholder="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="max_stock">Estoque Máximo*</Label>
              <Input
                id="max_stock"
                type="number"
                value={formData.max_stock}
                onChange={(e) => setFormData({...formData, max_stock: e.target.value})}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reorder_point">Ponto de Reposição*</Label>
              <Input
                id="reorder_point"
                type="number"
                value={formData.reorder_point}
                onChange={(e) => setFormData({...formData, reorder_point: e.target.value})}
                placeholder="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="default_supplier_id">Fornecedor Padrão</Label>
              <Input
                id="default_supplier_id"
                value={formData.default_supplier_id}
                onChange={(e) => setFormData({...formData, default_supplier_id: e.target.value})}
                placeholder="ID do fornecedor"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="abc_classification">Classificação ABC</Label>
              <Select value={formData.abc_classification} onValueChange={(value) => setFormData({...formData, abc_classification: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Classe A (Crítico)</SelectItem>
                  <SelectItem value="B">Classe B (Importante)</SelectItem>
                  <SelectItem value="C">Classe C (Normal)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="xyz_classification">Classificação XYZ</Label>
              <Select value={formData.xyz_classification} onValueChange={(value) => setFormData({...formData, xyz_classification: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="X">X (Previsível)</SelectItem>
                  <SelectItem value="Y">Y (Sazonal)</SelectItem>
                  <SelectItem value="Z">Z (Irregular)</SelectItem>
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
                  <SelectItem value="discontinued">Descontinuado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : (sku ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

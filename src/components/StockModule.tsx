import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AuthBanner } from '@/components/AuthBanner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Package, 
  AlertTriangle, 
  TrendingDown,
  MapPin,
  Plus,
  Edit3,
  Trash2
} from 'lucide-react';

interface SKU {
  id: string;
  sku_code: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  location?: string;
  last_movement_date?: string;
  classification: 'A' | 'B' | 'C';
  status: 'active' | 'inactive' | 'critical' | 'normal' | 'warning';
  created_at: string;
  updated_at: string;
}

export const StockModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [skus, setSKUs] = useState<SKU[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSKU, setEditingSKU] = useState<SKU | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    sku_code: '',
    name: '',
    description: '',
    category: '',
    unit: 'piece',
    current_stock: 0,
    min_stock: 0,
    max_stock: 100,
    location: '',
    classification: 'C' as 'A' | 'B' | 'C'
  });

  useEffect(() => {
    fetchSKUs();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchSKUs = async () => {
    try {
      const { data, error } = await supabase
        .from('skus')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSKUs(data?.map(item => ({
        ...item,
        classification: item.classification as 'A' | 'B' | 'C',
        status: item.status as 'active' | 'inactive' | 'critical' | 'normal' | 'warning'
      })) || []);
    } catch (error) {
      console.error('Erro ao carregar SKUs:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar itens do estoque",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

      const skuData = {
        ...formData,
        user_id: user.id,
        status: formData.current_stock < formData.min_stock ? 'critical' : 'normal'
      };

      if (editingSKU) {
        const { error } = await supabase
          .from('skus')
          .update(skuData)
          .eq('id', editingSKU.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Item atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('skus')
          .insert([skuData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Item adicionado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingSKU(null);
      resetForm();
      fetchSKUs();
    } catch (error) {
      console.error('Erro ao salvar SKU:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar item",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      sku_code: '',
      name: '',
      description: '',
      category: '',
      unit: 'piece',
      current_stock: 0,
      min_stock: 0,
      max_stock: 100,
      location: '',
      classification: 'C'
    });
  };

  const handleEdit = (sku: SKU) => {
    setEditingSKU(sku);
    setFormData({
      sku_code: sku.sku_code,
      name: sku.name,
      description: sku.description || '',
      category: sku.category,
      unit: sku.unit,
      current_stock: sku.current_stock,
      min_stock: sku.min_stock,
      max_stock: sku.max_stock,
      location: sku.location || '',
      classification: sku.classification
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const { error } = await supabase
        .from('skus')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Item excluído com sucesso!",
      });
      fetchSKUs();
    } catch (error) {
      console.error('Erro ao excluir SKU:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir item",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const filteredItems = skus.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSKUs = skus.length;
  const criticalItems = skus.filter(item => item.status === 'critical').length;
  const lowStockItems = skus.filter(item => item.current_stock < item.min_stock).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <AuthBanner user={currentUser} onAuthChange={getCurrentUser} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Estoque</h1>
          <p className="text-gray-600 mt-1">Controle total dos itens do almoxarifado</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={() => {
                resetForm();
                setEditingSKU(null);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSKU ? 'Editar Item' : 'Novo Item'}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku_code">Código SKU *</Label>
                  <Input
                    id="sku_code"
                    value={formData.sku_code}
                    onChange={(e) => setFormData({ ...formData, sku_code: e.target.value })}
                    required
                    placeholder="Ex: SKU001"
                  />
                </div>
                
                <div>
                  <Label htmlFor="name">Nome do Item *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Ex: Parafuso M6 x 20mm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    placeholder="Ex: Ferramentas"
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit">Unidade</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piece">Peça</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="liter">Litro</SelectItem>
                      <SelectItem value="meter">Metro</SelectItem>
                      <SelectItem value="box">Caixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="current_stock">Estoque Atual</Label>
                  <Input
                    id="current_stock"
                    type="number"
                    value={formData.current_stock}
                    onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="min_stock">Estoque Mínimo</Label>
                  <Input
                    id="min_stock"
                    type="number"
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="max_stock">Estoque Máximo</Label>
                  <Input
                    id="max_stock"
                    type="number"
                    value={formData.max_stock}
                    onChange={(e) => setFormData({ ...formData, max_stock: parseInt(e.target.value) || 100 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ex: A-01-03-C"
                  />
                </div>
                
                <div>
                  <Label htmlFor="classification">Classificação ABC</Label>
                  <Select value={formData.classification} onValueChange={(value: 'A' | 'B' | 'C') => setFormData({ ...formData, classification: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Classe A - Alta rotatividade</SelectItem>
                      <SelectItem value="B">Classe B - Média rotatividade</SelectItem>
                      <SelectItem value="C">Classe C - Baixa rotatividade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição detalhada do item"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingSKU ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de SKUs</p>
                <p className="text-2xl font-bold">{totalSKUs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Estoque Crítico</p>
                <p className="text-2xl font-bold text-red-600">{criticalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Localizações</p>
                <p className="text-2xl font-bold">{new Set(skus.map(s => s.location).filter(Boolean)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por SKU ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Itens */}
      <Card>
        <CardHeader>
          <CardTitle>Itens em Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'Nenhum item encontrado' : 'Nenhum item cadastrado'}
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <Badge variant="outline">{item.sku_code}</Badge>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status === 'critical' ? 'Crítico' : 'Normal'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Categoria:</span>
                          <p>{item.category}</p>
                        </div>
                        <div>
                          <span className="font-medium">Estoque Atual:</span>
                          <p className={item.current_stock < item.min_stock ? 'text-red-600 font-semibold' : ''}>
                            {item.current_stock} {item.unit}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Min/Max:</span>
                          <p>{item.min_stock}/{item.max_stock} {item.unit}</p>
                        </div>
                        <div>
                          <span className="font-medium">Localização:</span>
                          <p className="font-mono">{item.location || 'Não definida'}</p>
                        </div>
                        <div>
                          <span className="font-medium">Classificação:</span>
                          <p>Curva {item.classification}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(item)}
                        className="flex items-center gap-1"
                      >
                        <Edit3 className="h-3 w-3" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
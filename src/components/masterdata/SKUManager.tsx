
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Plus, 
  Package,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { SKUFormModal } from './SKUFormModal';
import { masterDataApi } from '@/services/masterDataApi';
import { useToast } from '@/hooks/use-toast';

export const SKUManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedClassification, setSelectedClassification] = useState('all');
  const [skus, setSKUs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSKU, setSelectedSKU] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSKUs();
  }, []);

  const loadSKUs = async () => {
    setLoading(true);
    try {
      const data = await masterDataApi.getSKUs();
      setSKUs(data);
    } catch (error) {
      console.error('Erro ao carregar SKUs:', error);
      // Use mock data if API fails
      setSKUs([
        {
          id: '1',
          sku_code: 'PAR-M6-20',
          description: 'Parafuso Sextavado M6 x 20mm Aço Inox',
          unit_of_measure: 'piece',
          abc_classification: 'A',
          xyz_classification: 'X',
          current_stock: 2450,
          min_stock: 500,
          max_stock: 5000,
          status: 'active',
          category: 'Ferramentas',
          supplier: 'Parafusos & Cia'
        },
        {
          id: '2',
          sku_code: 'CAP-220UF',
          description: 'Capacitor Eletrolítico 220µF 25V',
          unit_of_measure: 'piece',
          abc_classification: 'B',
          xyz_classification: 'Y',
          current_stock: 85,
          min_stock: 100,
          max_stock: 500,
          status: 'active',
          category: 'Eletrônicos',
          supplier: 'TechParts Ltda'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sku: any) => {
    setSelectedSKU(sku);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este SKU?')) return;

    try {
      await masterDataApi.deleteSKU(id);
      toast({
        title: "Sucesso",
        description: "SKU excluído com sucesso",
      });
      loadSKUs();
    } catch (error) {
      toast({
        title: "Erro",
        description: (error as Error).message || "Erro ao excluir SKU",
        variant: "destructive",
      });
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedSKU(null);
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'A': return 'bg-red-100 text-red-800';
      case 'B': return 'bg-yellow-100 text-yellow-800';
      case 'C': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (current: number, min: number) => {
    if (current <= min) return { status: 'critical', color: 'text-red-600', icon: AlertTriangle };
    if (current <= min * 1.5) return { status: 'warning', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'normal', color: 'text-green-600', icon: CheckCircle };
  };

  const filteredSKUs = skus.filter(sku => {
    const matchesSearch = sku.sku_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sku.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || sku.category === selectedCategory;
    const matchesClassification = selectedClassification === 'all' || sku.abc_classification === selectedClassification;
    
    return matchesSearch && matchesCategory && matchesClassification;
  });

  if (loading) {
    return (
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando SKUs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de SKUs</h2>
          <p className="text-gray-600">Cadastro e controle de itens do estoque</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo SKU
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {skus.filter(s => s.abc_classification === 'A').length}
              </div>
              <div className="text-sm text-gray-600">Classe A (80%)</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {skus.filter(s => s.abc_classification === 'B').length}
              </div>
              <div className="text-sm text-gray-600">Classe B (15%)</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {skus.filter(s => s.abc_classification === 'C').length}
              </div>
              <div className="text-sm text-gray-600">Classe C (5%)</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {skus.filter(s => s.current_stock <= s.min_stock).length}
              </div>
              <div className="text-sm text-gray-600">Estoque Crítico</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por código SKU ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="Ferramentas">Ferramentas</SelectItem>
                <SelectItem value="Eletrônicos">Eletrônicos</SelectItem>
                <SelectItem value="EPI">EPI</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedClassification} onValueChange={setSelectedClassification}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Classificação ABC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Classes</SelectItem>
                <SelectItem value="A">Classe A</SelectItem>
                <SelectItem value="B">Classe B</SelectItem>
                <SelectItem value="C">Classe C</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avançados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SKU List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Lista de SKUs ({filteredSKUs.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSKUs.map((sku) => {
              const stockStatus = getStockStatus(sku.current_stock, sku.min_stock);
              const StatusIcon = stockStatus.icon;
              
              return (
                <div key={sku.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{sku.sku_code}</h3>
                        <Badge className={getClassificationColor(sku.abc_classification)}>
                          Classe {sku.abc_classification}
                        </Badge>
                        <Badge variant="outline">
                          {sku.xyz_classification}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <StatusIcon className={`h-4 w-4 ${stockStatus.color}`} />
                          <span className={`text-sm ${stockStatus.color}`}>
                            {sku.current_stock} {sku.unit_of_measure === 'piece' ? 'pçs' : sku.unit_of_measure}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-2">{sku.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Categoria:</span>
                          <p>{sku.category}</p>
                        </div>
                        <div>
                          <span className="font-medium">Fornecedor:</span>
                          <p>{sku.supplier}</p>
                        </div>
                        <div>
                          <span className="font-medium">Estoque Min/Max:</span>
                          <p>{sku.min_stock}/{sku.max_stock}</p>
                        </div>
                        <div>
                          <span className="font-medium">Unidade:</span>
                          <p>{sku.unit_of_measure === 'piece' ? 'Peça' : 
                             sku.unit_of_measure === 'pack' ? 'Pacote' : sku.unit_of_measure}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(sku)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(sku.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <SKUFormModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={loadSKUs}
        sku={selectedSKU}
      />
    </div>
  );
};

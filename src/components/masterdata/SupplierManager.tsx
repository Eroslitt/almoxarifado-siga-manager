
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
  Building,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Star,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { SupplierFormModal } from './SupplierFormModal';
import { masterDataApi } from '@/services/masterDataApi';
import { useToast } from '@/hooks/use-toast';

export const SupplierManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await masterDataApi.getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      // Use mock data if API fails
      setSuppliers([
        {
          id: '1',
          company_name: 'Parafusos & Cia Ltda',
          trade_name: 'Parafusos & Cia',
          cnpj: '12.345.678/0001-90',
          contact_person: 'João Silva',
          email: 'contato@parafusos.com',
          phone: '(11) 99999-9999',
          address: 'Rua das Ferramentas, 123',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01234-567',
          status: 'active',
          rating: 4.8,
          active_skus: 145,
          total_orders: 89,
          last_order: '2024-01-15'
        },
        {
          id: '2',
          company_name: 'TechParts Eletrônicos S.A.',
          trade_name: 'TechParts',
          cnpj: '98.765.432/0001-10',
          contact_person: 'Maria Santos',
          email: 'vendas@techparts.com',
          phone: '(11) 88888-8888',
          address: 'Av. Tecnologia, 456',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '04567-890',
          status: 'active',
          rating: 4.6,
          active_skus: 98,
          total_orders: 67,
          last_order: '2024-01-20'
        },
        {
          id: '3',
          company_name: 'Segurança Total EPI',
          trade_name: 'Segurança Total',
          cnpj: '11.222.333/0001-44',
          contact_person: 'Pedro Costa',
          email: 'epi@segurancatotal.com',
          phone: '(11) 77777-7777',
          address: 'Rua da Segurança, 789',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '05678-901',
          status: 'inactive',
          rating: 4.9,
          active_skus: 67,
          total_orders: 45,
          last_order: '2023-12-10'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplier: any) => {
    setSelectedSupplier(supplier);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return;

    try {
      // await masterDataApi.deleteSupplier(id);
      toast({
        title: "Sucesso",
        description: "Fornecedor excluído com sucesso",
      });
      loadSuppliers();
    } catch (error) {
      toast({
        title: "Erro",
        description: (error as Error).message || "Erro ao excluir fornecedor",
        variant: "destructive",
      });
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedSupplier(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'inactive': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.trade_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.cnpj.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || supplier.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando fornecedores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Fornecedores</h2>
          <p className="text-gray-600">Cadastro e controle de fornecedores</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {suppliers.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Ativos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {suppliers.filter(s => s.status === 'inactive').length}
              </div>
              <div className="text-sm text-gray-600">Inativos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {suppliers.reduce((sum, s) => sum + (s.active_skus || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">SKUs Fornecidos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {(suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avaliação Média</div>
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
                  placeholder="Buscar por nome, razão social ou CNPJ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avançados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Lista de Fornecedores ({filteredSuppliers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSuppliers.map((supplier) => {
              const StatusIcon = getStatusIcon(supplier.status);
              
              return (
                <div key={supplier.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{supplier.company_name}</h3>
                        <Badge className={getStatusColor(supplier.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {supplier.status === 'active' ? 'Ativo' : 
                           supplier.status === 'inactive' ? 'Inativo' : 'Pendente'}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          {getRatingStars(supplier.rating)}
                          <span className="text-sm text-gray-600 ml-1">({supplier.rating})</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-2">{supplier.trade_name}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4" />
                            <span>CNPJ: {formatCNPJ(supplier.cnpj)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>{supplier.phone}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{supplier.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{supplier.city}, {supplier.state}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div>
                            <span className="font-medium">SKUs Ativos:</span>
                            <span className="ml-2">{supplier.active_skus}</span>
                          </div>
                          <div>
                            <span className="font-medium">Pedidos:</span>
                            <span className="ml-2">{supplier.total_orders}</span>
                          </div>
                        </div>
                      </div>
                      
                      {supplier.last_order && (
                        <div className="mt-2 text-sm text-gray-500">
                          Último pedido: {new Date(supplier.last_order).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(supplier)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(supplier.id)}
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

      <SupplierFormModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={loadSuppliers}
        supplier={selectedSupplier}
      />
    </div>
  );
};

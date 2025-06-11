
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, Search, Plus, Star, Phone, Mail, MapPin } from 'lucide-react';

export const SupplierManager = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const suppliers = [
    {
      id: '1',
      company_name: 'Parafusos & Cia Ltda',
      trade_name: 'Parafusos & Cia',
      cnpj: '12.345.678/0001-90',
      contact_info: {
        phone: '(11) 3456-7890',
        email: 'vendas@parafusosecia.com.br',
        contact_person: 'João Silva'
      },
      address: {
        city: 'São Paulo',
        state: 'SP'
      },
      rating: 4.5,
      lead_time_days: 7,
      status: 'active'
    },
    {
      id: '2',
      company_name: 'TechParts Comércio Ltda',
      trade_name: 'TechParts',
      cnpj: '98.765.432/0001-10',
      contact_info: {
        phone: '(11) 2345-6789',
        email: 'compras@techparts.com.br',
        contact_person: 'Maria Santos'
      },
      address: {
        city: 'Campinas',
        state: 'SP'
      },
      rating: 4.8,
      lead_time_days: 5,
      status: 'active'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.trade_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.cnpj.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Fornecedores</h2>
          <p className="text-gray-600">Cadastro e controle de fornecedores</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">156</div>
              <div className="text-sm text-gray-600">Fornecedores Ativos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">4.6</div>
              <div className="text-sm text-gray-600">Avaliação Média</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">8.5</div>
              <div className="text-sm text-gray-600">Lead Time Médio (dias)</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-gray-600">Novos este Mês</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Lista de Fornecedores ({filteredSuppliers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{supplier.company_name}</h3>
                      <Badge className={getStatusColor(supplier.status)}>
                        {supplier.status === 'active' ? 'Ativo' : 
                         supplier.status === 'inactive' ? 'Inativo' : 'Bloqueado'}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {renderStars(supplier.rating)}
                        <span className="text-sm text-gray-600 ml-1">({supplier.rating})</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{supplier.trade_name} • CNPJ: {supplier.cnpj}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{supplier.contact_info.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{supplier.contact_info.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{supplier.address.city}/{supplier.address.state}</span>
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">Lead Time:</span> {supplier.lead_time_days} dias
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Contato:</span> {supplier.contact_info.contact_person}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

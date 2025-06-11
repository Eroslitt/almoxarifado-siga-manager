
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tags, Search, Plus, Folder, FolderOpen, Package } from 'lucide-react';

export const CategoryManager = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    {
      id: '1',
      name: 'Ferramentas',
      description: 'Ferramentas manuais e equipamentos',
      code: 'FERR',
      parent_id: null,
      sku_count: 1245,
      status: 'active',
      subcategories: [
        { id: '1-1', name: 'Parafusos e Fixadores', sku_count: 456 },
        { id: '1-2', name: 'Chaves e Alicates', sku_count: 123 },
        { id: '1-3', name: 'Furadeiras e Brocas', sku_count: 89 }
      ]
    },
    {
      id: '2',
      name: 'Eletrônicos',
      description: 'Componentes eletrônicos e elétricos',
      code: 'ELET',
      parent_id: null,
      sku_count: 876,
      status: 'active',
      subcategories: [
        { id: '2-1', name: 'Capacitores', sku_count: 234 },
        { id: '2-2', name: 'Resistores', sku_count: 345 },
        { id: '2-3', name: 'Semicondutores', sku_count: 167 }
      ]
    },
    {
      id: '3',
      name: 'EPI',
      description: 'Equipamentos de Proteção Individual',
      code: 'EPI',
      parent_id: null,
      sku_count: 234,
      status: 'active',
      subcategories: [
        { id: '3-1', name: 'Luvas de Segurança', sku_count: 89 },
        { id: '3-2', name: 'Óculos de Proteção', sku_count: 67 },
        { id: '3-3', name: 'Capacetes', sku_count: 45 }
      ]
    }
  ];

  const [expandedCategories, setExpandedCategories] = useState<string[]>(['1']);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Categorias</h2>
          <p className="text-gray-600">Organização hierárquica dos itens</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Subcategoria
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">45</div>
              <div className="text-sm text-gray-600">Categorias Principais</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">156</div>
              <div className="text-sm text-gray-600">Subcategorias</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">2,847</div>
              <div className="text-sm text-gray-600">SKUs Categorizados</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">12</div>
              <div className="text-sm text-gray-600">Sem Categoria</div>
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
              placeholder="Buscar categorias por nome, código ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Tree */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tags className="h-5 w-5" />
            <span>Árvore de Categorias</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCategories.map((category) => {
              const isExpanded = expandedCategories.includes(category.id);
              
              return (
                <div key={category.id} className="border rounded-lg">
                  {/* Main Category */}
                  <div 
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {isExpanded ? (
                          <FolderOpen className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Folder className="h-5 w-5 text-gray-600" />
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{category.name}</h3>
                            <Badge variant="outline">{category.code}</Badge>
                            <Badge className="bg-blue-100 text-blue-800">
                              {category.sku_count} SKUs
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">
                          {category.subcategories.length} subcategorias
                        </Badge>
                        <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subcategories */}
                  {isExpanded && (
                    <div className="border-t bg-gray-50">
                      {category.subcategories.map((sub) => (
                        <div key={sub.id} className="p-4 pl-12 border-b last:border-b-0 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Package className="h-4 w-4 text-gray-500" />
                              <div>
                                <h4 className="font-medium text-gray-800">{sub.name}</h4>
                                <p className="text-sm text-gray-600">{sub.sku_count} SKUs</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                Ver SKUs
                              </Button>
                              <Button variant="ghost" size="sm">
                                Editar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="p-4 pl-12">
                        <Button variant="outline" size="sm" className="text-blue-600">
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Subcategoria
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

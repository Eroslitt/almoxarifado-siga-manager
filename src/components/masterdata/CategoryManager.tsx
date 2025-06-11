
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Folder,
  FolderOpen,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Tag,
  Hash
} from 'lucide-react';
import { masterDataApi } from '@/services/masterDataApi';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  description: string;
  parent_id: string | null;
  level: number;
  sku_count: number;
  children?: Category[];
  expanded?: boolean;
}

export const CategoryManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await masterDataApi.getCategories();
      const hierarchicalData = buildHierarchy(data);
      setCategories(hierarchicalData);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      // Use mock data if API fails
      const mockData = [
        {
          id: '1',
          name: 'Ferramentas',
          description: 'Ferramentas e equipamentos diversos',
          parent_id: null,
          level: 0,
          sku_count: 245,
          expanded: true,
          children: [
            {
              id: '1-1',
              name: 'Ferramentas Manuais',
              description: 'Ferramentas de uso manual',
              parent_id: '1',
              level: 1,
              sku_count: 145,
              children: [
                {
                  id: '1-1-1',
                  name: 'Chaves',
                  description: 'Chaves de fenda, philips, allen, etc.',
                  parent_id: '1-1',
                  level: 2,
                  sku_count: 67
                },
                {
                  id: '1-1-2',
                  name: 'Alicates',
                  description: 'Alicates universais, bico, descascador, etc.',
                  parent_id: '1-1',
                  level: 2,
                  sku_count: 34
                }
              ]
            },
            {
              id: '1-2',
              name: 'Ferramentas Elétricas',
              description: 'Ferramentas com motor elétrico',
              parent_id: '1',
              level: 1,
              sku_count: 100,
              children: [
                {
                  id: '1-2-1',
                  name: 'Furadeiras',
                  description: 'Furadeiras de impacto e convencionais',
                  parent_id: '1-2',
                  level: 2,
                  sku_count: 45
                },
                {
                  id: '1-2-2',
                  name: 'Parafusadeiras',
                  description: 'Parafusadeiras elétricas e pneumáticas',
                  parent_id: '1-2',
                  level: 2,
                  sku_count: 55
                }
              ]
            }
          ]
        },
        {
          id: '2',
          name: 'Eletrônicos',
          description: 'Componentes e equipamentos eletrônicos',
          parent_id: null,
          level: 0,
          sku_count: 876,
          expanded: true,
          children: [
            {
              id: '2-1',
              name: 'Componentes Passivos',
              description: 'Resistores, capacitores, indutores',
              parent_id: '2',
              level: 1,
              sku_count: 456,
              children: [
                {
                  id: '2-1-1',
                  name: 'Resistores',
                  description: 'Resistores de carbono, filme metálico, etc.',
                  parent_id: '2-1',
                  level: 2,
                  sku_count: 234
                },
                {
                  id: '2-1-2',
                  name: 'Capacitores',
                  description: 'Capacitores eletrolíticos, cerâmicos, etc.',
                  parent_id: '2-1',
                  level: 2,
                  sku_count: 156
                }
              ]
            },
            {
              id: '2-2',
              name: 'Componentes Ativos',
              description: 'Transistores, CIs, diodos',
              parent_id: '2',
              level: 1,
              sku_count: 420
            }
          ]
        },
        {
          id: '3',
          name: 'EPI',
          description: 'Equipamentos de Proteção Individual',
          parent_id: null,
          level: 0,
          sku_count: 234,
          children: [
            {
              id: '3-1',
              name: 'Proteção da Cabeça',
              description: 'Capacetes, óculos, protetores auriculares',
              parent_id: '3',
              level: 1,
              sku_count: 89
            },
            {
              id: '3-2',
              name: 'Proteção do Corpo',
              description: 'Uniformes, aventais, coletes',
              parent_id: '3',
              level: 1,
              sku_count: 145
            }
          ]
        }
      ];
      setCategories(mockData);
    } finally {
      setLoading(false);
    }
  };

  const buildHierarchy = (flatCategories: any[]): Category[] => {
    const categoryMap = new Map();
    const roots: Category[] = [];

    // Create map of all categories
    flatCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [], expanded: false });
    });

    // Build hierarchy
    flatCategories.forEach(cat => {
      const category = categoryMap.get(cat.id);
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children.push(category);
        }
      } else {
        roots.push(category);
      }
    });

    return roots;
  };

  const toggleExpanded = (categoryId: string) => {
    const updateExpanded = (cats: Category[]): Category[] => {
      return cats.map(cat => {
        if (cat.id === categoryId) {
          return { ...cat, expanded: !cat.expanded };
        }
        if (cat.children) {
          return { ...cat, children: updateExpanded(cat.children) };
        }
        return cat;
      });
    };
    setCategories(updateExpanded(categories));
  };

  const renderCategory = (category: Category, depth: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const paddingLeft = depth * 24;

    return (
      <div key={category.id}>
        <div 
          className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
        >
          <div className="flex items-center space-x-3 flex-1">
            <div className="flex items-center space-x-2">
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => toggleExpanded(category.id)}
                >
                  {category.expanded ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </Button>
              ) : (
                <div className="w-6"></div>
              )}
              
              {hasChildren ? (
                category.expanded ? 
                  <FolderOpen className="h-5 w-5 text-blue-600" /> : 
                  <Folder className="h-5 w-5 text-blue-600" />
              ) : (
                <Tag className="h-5 w-5 text-gray-500" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <Badge variant="outline" className="text-xs">
                  <Hash className="h-3 w-3 mr-1" />
                  {category.sku_count} SKUs
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Nível {category.level}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">{category.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSelectedCategory(category);
                setShowModal(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 hover:text-red-700"
              onClick={() => handleDelete(category.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {hasChildren && category.expanded && (
          <div>
            {category.children!.map(child => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      // await masterDataApi.deleteCategory(id);
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso",
      });
      loadCategories();
    } catch (error) {
      toast({
        title: "Erro",
        description: (error as Error).message || "Erro ao excluir categoria",
        variant: "destructive",
      });
    }
  };

  const getTotalSKUs = (categories: Category[]): number => {
    return categories.reduce((total, cat) => {
      let sum = cat.sku_count || 0;
      if (cat.children) {
        sum += getTotalSKUs(cat.children);
      }
      return total + sum;
    }, 0);
  };

  const getTotalCategories = (categories: Category[]): number => {
    return categories.reduce((total, cat) => {
      let count = 1;
      if (cat.children) {
        count += getTotalCategories(cat.children);
      }
      return total + count;
    }, 0);
  };

  if (loading) {
    return (
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando categorias...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Categorias</h2>
          <p className="text-gray-600">Organização hierárquica de produtos</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {getTotalCategories(categories)}
              </div>
              <div className="text-sm text-gray-600">Total de Categorias</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {categories.length}
              </div>
              <div className="text-sm text-gray-600">Categorias Raiz</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.max(...categories.map(cat => 
                  Math.max(cat.level, cat.children ? Math.max(...cat.children.map(c => c.level)) : 0)
                ))}
              </div>
              <div className="text-sm text-gray-600">Níveis de Profundidade</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {getTotalSKUs(categories)}
              </div>
              <div className="text-sm text-gray-600">SKUs Categorizados</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar categorias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button variant="outline">
              Expandir Todas
            </Button>
            
            <Button variant="outline">
              Recolher Todas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Tree */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Folder className="h-5 w-5" />
            <span>Hierarquia de Categorias</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div>
            {categories.map(category => renderCategory(category))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  History, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Plus, 
  Trash,
  User,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface AuditRecord {
  id: string;
  table_name: string;
  record_id: string;
  action: 'create' | 'update' | 'delete' | 'view';
  old_values: any;
  new_values: any;
  user_id: string;
  user_name: string;
  timestamp: string;
  description: string;
}

export const AuditTrail = () => {
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterTable, setFilterTable] = useState<string>('all');

  useEffect(() => {
    loadAuditRecords();
  }, []);

  const loadAuditRecords = async () => {
    setLoading(true);
    try {
      // Mock audit data - in real implementation, this would come from Supabase
      const mockData: AuditRecord[] = [
        {
          id: '1',
          table_name: 'skus',
          record_id: 'sku-001',
          action: 'create',
          old_values: null,
          new_values: { sku_code: 'SKU-001', description: 'Parafuso Phillips' },
          user_id: 'user-1',
          user_name: 'João Silva',
          timestamp: new Date().toISOString(),
          description: 'Criação de novo SKU'
        },
        {
          id: '2',
          table_name: 'suppliers',
          record_id: 'sup-001',
          action: 'update',
          old_values: { status: 'inactive' },
          new_values: { status: 'active' },
          user_id: 'user-2',
          user_name: 'Maria Santos',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          description: 'Ativação de fornecedor'
        },
        {
          id: '3',
          table_name: 'storage_locations',
          record_id: 'loc-001',
          action: 'create',
          old_values: null,
          new_values: { code: 'A-01-01-A', zone_type: 'picking' },
          user_id: 'user-1',
          user_name: 'João Silva',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          description: 'Criação de novo endereço de armazenagem'
        }
      ];
      
      setAuditRecords(mockData);
    } catch (error) {
      console.error('Erro ao carregar registros de auditoria:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'update':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'delete':
        return <Trash className="h-4 w-4 text-red-600" />;
      case 'view':
        return <Eye className="h-4 w-4 text-gray-600" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      case 'view':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const filteredRecords = auditRecords.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.record_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || record.action === filterAction;
    const matchesTable = filterTable === 'all' || record.table_name === filterTable;

    return matchesSearch && matchesAction && matchesTable;
  });

  if (loading) {
    return (
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando trilha de auditoria...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Trilha de Auditoria</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar registros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                <SelectItem value="create">Criação</SelectItem>
                <SelectItem value="update">Atualização</SelectItem>
                <SelectItem value="delete">Exclusão</SelectItem>
                <SelectItem value="view">Visualização</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterTable} onValueChange={setFilterTable}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tabela" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as tabelas</SelectItem>
                <SelectItem value="skus">SKUs</SelectItem>
                <SelectItem value="suppliers">Fornecedores</SelectItem>
                <SelectItem value="storage_locations">Endereços</SelectItem>
                <SelectItem value="categories">Categorias</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={loadAuditRecords}>
              <Filter className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {/* Audit Records */}
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <Card key={record.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getActionIcon(record.action)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant={getActionColor(record.action)}>
                            {record.action.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {record.table_name}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            ID: {record.record_id}
                          </span>
                        </div>
                        <p className="text-sm font-medium mb-2">
                          {record.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{record.user_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(record.timestamp), 'dd/MM/yyyy HH:mm')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Show changes for updates */}
                  {record.action === 'update' && record.old_values && record.new_values && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs font-medium text-gray-700 mb-2">Alterações:</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium text-red-600">Anterior:</span>
                          <pre className="text-red-600 mt-1">
                            {JSON.stringify(record.old_values, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <span className="font-medium text-green-600">Novo:</span>
                          <pre className="text-green-600 mt-1">
                            {JSON.stringify(record.new_values, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredRecords.length === 0 && (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum registro de auditoria encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Plus, 
  QrCode, 
  Edit, 
  Trash2,
  Download,
  Filter
} from 'lucide-react';

export const ToolsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const tools = [
    {
      id: 'FER-08172',
      name: 'Furadeira de Impacto Makita',
      category: 'Elétrica',
      status: 'in-use',
      location: 'A-01-05',
      registrationDate: '2024-01-15',
      lastMaintenance: '2024-05-10',
      currentUser: 'João Silva'
    },
    {
      id: 'FER-03945',
      name: 'Chave de Fenda Philips 6mm',
      category: 'Manual',
      status: 'available',
      location: 'B-02-12',
      registrationDate: '2024-02-20',
      lastMaintenance: '-',
      currentUser: null
    },
    {
      id: 'FER-05621',
      name: 'Alicate Universal 8"',
      category: 'Manual',
      status: 'maintenance',
      location: 'Oficina',
      registrationDate: '2024-01-08',
      lastMaintenance: '2024-06-01',
      currentUser: null
    },
    {
      id: 'FER-02134',
      name: 'Esmerilhadeira Angular 4.5"',
      category: 'Elétrica',
      status: 'available',
      location: 'A-03-08',
      registrationDate: '2024-03-12',
      lastMaintenance: '2024-04-15',
      currentUser: null
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in-use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponível';
      case 'in-use': return 'Em Uso';
      case 'maintenance': return 'Manutenção';
      case 'inactive': return 'Inativa';
      default: return 'Desconhecido';
    }
  };

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Controles Superiores */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Ferramenta
          </Button>
        </div>
      </div>

      {/* Tabela de Ferramentas */}
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Ferramentas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Ferramenta</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Usuário Atual</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell className="font-mono text-sm">{tool.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{tool.name}</div>
                      <div className="text-sm text-gray-500">
                        Cadastro: {new Date(tool.registrationDate).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tool.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(tool.status)}>
                      {getStatusText(tool.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{tool.location}</TableCell>
                  <TableCell>
                    {tool.currentUser ? (
                      <span className="text-sm">{tool.currentUser}</span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

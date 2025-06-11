
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Download, 
  Calendar, 
  MapPin,
  User,
  Clock,
  Package,
  Wrench,
  ArrowRight,
  Filter,
  BarChart3,
  FileText,
  Printer
} from 'lucide-react';

interface TraceabilityRecord {
  id: string;
  itemId: string;
  itemName: string;
  itemType: 'TOOL' | 'SKU';
  event: 'created' | 'moved' | 'checkout' | 'checkin' | 'maintenance' | 'updated';
  user: string;
  department: string;
  timestamp: string;
  location: string;
  details?: any;
  previousState?: any;
  newState?: any;
}

interface TraceabilityPath {
  itemId: string;
  itemName: string;
  totalEvents: number;
  firstSeen: string;
  lastActivity: string;
  currentLocation: string;
  status: string;
  records: TraceabilityRecord[];
}

export const TraceabilityReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Mock traceability data
  const mockPaths: TraceabilityPath[] = [
    {
      itemId: 'FER-08172',
      itemName: 'Furadeira de Impacto Makita',
      totalEvents: 15,
      firstSeen: '2024-01-15T08:00:00Z',
      lastActivity: '2024-06-11T14:30:00Z',
      currentLocation: 'Em uso - João Silva',
      status: 'in-use',
      records: [
        {
          id: '1',
          itemId: 'FER-08172',
          itemName: 'Furadeira de Impacto Makita',
          itemType: 'TOOL',
          event: 'created',
          user: 'Admin Sistema',
          department: 'Almoxarifado',
          timestamp: '2024-01-15T08:00:00Z',
          location: 'A-01-05',
          details: { purchasePrice: 450.00, supplier: 'Makita Brasil' }
        },
        {
          id: '2',
          itemId: 'FER-08172',
          itemName: 'Furadeira de Impacto Makita',
          itemType: 'TOOL',
          event: 'checkout',
          user: 'Maria Santos',
          department: 'Manutenção',
          timestamp: '2024-02-20T09:15:00Z',
          location: 'Setor Manutenção',
          details: { workOrder: 'OS-2024-001', expectedReturn: '2024-02-20T17:00:00Z' }
        },
        {
          id: '3',
          itemId: 'FER-08172',
          itemName: 'Furadeira de Impacto Makita',
          itemType: 'TOOL',
          event: 'checkin',
          user: 'Maria Santos',
          department: 'Manutenção',
          timestamp: '2024-02-20T16:45:00Z',
          location: 'A-01-05',
          details: { condition: 'Excelente', workOrderCompleted: 'OS-2024-001' }
        },
        {
          id: '4',
          itemId: 'FER-08172',
          itemName: 'Furadeira de Impacto Makita',
          itemType: 'TOOL',
          event: 'maintenance',
          user: 'Técnico Carlos',
          department: 'Manutenção',
          timestamp: '2024-05-10T10:00:00Z',
          location: 'Oficina Manutenção',
          details: { 
            type: 'Preventiva', 
            description: 'Troca de escovas e lubrificação',
            cost: 35.00,
            nextMaintenance: '2024-11-10T00:00:00Z'
          }
        },
        {
          id: '5',
          itemId: 'FER-08172',
          itemName: 'Furadeira de Impacto Makita',
          itemType: 'TOOL',
          event: 'checkout',
          user: 'João Silva',
          department: 'Produção',
          timestamp: '2024-06-11T14:30:00Z',
          location: 'Linha Produção 1',
          details: { workOrder: 'OS-2024-089', expectedReturn: '2024-06-11T22:00:00Z' }
        }
      ]
    }
  ];

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'created': return Package;
      case 'checkout': return ArrowRight;
      case 'checkin': return ArrowRight;
      case 'maintenance': return Wrench;
      case 'moved': return MapPin;
      case 'updated': return FileText;
      default: return Clock;
    }
  };

  const getEventColor = (event: string) => {
    switch (event) {
      case 'created': return 'text-blue-600';
      case 'checkout': return 'text-orange-600';
      case 'checkin': return 'text-green-600';
      case 'maintenance': return 'text-purple-600';
      case 'moved': return 'text-cyan-600';
      case 'updated': return 'text-gray-600';
      default: return 'text-gray-500';
    }
  };

  const getEventDescription = (event: string) => {
    switch (event) {
      case 'created': return 'Criado';
      case 'checkout': return 'Retirada';
      case 'checkin': return 'Devolução';
      case 'maintenance': return 'Manutenção';
      case 'moved': return 'Movimentação';
      case 'updated': return 'Atualização';
      default: return 'Evento';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in-use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'reserved': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const formatDuration = (from: string, to: string) => {
    const fromTime = new Date(from).getTime();
    const toTime = new Date(to).getTime();
    const diffHours = Math.round((toTime - fromTime) / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.round(diffHours / 24)}d`;
  };

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting traceability report as ${format}`);
    // Implementation would generate and download the report
  };

  const filteredPaths = mockPaths.filter(path =>
    path.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    path.itemId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios de Rastreabilidade</h1>
          <p className="text-gray-600 mt-1">Histórico completo de movimentações e eventos</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleExportReport('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => handleExportReport('excel')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleExportReport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              placeholder="Data inicial"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            />
            <Input
              type="date"
              placeholder="Data final"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            />
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avançados
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Itens Rastreados</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {filteredPaths.map((path) => (
                  <div
                    key={path.itemId}
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                      selectedItem === path.itemId ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedItem(path.itemId)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{path.itemName}</h4>
                      <Badge className={getStatusColor(path.status)}>
                        {path.status === 'in-use' ? 'Em Uso' : 
                         path.status === 'available' ? 'Disponível' : 
                         path.status === 'maintenance' ? 'Manutenção' : 'Reservado'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>ID: {path.itemId}</p>
                      <p>Eventos: {path.totalEvents}</p>
                      <p>Última atividade: {formatDateTime(path.lastActivity)}</p>
                      <p>Local atual: {path.currentLocation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Timeline Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedItem ? 
                `Timeline - ${filteredPaths.find(p => p.itemId === selectedItem)?.itemName}` : 
                'Selecione um item para ver o timeline'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedItem ? (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredPaths
                    .find(p => p.itemId === selectedItem)
                    ?.records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((record, index, records) => {
                      const Icon = getEventIcon(record.event);
                      const isLast = index === records.length - 1;
                      
                      return (
                        <div key={record.id} className="relative">
                          {/* Timeline line */}
                          {!isLast && (
                            <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                          )}
                          
                          <div className="flex items-start space-x-4">
                            <div className={`p-2 rounded-full bg-white border-2 ${getEventColor(record.event)} border-current`}>
                              <Icon className={`h-4 w-4 ${getEventColor(record.event)}`} />
                            </div>
                            
                            <div className="flex-1 bg-white border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900">
                                  {getEventDescription(record.event)}
                                </h4>
                                <span className="text-sm text-gray-500">
                                  {formatDateTime(record.timestamp)}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4" />
                                  <span>{record.user}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{record.location}</span>
                                </div>
                              </div>
                              
                              {record.details && (
                                <div className="mt-3 p-3 bg-gray-50 rounded border">
                                  <h5 className="font-medium text-sm mb-2">Detalhes do Evento:</h5>
                                  <div className="text-xs text-gray-600 space-y-1">
                                    {Object.entries(record.details).map(([key, value]) => (
                                      <div key={key} className="flex justify-between">
                                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                        <span className="font-medium">
                                          {typeof value === 'number' && key.includes('Price') || key.includes('cost') 
                                            ? `R$ ${value.toFixed(2)}` 
                                            : String(value)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Duration calculation */}
                              {index < records.length - 1 && (
                                <div className="mt-2 text-xs text-gray-500">
                                  Duração até próximo evento: {formatDuration(record.timestamp, records[index + 1].timestamp)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um item na lista ao lado para visualizar seu timeline completo</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Rastreabilidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(() => {
                const path = filteredPaths.find(p => p.itemId === selectedItem);
                if (!path) return null;
                
                const totalUsageTime = path.records
                  .filter(r => r.event === 'checkout')
                  .reduce((total, checkout) => {
                    const checkin = path.records.find(r => 
                      r.event === 'checkin' && 
                      new Date(r.timestamp) > new Date(checkout.timestamp)
                    );
                    if (checkin) {
                      return total + (new Date(checkin.timestamp).getTime() - new Date(checkout.timestamp).getTime());
                    }
                    return total;
                  }, 0);

                const usageHours = Math.round(totalUsageTime / (1000 * 60 * 60));
                const maintenanceCount = path.records.filter(r => r.event === 'maintenance').length;
                const usageCount = path.records.filter(r => r.event === 'checkout').length;
                const daysSinceCreated = Math.round((Date.now() - new Date(path.firstSeen).getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 mb-1">Tempo Total de Uso</p>
                      <p className="text-2xl font-bold text-blue-800">{usageHours}h</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 mb-1">Utilizações</p>
                      <p className="text-2xl font-bold text-green-800">{usageCount}</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600 mb-1">Manutenções</p>
                      <p className="text-2xl font-bold text-purple-800">{maintenanceCount}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Dias no Sistema</p>
                      <p className="text-2xl font-bold text-gray-800">{daysSinceCreated}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

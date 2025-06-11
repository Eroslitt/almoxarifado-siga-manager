
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  Download, 
  FileText, 
  Table,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  Database,
  Zap,
  History,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImportJob {
  id: string;
  type: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  recordsTotal: number;
  recordsProcessed: number;
  recordsSuccess: number;
  recordsError: number;
  errors: string[];
  startTime: Date;
  endTime?: Date;
}

export const DataImportExport = () => {
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'history'>('import');
  const [selectedDataType, setSelectedDataType] = useState('skus');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([
    {
      id: '1',
      type: 'SKUs',
      filename: 'skus_janeiro_2024.xlsx',
      status: 'completed',
      progress: 100,
      recordsTotal: 1247,
      recordsProcessed: 1247,
      recordsSuccess: 1189,
      recordsError: 58,
      errors: [
        'Linha 23: CNPJ do fornecedor inválido',
        'Linha 45: Código SKU duplicado',
        'Linha 78: Classificação ABC inválida'
      ],
      startTime: new Date('2024-01-15T10:30:00'),
      endTime: new Date('2024-01-15T10:45:00')
    },
    {
      id: '2',
      type: 'Fornecedores',
      filename: 'fornecedores_novos.csv',
      status: 'processing',
      progress: 67,
      recordsTotal: 156,
      recordsProcessed: 104,
      recordsSuccess: 98,
      recordsError: 6,
      errors: [],
      startTime: new Date('2024-01-20T14:15:00')
    },
    {
      id: '3',
      type: 'Localizações',
      filename: 'enderecos_almoxarifado.xlsx',
      status: 'error',
      progress: 25,
      recordsTotal: 500,
      recordsProcessed: 125,
      recordsSuccess: 0,
      recordsError: 125,
      errors: [
        'Formato de arquivo não suportado',
        'Colunas obrigatórias não encontradas'
      ],
      startTime: new Date('2024-01-18T09:00:00'),
      endTime: new Date('2024-01-18T09:05:00')
    }
  ]);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para importar",
        variant: "destructive",
      });
      return;
    }

    const newJob: ImportJob = {
      id: Date.now().toString(),
      type: selectedDataType,
      filename: selectedFile.name,
      status: 'pending',
      progress: 0,
      recordsTotal: Math.floor(Math.random() * 1000) + 100,
      recordsProcessed: 0,
      recordsSuccess: 0,
      recordsError: 0,
      errors: [],
      startTime: new Date()
    };

    setImportJobs([newJob, ...importJobs]);
    
    // Simulate processing
    setTimeout(() => {
      newJob.status = 'processing';
      setImportJobs([...importJobs]);
      
      // Simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          newJob.status = 'completed';
          newJob.progress = 100;
          newJob.recordsProcessed = newJob.recordsTotal;
          newJob.recordsSuccess = Math.floor(newJob.recordsTotal * 0.95);
          newJob.recordsError = newJob.recordsTotal - newJob.recordsSuccess;
          newJob.endTime = new Date();
          clearInterval(interval);
        } else {
          newJob.progress = Math.floor(progress);
          newJob.recordsProcessed = Math.floor((progress / 100) * newJob.recordsTotal);
        }
        setImportJobs([...importJobs]);
      }, 500);
    }, 1000);

    toast({
      title: "Importação Iniciada",
      description: `Processando arquivo ${selectedFile.name}`,
    });

    setSelectedFile(null);
    if (event.target) {
      (event.target as HTMLInputElement).value = '';
    }
  };

  const handleExport = async () => {
    toast({
      title: "Exportação Iniciada",
      description: `Gerando arquivo de ${selectedDataType}`,
    });

    // Simulate export
    setTimeout(() => {
      toast({
        title: "Exportação Concluída",
        description: "Arquivo pronto para download",
      });
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'processing': return Clock;
      case 'error': return AlertTriangle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderImportTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Importar Dados</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="dataType">Tipo de Dados</Label>
            <Select value={selectedDataType} onValueChange={setSelectedDataType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skus">SKUs / Produtos</SelectItem>
                <SelectItem value="suppliers">Fornecedores</SelectItem>
                <SelectItem value="locations">Localizações</SelectItem>
                <SelectItem value="categories">Categorias</SelectItem>
                <SelectItem value="movements">Movimentações</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="file">Arquivo (Excel, CSV)</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-500 mt-1">
              Formatos suportados: .xlsx, .xls, .csv (máximo 10MB)
            </p>
          </div>

          {selectedFile && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <Badge variant="outline">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Badge>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Button onClick={handleImport} disabled={!selectedFile}>
              <Upload className="h-4 w-4 mr-2" />
              Iniciar Importação
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Baixar Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Diretrizes de Importação</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Formato do Arquivo</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use os templates fornecidos para garantir compatibilidade</li>
                <li>• Primeira linha deve conter os cabeçalhos das colunas</li>
                <li>• Dados em formato UTF-8 para caracteres especiais</li>
                <li>• Máximo de 10.000 registros por arquivo</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Validações Aplicadas</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Códigos únicos (SKU, CNPJ, etc.)</li>
                <li>• Formatos obrigatórios (e-mail, telefone, CEP)</li>
                <li>• Integridade referencial (fornecedores, categorias)</li>
                <li>• Limites de valores (estoque, preços, capacidades)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderExportTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Exportar Dados</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="exportType">Tipo de Dados</Label>
            <Select value={selectedDataType} onValueChange={setSelectedDataType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skus">SKUs / Produtos</SelectItem>
                <SelectItem value="suppliers">Fornecedores</SelectItem>
                <SelectItem value="locations">Localizações</SelectItem>
                <SelectItem value="categories">Categorias</SelectItem>
                <SelectItem value="movements">Movimentações</SelectItem>
                <SelectItem value="analytics">Relatório Analítico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="format">Formato de Saída</Label>
            <Select defaultValue="xlsx">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                <SelectItem value="csv">CSV (.csv)</SelectItem>
                <SelectItem value="json">JSON (.json)</SelectItem>
                <SelectItem value="pdf">PDF Report (.pdf)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="filters">Filtros (Opcional)</Label>
            <Textarea
              id="filters"
              placeholder="Ex: categoria=ferramentas, status=ativo, data_criacao>2024-01-01"
              rows={3}
            />
          </div>

          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Gerar Exportação
          </Button>
        </CardContent>
      </Card>

      {/* Export Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Templates Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-center space-x-3">
                <Table className="h-6 w-6 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">Template SKUs</div>
                  <div className="text-sm text-gray-500">Formato padrão para produtos</div>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Template Fornecedores</div>
                  <div className="text-sm text-gray-500">Dados fiscais e contato</div>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-center space-x-3">
                <Database className="h-6 w-6 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium">Template Localizações</div>
                  <div className="text-sm text-gray-500">Endereçamento do almoxarifado</div>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-center space-x-3">
                <Zap className="h-6 w-6 text-orange-600" />
                <div className="text-left">
                  <div className="font-medium">Template Movimentações</div>
                  <div className="text-sm text-gray-500">Entradas e saídas</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderHistoryTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <span>Histórico de Operações</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {importJobs.map((job) => {
            const StatusIcon = getStatusIcon(job.status);
            
            return (
              <div key={job.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className={`h-5 w-5 ${getStatusColor(job.status)}`} />
                    <div>
                      <h4 className="font-medium">{job.filename}</h4>
                      <p className="text-sm text-gray-600">{job.type}</p>
                    </div>
                  </div>
                  
                  <Badge className={getStatusColor(job.status)}>
                    {job.status === 'completed' ? 'Concluído' :
                     job.status === 'processing' ? 'Processando' :
                     job.status === 'error' ? 'Erro' : 'Pendente'}
                  </Badge>
                </div>

                {job.status === 'processing' && (
                  <div className="mb-3">
                    <Progress value={job.progress} className="h-2" />
                    <p className="text-sm text-gray-600 mt-1">
                      {job.progress}% - {job.recordsProcessed} de {job.recordsTotal} registros
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <div className="font-medium">{job.recordsTotal}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Processados:</span>
                    <div className="font-medium">{job.recordsProcessed}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Sucessos:</span>
                    <div className="font-medium text-green-600">{job.recordsSuccess}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Erros:</span>
                    <div className="font-medium text-red-600">{job.recordsError}</div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Iniciado: {job.startTime.toLocaleString()}
                  {job.endTime && ` • Finalizado: ${job.endTime.toLocaleString()}`}
                </div>

                {job.errors.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg">
                    <h5 className="text-sm font-medium text-red-800 mb-2">Erros Encontrados:</h5>
                    <ul className="text-xs text-red-700 space-y-1">
                      {job.errors.slice(0, 3).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {job.errors.length > 3 && (
                        <li>• ... e mais {job.errors.length - 3} erros</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Importação e Exportação</h2>
          <p className="text-gray-600">Transferência de dados em massa</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('import')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'import'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Upload className="h-4 w-4 mr-2 inline" />
            Importar
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'export'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Download className="h-4 w-4 mr-2 inline" />
            Exportar
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <History className="h-4 w-4 mr-2 inline" />
            Histórico
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'import' && renderImportTab()}
      {activeTab === 'export' && renderExportTab()}
      {activeTab === 'history' && renderHistoryTab()}
    </div>
  );
};

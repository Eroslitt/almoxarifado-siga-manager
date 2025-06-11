
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { dataImportService } from '@/services/dataImportService';
import { useToast } from '@/hooks/use-toast';

export const DataImportExport = () => {
  const [importType, setImportType] = useState<'skus' | 'suppliers' | 'locations'>('skus');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      const text = await importFile.text();
      const data = dataImportService.parseCSV(text);
      
      setImportProgress(30);

      let result;
      switch (importType) {
        case 'skus':
          result = await dataImportService.importSKUs(data);
          break;
        case 'suppliers':
          result = await dataImportService.importSuppliers(data);
          break;
        case 'locations':
          result = await dataImportService.importLocations(data);
          break;
      }

      setImportProgress(100);
      setImportResult(result);

      toast({
        title: "Importação concluída",
        description: `${result.imported} registros importados com sucesso`,
      });
    } catch (error) {
      console.error('Erro na importação:', error);
      toast({
        title: "Erro na importação",
        description: "Erro ao processar arquivo",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      let data;
      const options = { format: exportFormat, includeInactive: false };

      switch (importType) {
        case 'skus':
          data = await dataImportService.exportSKUs(options);
          break;
        case 'suppliers':
          data = await dataImportService.exportSuppliers(options);
          break;
        case 'locations':
          data = await dataImportService.exportLocations(options);
          break;
      }

      const blob = new Blob([data], { type: exportFormat === 'csv' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${importType}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Exportação concluída",
        description: `Dados de ${importType} exportados com sucesso`,
      });
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: "Erro na exportação",
        description: "Erro ao exportar dados",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = () => {
    let template;
    switch (importType) {
      case 'skus':
        template = dataImportService.generateSKUTemplate();
        break;
      case 'suppliers':
        template = dataImportService.generateSupplierTemplate();
        break;
      case 'locations':
        template = dataImportService.generateLocationTemplate();
        break;
    }

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${importType}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Importar Dados</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="import-type">Tipo de Dados</Label>
              <Select value={importType} onValueChange={(value: any) => setImportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skus">SKUs</SelectItem>
                  <SelectItem value="suppliers">Fornecedores</SelectItem>
                  <SelectItem value="locations">Endereços</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="import-file">Arquivo CSV</Label>
              <Input
                id="import-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
            </div>

            {isImporting && (
              <div>
                <Label>Progresso da Importação</Label>
                <Progress value={importProgress} className="mt-2" />
              </div>
            )}

            <div className="flex space-x-2">
              <Button 
                onClick={handleImport} 
                disabled={!importFile || isImporting}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
              <Button variant="outline" onClick={downloadTemplate}>
                <FileText className="h-4 w-4 mr-2" />
                Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Exportar Dados</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="export-type">Tipo de Dados</Label>
              <Select value={importType} onValueChange={(value: any) => setImportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skus">SKUs</SelectItem>
                  <SelectItem value="suppliers">Fornecedores</SelectItem>
                  <SelectItem value="locations">Endereços</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="export-format">Formato</Label>
              <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleExport} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Exportar {exportFormat.toUpperCase()}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Import Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Resultado da Importação</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {importResult.imported}
                </div>
                <div className="text-sm text-gray-600">Importados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {importResult.failed}
                </div>
                <div className="text-sm text-gray-600">Falharam</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {importResult.warnings.length}
                </div>
                <div className="text-sm text-gray-600">Avisos</div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Erros encontrados:</strong>
                  <ul className="mt-2 space-y-1">
                    {importResult.errors.slice(0, 5).map((error: any, index: number) => (
                      <li key={index} className="text-sm">
                        Linha {error.row}: {error.errors.join(', ')}
                      </li>
                    ))}
                    {importResult.errors.length > 5 && (
                      <li className="text-sm font-medium">
                        ... e mais {importResult.errors.length - 5} erros
                      </li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center">
              <Badge variant={importResult.success ? "default" : "destructive"}>
                {importResult.success ? "Importação Bem-sucedida" : "Importação com Erros"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

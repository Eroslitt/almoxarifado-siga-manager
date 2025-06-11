
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { kittingApi } from '@/services/kittingApi';
import { QRCodeReader } from '@/components/tools/QRCodeReader';
import { WorkTemplateWithItems, KittingSuggestion } from '@/types/kitting';
import { 
  ClipboardList, 
  QrCode, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Package,
  Loader2,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface KittingCheckoutProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export const KittingCheckout = ({ onComplete, onCancel }: KittingCheckoutProps) => {
  const [step, setStep] = useState<'template' | 'checklist' | 'scanning' | 'complete'>('template');
  const [templates, setTemplates] = useState<WorkTemplateWithItems[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [workType, setWorkType] = useState('');
  const [suggestions, setSuggestions] = useState<KittingSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [currentBatchId, setCurrentBatchId] = useState<string>('');
  const [scanningQueue, setScanningQueue] = useState<string[]>([]);
  const [scannedItems, setScannedItems] = useState<Set<string>>(new Set());
  const [currentTool, setCurrentTool] = useState<string>('');
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await kittingApi.getTemplates({ active: true });
      setTemplates(data);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const handleTemplateSelect = async () => {
    if (!selectedTemplate && !workType) {
      toast({
        title: "Erro",
        description: "Selecione um template ou informe o tipo de trabalho",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Gerar sugestões
      const suggestions = await kittingApi.generateSuggestions(
        workType || selectedTemplate,
        user?.id || '',
        selectedTemplate || undefined
      );
      
      setSuggestions(suggestions);
      setStep('checklist');
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar sugestões",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartScanning = async () => {
    if (selectedSuggestions.size === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma ferramenta",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Iniciar batch checkout
      const result = await kittingApi.startBatchCheckout({
        templateId: selectedTemplate || undefined,
        workType: workType || selectedTemplate
      }, user?.id || '');

      if (!result.success || !result.batchId) {
        throw new Error(result.message);
      }

      setCurrentBatchId(result.batchId);
      
      // Adicionar itens selecionados ao batch
      const selectedTools = suggestions.filter(s => selectedSuggestions.has(s.toolId));
      
      for (const suggestion of selectedTools) {
        await kittingApi.addBatchItem(result.batchId, suggestion.toolId, suggestion.priority);
      }

      // Preparar fila de scanning
      const queue = selectedTools.map(s => s.toolId);
      setScanningQueue(queue);
      setCurrentTool(queue[0] || '');
      setStep('scanning');
      setShowScanner(true);
    } catch (error) {
      console.error('Erro ao iniciar scanning:', error);
      toast({
        title: "Erro",
        description: "Erro ao iniciar processo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQRCodeScanned = async (decodedText: string) => {
    if (!currentBatchId || !currentTool) return;

    setShowScanner(false);
    setLoading(true);

    try {
      // Verificar se é a ferramenta esperada
      let toolId: string;
      try {
        const qrData = JSON.parse(decodedText);
        toolId = qrData.toolId;
      } catch {
        toolId = decodedText;
      }

      if (toolId !== currentTool) {
        toast({
          title: "Ferramenta Incorreta",
          description: `Esperado: ${getCurrentToolName()}. Escaneado: ${toolId}`,
          variant: "destructive",
        });
        setShowScanner(true);
        return;
      }

      // Processar checkout do item
      const result = await kittingApi.processBatchItem(currentBatchId, toolId);
      
      if (result.success) {
        setScannedItems(prev => new Set([...prev, toolId]));
        
        // Próximo item na fila
        const nextQueue = scanningQueue.filter(id => id !== toolId);
        setScanningQueue(nextQueue);
        
        if (nextQueue.length > 0) {
          setCurrentTool(nextQueue[0]);
          toast({
            title: "✅ Item Processado",
            description: `${getCurrentToolName()} - Próximo: ${getToolName(nextQueue[0])}`,
          });
          setShowScanner(true);
        } else {
          // Finalizar processo
          await kittingApi.completeBatchCheckout(currentBatchId);
          setStep('complete');
          toast({
            title: "🎉 Checkout Completo",
            description: "Todas as ferramentas foram retiradas com sucesso!",
          });
        }
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        });
        setShowScanner(true);
      }
    } catch (error) {
      console.error('Erro ao processar QR:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar ferramenta",
        variant: "destructive",
      });
      setShowScanner(true);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentToolName = () => {
    const suggestion = suggestions.find(s => s.toolId === currentTool);
    return suggestion?.toolName || currentTool;
  };

  const getToolName = (toolId: string) => {
    const suggestion = suggestions.find(s => s.toolId === toolId);
    return suggestion?.toolName || toolId;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'essential': return 'bg-red-100 text-red-800';
      case 'recommended': return 'bg-blue-100 text-blue-800';
      case 'optional': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleSuggestion = (toolId: string) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(toolId)) {
      newSelected.delete(toolId);
    } else {
      newSelected.add(toolId);
    }
    setSelectedSuggestions(newSelected);
  };

  const resetProcess = () => {
    setStep('template');
    setSelectedTemplate('');
    setWorkType('');
    setSuggestions([]);
    setSelectedSuggestions(new Set());
    setCurrentBatchId('');
    setScanningQueue([]);
    setScannedItems(new Set());
    setCurrentTool('');
    setShowScanner(false);
    setLoading(false);
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acesso Negado</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Você precisa estar logado para usar o Kitting Dinâmico.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progresso do Kitting</span>
                <span>
                  {step === 'template' ? '1' : 
                   step === 'checklist' ? '2' : 
                   step === 'scanning' ? '3' : '4'} de 4
                </span>
              </div>
              <Progress 
                value={
                  step === 'template' ? 25 : 
                  step === 'checklist' ? 50 : 
                  step === 'scanning' ? 75 + (scannedItems.size / (scannedItems.size + scanningQueue.length)) * 25 : 100
                } 
                className="h-2"
              />
            </div>
            <Button variant="outline" size="sm" onClick={resetProcess}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Recomeçar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scanner QR Code */}
      {showScanner && (
        <QRCodeReader
          isActive={showScanner}
          onScanSuccess={handleQRCodeScanned}
          onScanError={(error) => console.warn('QR Error:', error)}
          onCancel={() => setShowScanner(false)}
        />
      )}

      {/* Step 1: Seleção de Template */}
      {step === 'template' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              <span>Tipo de Trabalho</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Selecione um template pré-definido:
              </label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex flex-col">
                        <span>{template.name}</span>
                        <span className="text-xs text-gray-500">
                          {template.items.length} itens • {template.estimated_duration_minutes} min
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-center text-gray-500">
              <span>— OU —</span>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Descreva o tipo de trabalho:
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ex: Manutenção de motor, Instalação elétrica..."
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleTemplateSelect} 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading || (!selectedTemplate && !workType)}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              Gerar Sugestões
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Checklist de Sugestões */}
      {step === 'checklist' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-green-600" />
              <span>Kit Sugerido</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Para este tipo de trabalho, sugerimos as seguintes ferramentas:
            </p>

            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div key={suggestion.toolId} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedSuggestions.has(suggestion.toolId)}
                      onCheckedChange={() => toggleSuggestion(suggestion.toolId)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{suggestion.toolName}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(suggestion.priority)}>
                            {suggestion.priority === 'essential' ? 'Essencial' : 
                             suggestion.priority === 'recommended' ? 'Recomendada' : 'Opcional'}
                          </Badge>
                          {!suggestion.available && (
                            <Badge className="bg-red-100 text-red-800">
                              Indisponível
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mt-1">
                        <p>📍 {suggestion.location}</p>
                        <p>🤖 {suggestion.reason} (Confiança: {(suggestion.confidence * 100).toFixed(0)}%)</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ℹ️ <strong>{selectedSuggestions.size}</strong> ferramentas selecionadas.
                Você pode desmarcar itens opcionais se não precisar deles.
              </p>
            </div>

            <Button 
              onClick={handleStartScanning} 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading || selectedSuggestions.size === 0}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <QrCode className="h-4 w-4 mr-2" />
              )}
              Iniciar Leitura dos QR Codes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Scanning Process */}
      {step === 'scanning' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5 text-orange-600" />
              <span>Escaneando Ferramentas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {scannedItems.size} de {scannedItems.size + scanningQueue.length}
              </div>
              <p className="text-gray-600">
                Ferramentas processadas
              </p>
            </div>

            {currentTool && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <h3 className="font-semibold text-lg mb-2">Próxima Ferramenta:</h3>
                <p className="text-orange-800 font-medium">{getCurrentToolName()}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Escaneie o QR Code desta ferramenta
                </p>
              </div>
            )}

            <div className="space-y-2">
              {suggestions.filter(s => selectedSuggestions.has(s.toolId)).map((suggestion) => (
                <div key={suggestion.toolId} className="flex items-center justify-between p-3 border rounded">
                  <span>{suggestion.toolName}</span>
                  {scannedItems.has(suggestion.toolId) ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : suggestion.toolId === currentTool ? (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <span className="text-sm text-orange-600">Aguardando...</span>
                    </div>
                  ) : (
                    <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                  )}
                </div>
              ))}
            </div>

            {!showScanner && currentTool && (
              <Button 
                onClick={() => setShowScanner(true)} 
                className="w-full"
                disabled={loading}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Continuar Escaneamento
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Complete */}
      {step === 'complete' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Kitting Completo!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="text-6xl mb-4">🎉</div>
            
            <h3 className="text-xl font-semibold text-green-600">
              Checkout Realizado com Sucesso!
            </h3>
            
            <p className="text-gray-600">
              Todas as <strong>{scannedItems.size} ferramentas</strong> foram retiradas e estão prontas para uso.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                💡 <strong>Dica:</strong> Lembre-se de devolver as ferramentas após o uso para que outros colaboradores possam utilizá-las.
              </p>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={resetProcess} className="flex-1">
                Novo Kitting
              </Button>
              <Button onClick={onComplete} className="flex-1 bg-green-600 hover:bg-green-700">
                Finalizar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

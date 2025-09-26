
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { blueprintToolsService } from '@/services/blueprintToolsService';
import { BlueprintOperationResponse } from '@/types/sgf-blueprint';
import { QRCodeReader } from './QRCodeReader';
import { BlueprintConfirmation } from './BlueprintConfirmation';
import { 
  QrCode, 
  Camera, 
  Loader2,
  User,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

export const BlueprintQRScanner = () => {
  const [scannedToolId, setScannedToolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [lastOperation, setLastOperation] = useState<BlueprintOperationResponse | null>(null);
  const [showConditionForm, setShowConditionForm] = useState(false);
  const [conditionNote, setConditionNote] = useState('');
  const [showPerformanceStats, setShowPerformanceStats] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleQRCodeScanned = async (decodedText: string) => {
    setShowScanner(false);
    setLoading(true);

    try {
      console.log('📱 QR Code escaneado (Blueprint v2.0):', decodedText);
      
      let toolId: string;
      try {
        const qrData = JSON.parse(decodedText);
        toolId = qrData.toolId || qrData.id;
      } catch {
        toolId = decodedText;
      }

      setScannedToolId(toolId);

      const result = await blueprintToolsService.processarOperacaoAutomatica({
        colaborador_id: user!.id,
        ferramenta_id: toolId
      });

      setLastOperation(result);

      if (result.success) {
        if (result.data?.tipo_operacao === 'RETIRADA') {
          setTimeout(resetForm, 3000);
        }
      }

    } catch (error) {
      console.error('Erro ao processar QR:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar código QR",
        variant: "destructive",
      });
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const handleConditionReport = async () => {
    if (!conditionNote.trim() || !scannedToolId) return;

    setLoading(true);

    try {
      const result = await blueprintToolsService.processarDevolucao({
        colaborador_id: user!.id,
        ferramenta_id: scannedToolId
      }, conditionNote);

      if (result.success) {
        toast({
          title: result.message,
          description: "Ferramenta será encaminhada para manutenção",
        });
      }

      resetForm();
    } catch (error) {
      console.error('Erro ao reportar condição:', error);
      toast({
        title: "Erro",
        description: "Erro ao reportar condição da ferramenta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScanError = (errorMessage: string) => {
    if (!errorMessage.includes('No QR code found')) {
      toast({
        title: "Erro no Scanner",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const startScanning = () => {
    setShowScanner(true);
    setScannedToolId(null);
    setLastOperation(null);
    setShowConditionForm(false);
    setConditionNote('');
  };

  const resetForm = () => {
    setScannedToolId(null);
    setLastOperation(null);
    setShowConditionForm(false);
    setConditionNote('');
    setShowScanner(false);
  };

  const handleSimulateOperation = () => {
    handleQRCodeScanned('FRM-001274');
  };

  const handleReportIssue = () => {
    setShowConditionForm(true);
  };

  const togglePerformanceStats = () => {
    setShowPerformanceStats(!showPerformanceStats);
  };

  if (!user) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Acesso Negado</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Você precisa estar logado para usar o SGF-QR.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 max-w-4xl mx-auto">
      {/* Header do Sistema - Responsivo */}
      <Card className="border-blue-500 bg-blue-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex flex-col lg:flex-row lg:items-center lg:justify-between text-blue-800 space-y-2 lg:space-y-0">
            <div className="flex items-center space-x-2">
              <QrCode className="h-5 w-5 lg:h-6 lg:w-6" />
              <span className="text-lg lg:text-xl">SGF-QR v2.0</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={togglePerformanceStats}
              className="text-blue-700 border-blue-300 self-start lg:self-auto"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Performance</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-blue-900 truncate">{user.name}</h3>
                <p className="text-sm text-blue-700 truncate">ID: {user.id} • {user.department}</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 self-start sm:self-auto">Conectado</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Performance - Mobile Friendly */}
      {showPerformanceStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              <span>Estatísticas de Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(() => {
                const stats = blueprintToolsService.getPerformanceStats();
                return (
                  <>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.averageResponseTime.toFixed(0)}ms
                      </div>
                      <div className="text-sm text-gray-600">Tempo Médio</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.successRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Taxa de Sucesso</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">
                        {stats.totalOperations}
                      </div>
                      <div className="text-sm text-gray-600">Total de Operações</div>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scanner QR Code - Full Screen Mobile */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-background md:relative md:inset-auto md:z-auto">
          <QRCodeReader
            isActive={showScanner}
            onScanSuccess={handleQRCodeScanned}
            onScanError={handleScanError}
            onCancel={() => setShowScanner(false)}
          />
        </div>
      )}

      {/* Interface Principal - Ultra Simples e Responsiva */}
      {!showScanner && !lastOperation && !showConditionForm && (
        <Card>
          <CardContent className="p-8 lg:p-12 text-center">
            <Camera className="h-16 w-16 lg:h-24 lg:w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-xl lg:text-2xl font-bold mb-4">Escaneie o QR Code da Ferramenta</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              O sistema detectará automaticamente se é uma retirada ou devolução
            </p>
            
            <div className="space-y-4 max-w-sm mx-auto">
              <Button 
                onClick={startScanning} 
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 py-4 text-lg min-h-[56px]"
                disabled={loading}
              >
                <Camera className="h-5 w-5 mr-2" />
                Ativar Scanner
              </Button>
              
              <Button 
                onClick={handleSimulateOperation}
                variant="outline"
                className="w-full text-gray-600 min-h-[44px]"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Simular Operação (Demo)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmação de Operação - Responsiva */}
      {lastOperation && !showConditionForm && (
        <BlueprintConfirmation
          operation={lastOperation}
          onNewScan={resetForm}
          onReportIssue={lastOperation.data?.tipo_operacao === 'DEVOLUÇÃO' ? handleReportIssue : undefined}
          loading={loading}
        />
      )}

      {/* Formulário de Condição - Mobile Friendly */}
      {showConditionForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-lg">Reportar Avaria ou Problema</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lastOperation?.data && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold">{lastOperation.data.ferramenta_nome}</h3>
                  <p className="text-gray-600">Responsável: {lastOperation.data.colaborador_nome}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Descreva o problema encontrado:
                </label>
                <Textarea
                  placeholder="Ex: Cabo com mau contato, broca gasta, parafuso solto, ruído anormal..."
                  value={conditionNote}
                  onChange={(e) => setConditionNote(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleConditionReport} 
                  className="bg-red-600 hover:bg-red-700 flex-1 min-h-[44px]"
                  disabled={!conditionNote.trim() || loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  )}
                  <span className="hidden sm:inline">Confirmar - Enviar para Manutenção</span>
                  <span className="sm:hidden">Enviar para Manutenção</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowConditionForm(false)}
                  disabled={loading}
                  className="sm:w-auto min-h-[44px]"
                >
                  Voltar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State - Responsivo */}
      {loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Processando operação em tempo real...</p>
            <p className="text-sm text-gray-500 mt-1">Objetivo: resposta em &lt; 500ms</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


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
import { 
  QrCode, 
  Camera, 
  CheckCircle,
  Loader2,
  User,
  AlertTriangle,
  Clock
} from 'lucide-react';

// SGF-QR v2.0 - Interface do Colaborador Conforme Blueprint
export const BlueprintQRScanner = () => {
  const [scannedToolId, setScannedToolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [lastOperation, setLastOperation] = useState<BlueprintOperationResponse | null>(null);
  const [showConditionForm, setShowConditionForm] = useState(false);
  const [conditionNote, setConditionNote] = useState('');
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleQRCodeScanned = async (decodedText: string) => {
    setShowScanner(false);
    setLoading(true);

    try {
      console.log('📱 QR Code escaneado (Blueprint):', decodedText);
      
      // Extrair ID da ferramenta do QR Code
      let toolId: string;
      try {
        const qrData = JSON.parse(decodedText);
        toolId = qrData.toolId || qrData.id;
      } catch {
        // QR Code simples contendo apenas o ID
        toolId = decodedText;
      }

      setScannedToolId(toolId);

      // Processar operação automática conforme blueprint
      const result = await blueprintToolsService.processarOperacaoAutomatica({
        colaborador_id: user!.id,
        ferramenta_id: toolId
      });

      if (result.success) {
        setLastOperation(result);
        
        // Mostrar notificação de sucesso
        toast({
          title: result.message,
          description: result.data ? 
            `${result.data.ferramenta_nome} - ${result.data.colaborador_nome}` :
            'Operação realizada com sucesso',
        });

        // Se foi uma devolução, perguntar sobre condição
        if (result.data?.tipo_operacao === 'DEVOLUÇÃO') {
          setShowConditionForm(true);
        } else {
          // Reset após 3 segundos para nova operação
          setTimeout(resetForm, 3000);
        }
      } else {
        toast({
          title: "Operação não permitida",
          description: result.message,
          variant: "destructive",
        });
        resetForm();
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
      // Processar devolução com observação de avaria
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
    // Simular scan para demonstração
    handleQRCodeScanned('FRM-001274');
  };

  if (!user) {
    return (
      <Card>
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
    <div className="space-y-6">
      {/* Header do Sistema */}
      <Card className="border-blue-500 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <QrCode className="h-6 w-6" />
            <span>SGF-QR v2.0 - Sistema de Controle de Ativos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">{user.name}</h3>
                <p className="text-sm text-blue-700">ID: {user.id} • {user.department}</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">Conectado</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Scanner QR Code */}
      {showScanner && (
        <QRCodeReader
          isActive={showScanner}
          onScanSuccess={handleQRCodeScanned}
          onScanError={handleScanError}
          onCancel={() => setShowScanner(false)}
        />
      )}

      {/* Interface Principal - Ultra Simples */}
      {!showScanner && !lastOperation && !showConditionForm && (
        <Card>
          <CardContent className="p-12 text-center">
            <Camera className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Escaneie o QR Code da Ferramenta</h2>
            <p className="text-gray-600 mb-8">
              O sistema detectará automaticamente se é uma retirada ou devolução
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={startScanning} 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg"
                disabled={loading}
              >
                <Camera className="h-5 w-5 mr-2" />
                Ativar Scanner
              </Button>
              
              <div>
                <Button 
                  onClick={handleSimulateOperation}
                  variant="outline"
                  className="text-gray-600"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Simular Operação (Demo)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmação de Operação */}
      {lastOperation && !showConditionForm && (
        <Card className="border-green-500 bg-green-50">
          <CardHeader className="bg-green-100 border-b border-green-200">
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-6 w-6" />
              <span>{lastOperation.message}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {lastOperation.data && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {lastOperation.data.ferramenta_nome}
                  </h3>
                  <div className="mt-2 space-y-1 text-gray-700">
                    <p><strong>Responsável:</strong> {lastOperation.data.colaborador_nome}</p>
                    <p><strong>Data/Hora:</strong> {lastOperation.data.timestamp}</p>
                    <p><strong>Operação:</strong> 
                      <Badge className={
                        lastOperation.data.tipo_operacao === 'RETIRADA' 
                          ? 'bg-blue-100 text-blue-800 ml-2' 
                          : 'bg-green-100 text-green-800 ml-2'
                      }>
                        {lastOperation.data.tipo_operacao}
                      </Badge>
                    </p>
                  </div>
                </div>

                {lastOperation.data.tipo_operacao === 'DEVOLUÇÃO' && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center text-yellow-800">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      A ferramenta está em perfeitas condições?
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button 
                        onClick={resetForm}
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        ✔️ Sim, perfeitas condições
                      </Button>
                      <Button 
                        onClick={() => setShowConditionForm(true)}
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        ⚠️ Reportar problema/avaria
                      </Button>
                    </div>
                  </div>
                )}

                {lastOperation.data.tipo_operacao === 'RETIRADA' && (
                  <div className="text-center">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-600">Nova operação em 3 segundos...</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Formulário de Condição */}
      {showConditionForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Reportar Avaria ou Problema</span>
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
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={handleConditionReport} 
                  className="bg-red-600 hover:bg-red-700 flex-1"
                  disabled={!conditionNote.trim() || loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  )}
                  Confirmar - Enviar para Manutenção
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowConditionForm(false)}
                  disabled={loading}
                >
                  Voltar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Processando operação...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

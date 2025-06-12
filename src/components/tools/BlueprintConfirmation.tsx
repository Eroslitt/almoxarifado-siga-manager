
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BlueprintOperationResponse } from '@/types/sgf-blueprint';
import { 
  CheckCircle,
  Clock,
  User,
  Wrench,
  AlertTriangle
} from 'lucide-react';

interface BlueprintConfirmationProps {
  operation: BlueprintOperationResponse;
  onNewScan: () => void;
  onReportIssue?: () => void;
  loading?: boolean;
}

export const BlueprintConfirmation = ({ 
  operation, 
  onNewScan, 
  onReportIssue,
  loading = false 
}: BlueprintConfirmationProps) => {
  
  const isReturn = operation.data?.tipo_operacao === 'DEVOLUÇÃO';
  const isCheckout = operation.data?.tipo_operacao === 'RETIRADA';

  return (
    <Card className={`border-2 ${operation.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
      <CardHeader className={`${operation.success ? 'bg-green-100 border-b border-green-200' : 'bg-red-100 border-b border-red-200'}`}>
        <CardTitle className={`flex items-center space-x-2 ${operation.success ? 'text-green-800' : 'text-red-800'}`}>
          <CheckCircle className="h-6 w-6" />
          <span>{operation.message}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {operation.success && operation.data && (
          <div className="space-y-6">
            {/* Informações da Operação */}
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-3">
                <Wrench className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-lg text-gray-900">
                  {operation.data.ferramenta_nome}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-700">
                    <strong>Responsável:</strong> {operation.data.colaborador_nome}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">
                    <strong>Data/Hora:</strong> {operation.data.timestamp}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 md:col-span-2">
                  <span className="text-gray-700"><strong>Operação:</strong></span>
                  <Badge className={
                    isCheckout 
                      ? 'bg-blue-100 text-blue-800 border-blue-300' 
                      : 'bg-green-100 text-green-800 border-green-300'
                  }>
                    {operation.data.tipo_operacao}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Ações Específicas por Tipo de Operação */}
            {isReturn && onReportIssue && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center text-yellow-800">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  A ferramenta está em perfeitas condições?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button 
                    onClick={onNewScan}
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50"
                    disabled={loading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    ✔️ Sim, perfeitas condições
                  </Button>
                  <Button 
                    onClick={onReportIssue}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    disabled={loading}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    ⚠️ Reportar problema/avaria
                  </Button>
                </div>
              </div>
            )}

            {isCheckout && (
              <div className="text-center">
                <div className="flex flex-col items-center space-y-2">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <p className="text-gray-600">Ferramenta retirada com sucesso!</p>
                  <p className="text-sm text-gray-500">Nova operação em 3 segundos...</p>
                </div>
              </div>
            )}

            {/* Botão para Nova Operação */}
            {(!isReturn || !onReportIssue) && (
              <div className="text-center">
                <Button 
                  onClick={onNewScan}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  Nova Operação
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Erro */}
        {!operation.success && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <p className="text-red-800 font-medium">{operation.message}</p>
            </div>
            <div className="text-center">
              <Button 
                onClick={onNewScan}
                variant="outline"
                disabled={loading}
              >
                Tentar Novamente
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

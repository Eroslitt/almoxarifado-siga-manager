
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { toolsApi } from '@/services/toolsApi';
import { Tool } from '@/types/database';
import { 
  QrCode, 
  Camera, 
  LogIn, 
  LogOut, 
  User, 
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';

export const QRScanner = () => {
  const [scanMode, setScanMode] = useState<'checkout' | 'checkin' | null>(null);
  const [scannedTool, setScannedTool] = useState<Tool | null>(null);
  const [conditionNote, setConditionNote] = useState('');
  const [showConditionForm, setShowConditionForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Mock data para demonstração - será substituído por QR real
  const mockTool: Tool = {
    id: 'FER-08172',
    name: 'Furadeira de Impacto Makita',
    category: 'Elétrica',
    status: 'available',
    location: 'A-01-05',
    current_user_id: null,
    qr_code: 'FER-08172-QR',
    registration_date: '2024-01-15',
    last_maintenance: '2024-05-10',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  };

  const handleScanSimulation = () => {
    // Simula a leitura de um QR Code
    setScannedTool(mockTool);
  };

  const handleCheckout = async () => {
    if (!user || !scannedTool) return;

    setLoading(true);
    
    try {
      const result = await toolsApi.checkoutTool({
        toolId: scannedTool.id,
        userId: user.id
      });

      if (result.success) {
        toast({
          title: "Sucesso",
          description: `✅ Retirada confirmada: ${scannedTool.name}`,
        });
        resetForm();
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
      toast({
        title: "Erro",
        description: "Erro interno do servidor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = (condition: 'perfect' | 'damaged') => {
    if (condition === 'damaged') {
      setShowConditionForm(true);
      return;
    }

    performCheckin(false);
  };

  const handleDamagedCheckin = () => {
    if (!conditionNote.trim()) {
      toast({
        title: "Erro",
        description: "Descreva o problema encontrado",
        variant: "destructive",
      });
      return;
    }

    performCheckin(true, conditionNote);
  };

  const performCheckin = async (hasIssue: boolean, note?: string) => {
    if (!user || !scannedTool) return;

    setLoading(true);

    try {
      const result = await toolsApi.checkinTool({
        toolId: scannedTool.id,
        userId: user.id,
        hasIssue,
        conditionNote: note
      });

      if (result.success) {
        toast({
          title: "Sucesso",
          description: result.message,
        });
        resetForm();
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro no checkin:', error);
      toast({
        title: "Erro",
        description: "Erro interno do servidor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setScanMode(null);
    setScannedTool(null);
    setConditionNote('');
    setShowConditionForm(false);
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acesso Negado</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Você precisa estar logado para usar o scanner.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Usuário Logado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>Usuário Logado</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-gray-600">ID: {user.id} • {user.department}</p>
                </div>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">Autenticado</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Seleção de Ação */}
      {!scanMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setScanMode('checkout')}>
            <CardContent className="p-6 text-center">
              <LogOut className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">RETIRAR</h3>
              <p className="text-gray-600">Fazer checkout de uma ferramenta</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setScanMode('checkin')}>
            <CardContent className="p-6 text-center">
              <LogIn className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">DEVOLVER</h3>
              <p className="text-gray-600">Fazer checkin de uma ferramenta</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scanner de QR Code */}
      {scanMode && !scannedTool && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5" />
              <span>Escaneie o QR Code da Ferramenta</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <Camera className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <p className="text-gray-600 mb-6">Aponte a câmera para o QR Code da ferramenta</p>
            
            <div className="space-y-4">
              <Button onClick={handleScanSimulation} className="bg-blue-600 hover:bg-blue-700">
                <QrCode className="h-4 w-4 mr-2" />
                Simular Scan (Demo)
              </Button>
              <div>
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado do Scan - Checkout */}
      {scanMode === 'checkout' && scannedTool && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LogOut className="h-5 w-5 text-blue-600" />
              <span>Confirmar Retirada</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg">{scannedTool.name}</h3>
                <p className="text-gray-600">ID: {scannedTool.id} • Categoria: {scannedTool.category}</p>
                <p className="text-gray-600">Localização: {scannedTool.location}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Usuário:</h4>
                <p>{user.name} (ID: {user.id})</p>
                <p className="text-sm text-gray-600">{user.department}</p>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={handleCheckout} 
                  className="bg-blue-600 hover:bg-blue-700 flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Confirmar Retirada
                </Button>
                <Button variant="outline" onClick={resetForm} disabled={loading}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado do Scan - Checkin */}
      {scanMode === 'checkin' && scannedTool && !showConditionForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LogIn className="h-5 w-5 text-green-600" />
              <span>Confirmar Devolução</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg">{scannedTool.name}</h3>
                <p className="text-gray-600">ID: {scannedTool.id}</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                  Como está a condição da ferramenta?
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button 
                    onClick={() => handleCheckin('perfect')} 
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50"
                    disabled={loading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    ✔️ Em perfeitas condições
                  </Button>
                  
                  <Button 
                    onClick={() => handleCheckin('damaged')} 
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    disabled={loading}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    ⚠️ Informar avaria/problema
                  </Button>
                </div>
              </div>

              <Button variant="outline" onClick={resetForm} className="w-full" disabled={loading}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário de Avaria */}
      {showConditionForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Reportar Avaria</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold">{scannedTool?.name}</h3>
                <p className="text-gray-600">ID: {scannedTool?.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Descreva o problema encontrado:
                </label>
                <Textarea
                  placeholder="Ex: Cabo com mau contato, broca gasta, parafuso solto..."
                  value={conditionNote}
                  onChange={(e) => setConditionNote(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={handleDamagedCheckin} 
                  className="bg-red-600 hover:bg-red-700 flex-1"
                  disabled={!conditionNote.trim() || loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  )}
                  Confirmar Devolução com Avaria
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
    </div>
  );
};

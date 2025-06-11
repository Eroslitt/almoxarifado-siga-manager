
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { QRCodeReader } from './QRCodeReader';
import { unifiedItemService, UnifiedItem } from '@/services/unifiedItemService';
import { 
  QrCode, 
  Camera, 
  LogIn, 
  LogOut, 
  User, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Package,
  Wrench,
  Info,
  MapPin,
  Weight,
  Ruler,
  Calendar
} from 'lucide-react';

export const EnhancedQRScanner = () => {
  const [scanMode, setScanMode] = useState<'checkout' | 'checkin' | null>(null);
  const [scannedItem, setScannedItem] = useState<UnifiedItem | null>(null);
  const [conditionNote, setConditionNote] = useState('');
  const [showConditionForm, setShowConditionForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleQRCodeScanned = async (decodedText: string) => {
    setShowScanner(false);
    setLoading(true);

    try {
      console.log('QR Code scanned:', decodedText);
      
      const item = await unifiedItemService.getItemByQR(decodedText);

      if (!item) {
        toast({
          title: "Item não encontrado",
          description: `Nenhum item encontrado com o código: ${decodedText}`,
          variant: "destructive",
        });
        return;
      }

      setScannedItem(item);

      toast({
        title: "QR Code lido com sucesso",
        description: `${item.type === 'TOOL' ? 'Ferramenta' : 'Produto'} encontrado: ${item.name}`,
      });

    } catch (error) {
      console.error('Erro ao processar QR code:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar QR code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScanError = (errorMessage: string) => {
    console.warn('QR Scan error:', errorMessage);
    if (!errorMessage.includes('No QR code found')) {
      toast({
        title: "Erro no Scanner",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const startScanning = (mode: 'checkout' | 'checkin') => {
    setScanMode(mode);
    setShowScanner(true);
    setScannedItem(null);
  };

  const handleCheckout = async () => {
    if (!user || !scannedItem) return;

    setLoading(true);
    
    try {
      const qrContent = unifiedItemService.generateQRCode(scannedItem);
      const result = await unifiedItemService.performCheckout(qrContent, user.id);

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

    performCheckin();
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

    performCheckin(conditionNote);
  };

  const performCheckin = async (condition?: string) => {
    if (!user || !scannedItem) return;

    setLoading(true);

    try {
      const qrContent = unifiedItemService.generateQRCode(scannedItem);
      const result = await unifiedItemService.performCheckin(qrContent, user.id, condition);

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
    setScannedItem(null);
    setConditionNote('');
    setShowConditionForm(false);
    setShowScanner(false);
  };

  const getItemIcon = (type: string) => {
    return type === 'TOOL' ? Wrench : Package;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in-use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            <span>Scanner Inteligente - Sistema Unificado</span>
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

      {/* Scanner QR Code Real */}
      {showScanner && (
        <QRCodeReader
          isActive={showScanner}
          onScanSuccess={handleQRCodeScanned}
          onScanError={handleScanError}
          onCancel={() => setShowScanner(false)}
        />
      )}

      {/* Seleção de Ação */}
      {!scanMode && !showScanner && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => startScanning('checkout')}>
            <CardContent className="p-6 text-center">
              <LogOut className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">RETIRAR</h3>
              <p className="text-gray-600">Baixa automática do estoque</p>
              <p className="text-sm text-gray-500 mt-2">Ferramentas e Produtos</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => startScanning('checkin')}>
            <CardContent className="p-6 text-center">
              <LogIn className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">DEVOLVER</h3>
              <p className="text-gray-600">Entrada automática no estoque</p>
              <p className="text-sm text-gray-500 mt-2">Ferramentas e Produtos</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scanner de QR Code */}
      {scanMode && !scannedItem && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5" />
              <span>Escaneie o QR Code</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <Camera className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <p className="text-gray-600 mb-6">Aponte a câmera para o QR Code da ferramenta ou produto</p>
            
            <div className="space-y-4">
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Especificações Técnicas Detectadas */}
      {scannedItem && !showConditionForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {React.createElement(getItemIcon(scannedItem.type), { className: "h-5 w-5" })}
              <span>Especificações Técnicas Detectadas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Item Basic Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="font-semibold text-lg">{scannedItem.name}</h3>
                  <Badge variant="outline">
                    {scannedItem.type === 'TOOL' ? 'Ferramenta' : 'Produto'}
                  </Badge>
                  <Badge className={getStatusColor(scannedItem.stock.status)}>
                    {scannedItem.stock.status === 'available' ? 'Disponível' : 
                     scannedItem.stock.status === 'in-use' ? 'Em Uso' : 
                     scannedItem.stock.status === 'maintenance' ? 'Manutenção' : 'Inativo'}
                  </Badge>
                </div>
                <p className="text-gray-600">Código: {scannedItem.code}</p>
                <p className="text-gray-600">Categoria: {scannedItem.category}</p>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scannedItem.stock.location && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>Localização: {scannedItem.stock.location}</span>
                  </div>
                )}
                
                {scannedItem.specifications.weight && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Weight className="h-4 w-4" />
                    <span>Peso: {scannedItem.specifications.weight}kg</span>
                  </div>
                )}
                
                {scannedItem.specifications.unit_of_measure && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Package className="h-4 w-4" />
                    <span>Unidade: {scannedItem.specifications.unit_of_measure}</span>
                  </div>
                )}
                
                {scannedItem.specifications.abc_classification && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Info className="h-4 w-4" />
                    <span>Classificação: {scannedItem.specifications.abc_classification}</span>
                  </div>
                )}
              </div>

              {/* Stock Information */}
              {scannedItem.type === 'SKU' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Informações de Estoque</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Atual:</span>
                      <p className="text-lg font-bold">{scannedItem.stock.current}</p>
                    </div>
                    <div>
                      <span className="font-medium">Mínimo:</span>
                      <p>{scannedItem.stock.min}</p>
                    </div>
                    <div>
                      <span className="font-medium">Máximo:</span>
                      <p>{scannedItem.stock.max}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Maintenance Info for Tools */}
              {scannedItem.type === 'TOOL' && scannedItem.maintenance && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Informações de Manutenção
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {scannedItem.maintenance.last_maintenance && (
                      <div>
                        <span className="font-medium">Última Manutenção:</span>
                        <p>{new Date(scannedItem.maintenance.last_maintenance).toLocaleDateString()}</p>
                      </div>
                    )}
                    {scannedItem.maintenance.next_maintenance && (
                      <div>
                        <span className="font-medium">Próxima Manutenção:</span>
                        <p>{new Date(scannedItem.maintenance.next_maintenance).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Technical Specs */}
              {scannedItem.specifications.technical_specs && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Especificações Técnicas</h4>
                  <p className="text-sm text-gray-700">{scannedItem.specifications.technical_specs}</p>
                </div>
              )}

              {/* Action Buttons */}
              {scanMode === 'checkout' && (
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
                    Confirmar Retirada (Baixa Automática)
                  </Button>
                  <Button variant="outline" onClick={resetForm} disabled={loading}>
                    Cancelar
                  </Button>
                </div>
              )}

              {scanMode === 'checkin' && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                      Como está a condição do item?
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
              )}
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
                <h3 className="font-semibold">{scannedItem?.name}</h3>
                <p className="text-gray-600">Código: {scannedItem?.code}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Descreva o problema encontrado:
                </label>
                <Textarea
                  placeholder="Ex: Cabo com mau contato, peça quebrada, desgaste excessivo..."
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

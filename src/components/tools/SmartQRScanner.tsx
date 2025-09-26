import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { enhancedUnifiedItemService, EnhancedUnifiedItem, AutoMovementResult } from '@/services/enhancedUnifiedItemService';
import { QRCodeReader } from './QRCodeReader';
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
  MapPin,
  Scale,
  Ruler,
  Building,
  Phone,
  Calendar,
  Activity,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';

export const SmartQRScanner = () => {
  const [scanMode, setScanMode] = useState<'checkout' | 'checkin' | null>(null);
  const [scannedItem, setScannedItem] = useState<EnhancedUnifiedItem | null>(null);
  const [conditionNote, setConditionNote] = useState('');
  const [showConditionForm, setShowConditionForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastMovement, setLastMovement] = useState<AutoMovementResult | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Sync offline queue when back online
      enhancedUnifiedItemService.syncOfflineQueue();
      toast({
        title: "Conectado",
        description: "Sincronizando dados offline...",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Modo Offline",
        description: "Operações serão sincronizadas quando reconectar",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const handleQRCodeScanned = async (decodedText: string) => {
    setShowScanner(false);
    setLoading(true);

    try {
      console.log('Smart QR Code scanned:', decodedText);
      
      const item = await enhancedUnifiedItemService.getEnhancedItemByQR(decodedText);

      if (!item) {
        toast({
          title: "Item não encontrado",
          description: `Código não reconhecido: ${decodedText}`,
          variant: "destructive",
        });
        return;
      }

      setScannedItem(item);

      toast({
        title: "✅ Item Identificado",
        description: `${item.type === 'TOOL' ? 'Ferramenta' : 'Produto'}: ${item.name}`,
      });

    } catch (error) {
      console.error('Erro ao processar Smart QR:', error);
      
      if (!isOnline) {
        toast({
          title: "Modo Offline",
          description: "Dados limitados disponíveis offline",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao processar código QR",
          variant: "destructive",
        });
      }
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

  const startScanning = (mode: 'checkout' | 'checkin') => {
    setScanMode(mode);
    setShowScanner(true);
    setScannedItem(null);
    setLastMovement(null);
  };

  const handleSmartCheckout = async () => {
    if (!user || !scannedItem) return;

    setLoading(true);
    
    try {
      const result = await enhancedUnifiedItemService.performSmartCheckout(
        enhancedUnifiedItemService.generateSmartQRCode(scannedItem),
        user.id
      );

      setLastMovement(result);

      if (result.success) {
        toast({
          title: "✅ Retirada Confirmada",
          description: result.message,
        });

        // Show stock alert if any
        if (result.stock_alert) {
          setTimeout(() => {
            toast({
              title: result.stock_alert!.level === 'critical' ? "🚨 ESTOQUE CRÍTICO" : "⚠️ Estoque Baixo",
              description: result.stock_alert!.message,
              variant: result.stock_alert!.level === 'critical' ? "destructive" : "default",
            });
          }, 1000);
        }

        resetForm();
      } else {
        toast({
          title: "Erro na Retirada",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro no smart checkout:', error);
      
      if (!isOnline) {
        // Add to offline queue
        enhancedUnifiedItemService.addToOfflineQueue({
          type: 'checkout',
          qrContent: enhancedUnifiedItemService.generateSmartQRCode(scannedItem),
          userId: user.id
        });
        
        toast({
          title: "Operação Salva",
          description: "Retirada será processada quando reconectar",
        });
        resetForm();
      } else {
        toast({
          title: "Erro",
          description: "Erro interno do servidor",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSmartCheckin = (condition: 'perfect' | 'damaged') => {
    if (condition === 'damaged') {
      setShowConditionForm(true);
      return;
    }
    performSmartCheckin(false);
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
    performSmartCheckin(true, conditionNote);
  };

  const performSmartCheckin = async (hasIssue: boolean, note?: string) => {
    if (!user || !scannedItem) return;

    setLoading(true);

    try {
      const result = await enhancedUnifiedItemService.performSmartCheckin(
        enhancedUnifiedItemService.generateSmartQRCode(scannedItem),
        user.id,
        note
      );

      setLastMovement(result);

      if (result.success) {
        toast({
          title: "✅ Devolução Confirmada",
          description: result.message,
        });
        resetForm();
      } else {
        toast({
          title: "Erro na Devolução",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro no smart checkin:', error);
      
      if (!isOnline) {
        // Add to offline queue
        enhancedUnifiedItemService.addToOfflineQueue({
          type: 'checkin',
          qrContent: enhancedUnifiedItemService.generateSmartQRCode(scannedItem),
          userId: user.id,
          condition: note
        });
        
        toast({
          title: "Operação Salva",
          description: "Devolução será processada quando reconectar",
        });
        resetForm();
      } else {
        toast({
          title: "Erro",
          description: "Erro interno do servidor",
          variant: "destructive",
        });
      }
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
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-purple-100 text-purple-800';
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
          <p>Você precisa estar logado para usar o Smart Scanner.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className={`border-l-4 ${isOnline ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            <div>
              <h3 className={`font-semibold ${isOnline ? 'text-green-800' : 'text-red-800'}`}>
                {isOnline ? 'Conectado - Modo Online' : 'Desconectado - Modo Offline'}
              </h3>
              <p className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 
                  'Todas as funcionalidades disponíveis' : 
                  'Funcionalidade limitada - operações serão sincronizadas'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Info */}
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
                  <h3 className="font-semibold">{user.full_name || user.email}</h3>
                  <p className="text-sm text-gray-600">ID: {user.id} • {user.company_name || 'SIGA'}</p>
                </div>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">Autenticado</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Scanner */}
      {showScanner && (
        <QRCodeReader
          isActive={showScanner}
          onScanSuccess={handleQRCodeScanned}
          onScanError={handleScanError}
          onCancel={() => setShowScanner(false)}
        />
      )}

      {/* Action Selection */}
      {!scanMode && !showScanner && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => startScanning('checkout')}>
            <CardContent className="p-6 text-center">
              <LogOut className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">RETIRAR</h3>
              <p className="text-gray-600">Smart checkout com validação automática</p>
              <div className="mt-2 text-sm text-blue-600">
                ✓ Detecção automática de tipo
                <br />
                ✓ Validação de disponibilidade
                <br />
                ✓ Alertas de estoque
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => startScanning('checkin')}>
            <CardContent className="p-6 text-center">
              <LogIn className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">DEVOLVER</h3>
              <p className="text-gray-600">Smart checkin com avaliação de condição</p>
              <div className="mt-2 text-sm text-green-600">
                ✓ Registro de condição
                <br />
                ✓ Atualização automática
                <br />
                ✓ Controle de manutenção
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scanning Mode */}
      {scanMode && !scannedItem && !showScanner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5" />
              <span>Smart QR Scanner - {scanMode === 'checkout' ? 'Retirada' : 'Devolução'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <Camera className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <p className="text-gray-600 mb-6">
              Aponte a câmera para o QR Code
              <br />
              <span className="text-sm text-blue-600">
                Detecta automaticamente ferramentas e produtos
              </span>
            </p>
            
            <div className="space-y-4">
              <Button onClick={() => setShowScanner(true)} className="bg-blue-600 hover:bg-blue-700">
                <Camera className="h-4 w-4 mr-2" />
                Ativar Câmera
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

      {/* Item Details - Checkout */}
      {scanMode === 'checkout' && scannedItem && !showScanner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LogOut className="h-5 w-5 text-blue-600" />
              <span>Confirmar Retirada</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Item Info */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-start space-x-4">
                  {React.createElement(getItemIcon(scannedItem.type), { 
                    className: "h-8 w-8 text-blue-600 mt-1" 
                  })}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{scannedItem.name}</h3>
                      <Badge className={getStatusColor(scannedItem.stock.status)}>
                        {scannedItem.stock.status === 'available' ? 'Disponível' :
                         scannedItem.stock.status === 'in-use' ? 'Em Uso' :
                         scannedItem.stock.status === 'maintenance' ? 'Manutenção' :
                         scannedItem.stock.status === 'inactive' ? 'Inativo' : 'Reservado'}
                      </Badge>
                      <Badge variant="outline">
                        {scannedItem.type === 'TOOL' ? 'Ferramenta' : 'Produto'}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-3">{scannedItem.description}</p>
                    <p className="text-sm text-gray-600">ID: {scannedItem.code} • Categoria: {scannedItem.category}</p>
                  </div>
                </div>
              </div>

              {/* Detailed Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scannedItem.stock.location && (
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Localização</span>
                    </div>
                    <p className="text-gray-900">{scannedItem.stock.location}</p>
                    {scannedItem.stock.zone && (
                      <p className="text-sm text-gray-600">Zona: {scannedItem.stock.zone}</p>
                    )}
                  </div>
                )}

                {scannedItem.specifications.weight && (
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                      <Scale className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Peso</span>
                    </div>
                    <p className="text-gray-900">{scannedItem.specifications.weight} kg</p>
                  </div>
                )}

                {scannedItem.specifications.dimensions && (
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                      <Ruler className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Dimensões</span>
                    </div>
                    <p className="text-gray-900">
                      {scannedItem.specifications.dimensions.height} x{' '}
                      {scannedItem.specifications.dimensions.width} x{' '}
                      {scannedItem.specifications.dimensions.depth} cm
                    </p>
                  </div>
                )}

                {scannedItem.supplier && (
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Fornecedor</span>
                    </div>
                    <p className="text-gray-900">{scannedItem.supplier.name}</p>
                    {scannedItem.supplier.contact && (
                      <p className="text-sm text-gray-600">{scannedItem.supplier.contact}</p>
                    )}
                  </div>
                )}

                {scannedItem.type === 'SKU' && scannedItem.stock.current !== undefined && (
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Estoque</span>
                    </div>
                    <p className="text-gray-900">
                      {scannedItem.stock.current} {scannedItem.specifications.unit_of_measure || 'un'}
                    </p>
                    {scannedItem.stock.min && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Atual</span>
                          <span>Min: {scannedItem.stock.min}</span>
                        </div>
                        <Progress 
                          value={(scannedItem.stock.current / (scannedItem.stock.max || scannedItem.stock.min * 2)) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                )}

                {scannedItem.maintenance?.next_maintenance && (
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Próxima Manutenção</span>
                    </div>
                    <p className="text-gray-900">
                      {new Date(scannedItem.maintenance.next_maintenance).toLocaleDateString()}
                    </p>
                    {scannedItem.maintenance.usage_hours && (
                      <p className="text-sm text-gray-600">
                        Uso: {scannedItem.maintenance.usage_hours}h
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Responsável pela Retirada:</h4>
                <p className="text-gray-900">{user.full_name || user.email} (ID: {user.id})</p>
                <p className="text-sm text-gray-600">{user.company_name || 'SIGA'}</p>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button 
                  onClick={handleSmartCheckout} 
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

      {/* Item Details - Checkin */}
      {scanMode === 'checkin' && scannedItem && !showConditionForm && !showScanner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LogIn className="h-5 w-5 text-green-600" />
              <span>Confirmar Devolução</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Item Info */}
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-start space-x-4">
                  {React.createElement(getItemIcon(scannedItem.type), { 
                    className: "h-8 w-8 text-green-600 mt-1" 
                  })}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{scannedItem.name}</h3>
                      <Badge variant="outline">
                        {scannedItem.type === 'TOOL' ? 'Ferramenta' : 'Produto'}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-3">{scannedItem.description}</p>
                    <p className="text-sm text-gray-600">ID: {scannedItem.code}</p>
                  </div>
                </div>
              </div>

              {/* Condition Assessment */}
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                <h4 className="font-medium mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                  Avaliação da Condição do Item
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => handleSmartCheckin('perfect')} 
                    variant="outline"
                    className="h-auto p-4 border-green-300 text-green-700 hover:bg-green-50"
                    disabled={loading}
                  >
                    <div className="text-center">
                      <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-medium">✔️ Perfeitas Condições</div>
                      <div className="text-sm opacity-75">Sem danos ou desgaste</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => handleSmartCheckin('damaged')} 
                    variant="outline"
                    className="h-auto p-4 border-red-300 text-red-700 hover:bg-red-50"
                    disabled={loading}
                  >
                    <div className="text-center">
                      <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-medium">⚠️ Reportar Problema</div>
                      <div className="text-sm opacity-75">Danos, desgaste ou defeitos</div>
                    </div>
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

      {/* Condition Form */}
      {showConditionForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Reportar Problema</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold">{scannedItem?.name}</h3>
                <p className="text-gray-600">ID: {scannedItem?.code}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Descreva detalhadamente o problema encontrado:
                </label>
                <Textarea
                  placeholder="Ex: Cabo com mau contato, broca gasta, parafuso solto, arranhões, peças faltando..."
                  value={conditionNote}
                  onChange={(e) => setConditionNote(e.target.value)}
                  rows={4}
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
                  Confirmar Devolução com Problema
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

      {/* Last Movement Summary */}
      {lastMovement && (
        <Card className="border-green-500 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Última Operação</h3>
                <p className="text-green-700">{lastMovement.message}</p>
                <p className="text-sm text-green-600">
                  {lastMovement.movement.type === 'checkout' ? 'Retirada' : 'Devolução'} em{' '}
                  {new Date(lastMovement.movement.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

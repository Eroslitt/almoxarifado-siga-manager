
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { enhancedUnifiedItemService, EnhancedUnifiedItem } from '@/services/enhancedUnifiedItemService';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Download, 
  Copy, 
  Package, 
  Wrench,
  CheckCircle,
  Settings,
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react';

export const SmartQRCodeGenerator = () => {
  const [itemType, setItemType] = useState<'TOOL' | 'SKU'>('TOOL');
  const [itemData, setItemData] = useState({
    id: '',
    name: '',
    category: '',
    location: '',
    weight: '',
    brand: '',
    supplier: ''
  });
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [smartQRContent, setSmartQRContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [includeOfflineData, setIncludeOfflineData] = useState(true);
  
  const { toast } = useToast();

  const generateSmartQRCode = async () => {
    if (!itemData.id || !itemData.name) {
      toast({
        title: "Dados Incompletos",
        description: "ID e Nome são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create enhanced unified item structure
      const unifiedItem: EnhancedUnifiedItem = {
        id: itemData.id,
        type: itemType,
        code: itemData.id,
        name: itemData.name,
        description: itemData.name,
        category: itemData.category,
        specifications: {
          weight: itemData.weight ? parseFloat(itemData.weight) : undefined,
          brand: itemData.brand,
          technical_specs: `${itemType === 'TOOL' ? 'Ferramenta' : 'Produto'} ${itemData.category}`
        },
        stock: {
          location: itemData.location,
          status: 'available'
        },
        supplier: itemData.supplier ? {
          id: 'supplier-1',
          name: itemData.supplier,
          contact: '',
          cnpj: ''
        } : undefined,
        qr_metadata: {
          version: '2.0',
          generated_at: new Date().toISOString(),
          checksum: '',
          offline_data: includeOfflineData ? {
            name: itemData.name,
            category: itemData.category,
            location: itemData.location,
            weight: itemData.weight,
            brand: itemData.brand
          } : {}
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Generate smart QR content
      const qrContent = enhancedUnifiedItemService.generateSmartQRCode(unifiedItem);
      setSmartQRContent(qrContent);

      // Generate QR code image
      const qrCodeDataUrl = await QRCode.toDataURL(qrContent, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      setQrCodeUrl(qrCodeDataUrl);

      toast({
        title: "✅ Smart QR Code Gerado",
        description: `Código inteligente criado com ${includeOfflineData ? 'dados offline' : 'referência apenas'}`,
      });

    } catch (error) {
      console.error('Erro ao gerar Smart QR Code:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar código QR",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `smart-qr-${itemData.id}.png`;
    link.href = qrCodeUrl;
    link.click();

    toast({
      title: "Download Iniciado",
      description: "QR Code salvo com sucesso",
    });
  };

  const copyQRContent = async () => {
    if (!smartQRContent) return;

    try {
      await navigator.clipboard.writeText(smartQRContent);
      toast({
        title: "Copiado",
        description: "Conteúdo do QR Code copiado para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o conteúdo",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setItemData({
      id: '',
      name: '',
      category: '',
      location: '',
      weight: '',
      brand: '',
      supplier: ''
    });
    setQrCodeUrl('');
    setSmartQRContent('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Generator Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5" />
            <span>Gerador de Smart QR Code</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Item Type */}
          <div>
            <Label>Tipo de Item</Label>
            <Select value={itemType} onValueChange={(value: 'TOOL' | 'SKU') => setItemType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TOOL">
                  <div className="flex items-center space-x-2">
                    <Wrench className="h-4 w-4" />
                    <span>Ferramenta</span>
                  </div>
                </SelectItem>
                <SelectItem value="SKU">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4" />
                    <span>Produto/SKU</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>ID/Código *</Label>
              <Input
                placeholder={itemType === 'TOOL' ? 'FER-001' : 'SKU-001'}
                value={itemData.id}
                onChange={(e) => setItemData({...itemData, id: e.target.value})}
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Input
                placeholder={itemType === 'TOOL' ? 'Elétrica' : 'Eletrônicos'}
                value={itemData.category}
                onChange={(e) => setItemData({...itemData, category: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label>Nome/Descrição *</Label>
            <Input
              placeholder={itemType === 'TOOL' ? 'Furadeira Makita DHP453' : 'Capacitor 220µF 25V'}
              value={itemData.name}
              onChange={(e) => setItemData({...itemData, name: e.target.value})}
            />
          </div>

          {/* Advanced Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Localização</Label>
              <Input
                placeholder="A-01-05"
                value={itemData.location}
                onChange={(e) => setItemData({...itemData, location: e.target.value})}
              />
            </div>
            <div>
              <Label>Peso (kg)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="1.5"
                value={itemData.weight}
                onChange={(e) => setItemData({...itemData, weight: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Marca</Label>
              <Input
                placeholder="Makita"
                value={itemData.brand}
                onChange={(e) => setItemData({...itemData, brand: e.target.value})}
              />
            </div>
            <div>
              <Label>Fornecedor</Label>
              <Input
                placeholder="TechTools Ltda"
                value={itemData.supplier}
                onChange={(e) => setItemData({...itemData, supplier: e.target.value})}
              />
            </div>
          </div>

          {/* Options */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center">
              <Settings className="h-4 w-4 mr-2 text-blue-600" />
              Opções Avançadas
            </h4>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="offlineData"
                checked={includeOfflineData}
                onChange={(e) => setIncludeOfflineData(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="offlineData" className="text-sm flex items-center space-x-2">
                {includeOfflineData ? (
                  <WifiOff className="h-4 w-4 text-green-600" />
                ) : (
                  <Wifi className="h-4 w-4 text-blue-600" />
                )}
                <span>Incluir dados para modo offline</span>
              </label>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {includeOfflineData ? 
                'QR Code funcionará mesmo sem conexão de internet' :
                'QR Code requer conexão para buscar dados completos'
              }
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button 
              onClick={generateSmartQRCode} 
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                'Gerando...'
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Gerar Smart QR
                </>
              )}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated QR Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>QR Code Gerado</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {qrCodeUrl ? (
            <div className="space-y-4">
              {/* QR Code Image */}
              <div className="text-center">
                <img 
                  src={qrCodeUrl} 
                  alt="Generated QR Code" 
                  className="mx-auto border rounded-lg shadow-sm bg-white p-4"
                />
              </div>

              {/* QR Code Info */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Smart QR Code Criado</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                  <div>
                    <span className="font-medium">Tipo:</span> {itemType === 'TOOL' ? 'Ferramenta' : 'Produto'}
                  </div>
                  <div>
                    <span className="font-medium">ID:</span> {itemData.id}
                  </div>
                  <div>
                    <span className="font-medium">Versão:</span> 2.0 (Smart)
                  </div>
                  <div>
                    <span className="font-medium">Offline:</span> {includeOfflineData ? 'Sim' : 'Não'}
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    ✓ Detecção automática de tipo
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    ✓ Especificações técnicas incluídas
                  </Badge>
                  {includeOfflineData && (
                    <Badge className="bg-purple-100 text-purple-800">
                      ✓ Funciona offline
                    </Badge>
                  )}
                </div>
              </div>

              {/* QR Content Preview */}
              {smartQRContent && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Conteúdo do QR Code:</h4>
                  <Textarea
                    value={smartQRContent}
                    readOnly
                    rows={4}
                    className="text-xs font-mono"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <Button onClick={downloadQRCode} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download PNG
                </Button>
                <Button variant="outline" onClick={copyQRContent}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Preencha os dados e clique em "Gerar Smart QR" para criar o código</p>
              <div className="mt-4 text-sm text-blue-600">
                <p>✓ Funciona com Tools e SKUs</p>
                <p>✓ Inclui especificações técnicas</p>
                <p>✓ Suporte offline opcional</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

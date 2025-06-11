
import { useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Download, Copy, RefreshCw } from 'lucide-react';
import { Tool } from '@/types/database';

interface QRCodeGeneratorProps {
  tool?: Tool;
  onGenerated?: (qrCodeData: string) => void;
}

export const QRCodeGenerator = ({ tool, onGenerated }: QRCodeGeneratorProps) => {
  const [qrData, setQrData] = useState(tool?.qr_code || '');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const generateQRCode = async () => {
    if (!qrData.trim()) {
      toast({
        title: "Erro",
        description: "Insira os dados para gerar o QR code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Criar dados estruturados para o QR code
      const qrPayload = JSON.stringify({
        toolId: tool?.id || qrData,
        type: 'TOOL',
        timestamp: new Date().toISOString()
      });

      const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      setQrCodeUrl(qrCodeDataUrl);
      onGenerated?.(qrPayload);

      toast({
        title: "Sucesso",
        description: "QR Code gerado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao gerar QR code:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar QR code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `qr-${tool?.id || 'code'}.png`;
    link.href = qrCodeUrl;
    link.click();

    toast({
      title: "Download",
      description: "QR Code baixado com sucesso",
    });
  };

  const copyQRData = async () => {
    if (!qrData) return;

    try {
      await navigator.clipboard.writeText(qrData);
      toast({
        title: "Copiado",
        description: "Dados do QR code copiados para a área de transferência",
      });
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast({
        title: "Erro",
        description: "Erro ao copiar dados",
        variant: "destructive",
      });
    }
  };

  const generateRandomCode = () => {
    const randomCode = `${tool?.category?.toUpperCase() || 'TOOL'}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    setQrData(randomCode);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="h-5 w-5 text-blue-600" />
          <span>Gerador de QR Code</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tool && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium">{tool.name}</h4>
            <p className="text-sm text-gray-600">ID: {tool.id}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="qr-data">Dados do QR Code</Label>
          <div className="flex space-x-2">
            <Input
              id="qr-data"
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
              placeholder="Digite os dados para o QR code"
            />
            <Button
              onClick={generateRandomCode}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={generateQRCode}
            disabled={loading || !qrData.trim()}
            className="flex-1"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <QrCode className="h-4 w-4 mr-2" />
            )}
            Gerar QR Code
          </Button>
          <Button
            onClick={copyQRData}
            variant="outline"
            disabled={!qrData}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        {qrCodeUrl && (
          <div className="space-y-4">
            <div className="text-center">
              <img
                src={qrCodeUrl}
                alt="QR Code gerado"
                className="mx-auto border rounded-lg"
              />
            </div>

            <Button
              onClick={downloadQRCode}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar QR Code
            </Button>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </CardContent>
    </Card>
  );
};

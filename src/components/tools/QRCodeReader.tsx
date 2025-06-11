
import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, RotateCcw } from 'lucide-react';

interface QRCodeReaderProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
  isActive: boolean;
  onCancel: () => void;
}

export const QRCodeReader = ({ 
  onScanSuccess, 
  onScanError, 
  isActive, 
  onCancel 
}: QRCodeReaderProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const elementId = 'qr-reader';

  useEffect(() => {
    if (isActive && !isScanning) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isActive]);

  const startScanner = async () => {
    try {
      // Verificar permissão da câmera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      };

      scannerRef.current = new Html5QrcodeScanner(elementId, config, false);
      
      scannerRef.current.render(
        (decodedText: string) => {
          console.log('QR Code scanned:', decodedText);
          onScanSuccess(decodedText);
          stopScanner();
        },
        (errorMessage: string) => {
          // Ignorar erros comuns de scanning
          if (!errorMessage.includes('No QR code found')) {
            console.warn('QR scan error:', errorMessage);
            onScanError?.(errorMessage);
          }
        }
      );

      setIsScanning(true);
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      setHasPermission(false);
      onScanError?.('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (error) {
        console.warn('Erro ao parar scanner:', error);
      }
    }
    setIsScanning(false);
  };

  const restartScanner = () => {
    stopScanner();
    setTimeout(() => startScanner(), 100);
  };

  if (!isActive) return null;

  if (hasPermission === false) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <CameraOff className="h-5 w-5" />
            <span>Câmera Não Disponível</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Não foi possível acessar a câmera. Verifique se:
          </p>
          <ul className="text-left text-sm text-gray-600 space-y-1">
            <li>• As permissões de câmera estão habilitadas</li>
            <li>• O navegador suporta acesso à câmera</li>
            <li>• A conexão é segura (HTTPS)</li>
          </ul>
          <div className="flex space-x-2">
            <Button onClick={startScanner} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button onClick={onCancel} variant="outline">
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="h-5 w-5 text-green-600" />
          <span>Scanner QR Code</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Posicione o QR code da ferramenta dentro do quadro
          </p>
        </div>

        <div 
          id={elementId} 
          className="w-full"
          style={{ minHeight: '300px' }}
        />

        <div className="flex space-x-2">
          <Button onClick={restartScanner} variant="outline" className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reiniciar Scanner
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancelar
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>Certifique-se de que há boa iluminação e o QR code está bem visível</p>
        </div>
      </CardContent>
    </Card>
  );
};


import { Button } from '@/components/ui/button';
import { QrCode, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ToolsHeader = () => {
  const { toast } = useToast();

  const handleScannerClick = () => {
    console.log('Scanner Mobile clicked');
    toast({
      title: "Scanner Mobile",
      description: "Funcionalidade de scanner mobile será implementada em breve.",
    });
  };

  const handleNewToolClick = () => {
    console.log('Nova Ferramenta clicked');
    toast({
      title: "Nova Ferramenta",
      description: "Modal para adicionar nova ferramenta será aberto.",
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">SGF-QR - Gestão de Ferramentas</h1>
        <p className="text-gray-600 mt-1">Sistema de rastreabilidade por QR Code</p>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" onClick={handleScannerClick}>
          <QrCode className="h-4 w-4 mr-2" />
          Scanner Mobile
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleNewToolClick}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Ferramenta
        </Button>
      </div>
    </div>
  );
};

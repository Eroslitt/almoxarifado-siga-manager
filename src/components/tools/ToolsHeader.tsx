
import { Button } from '@/components/ui/button';
import { QrCode, Plus } from 'lucide-react';

export const ToolsHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">SGF-QR - Gestão de Ferramentas</h1>
        <p className="text-gray-600 mt-1">Sistema de rastreabilidade por QR Code</p>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline">
          <QrCode className="h-4 w-4 mr-2" />
          Scanner Mobile
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Ferramenta
        </Button>
      </div>
    </div>
  );
};


import { Clock } from 'lucide-react';

export const DashboardHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard SIGA</h1>
        <p className="text-gray-600 mt-1">Visão geral do almoxarifado em tempo real</p>
      </div>
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Clock className="h-4 w-4" />
        <span>Última atualização: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

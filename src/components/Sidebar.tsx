
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Package, 
  TruckIcon, 
  ShoppingCart, 
  FileText,
  Settings,
  Home
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

export const Sidebar = ({ activeModule, onModuleChange }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'stock', label: 'Gestão de Estoque', icon: Package },
    { id: 'receiving', label: 'Recebimento', icon: TruckIcon },
    { id: 'shipping', label: 'Expedição', icon: ShoppingCart },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-blue-400">SIGA</h1>
        <p className="text-sm text-slate-300 mt-1">Sistema Integrado de Gestão de Almoxarifado</p>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onModuleChange(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                  activeModule === item.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <Settings className="h-5 w-5" />
          <span className="text-sm font-medium">Configurações</span>
        </button>
      </div>
    </div>
  );
};

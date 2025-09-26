import React from 'react';
import { 
  Home, 
  Shield, 
  FileText, 
  Package, 
  TruckIcon, 
  BarChart3, 
  QrCode,
  Settings,
  ShoppingCart,
  Building2,
  ClipboardCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  className?: string;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, badge: null },
  { id: 'epi-control', label: 'Controle de EPIs', icon: Shield, badge: 'Novo' },
  { id: 'material-verification', label: 'Verificação de Materiais', icon: ClipboardCheck, badge: 'Novo' },
  { id: 'master-data', label: 'Dados Mestres', icon: Building2, badge: null },
  { id: 'stock', label: 'Estoque', icon: Package, badge: null },
  { id: 'receiving', label: 'Recebimento', icon: TruckIcon, badge: null },
  { id: 'shipping', label: 'Expedição', icon: ShoppingCart, badge: null },
  { id: 'reports', label: 'Relatórios', icon: BarChart3, badge: null },
  { id: 'tools-qr', label: 'Ferramentas QR', icon: QrCode, badge: null },
  { id: 'more-options', label: 'Mais Opções', icon: Settings, badge: null },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeModule, 
  onModuleChange, 
  className = '' 
}) => {
  const { user } = useAuth();

  return (
    <div className={`w-64 bg-white border-r border-gray-200 h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">SIGA</h2>
            <p className="text-sm text-gray-500">Almoxarifado</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-blue-600">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.full_name || user?.email}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.company_name || 'SIGA Premium'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start h-auto p-3 ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => onModuleChange(item.id)}
            >
              <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-center">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            ✓ Premium Ativo
          </Badge>
        </div>
      </div>
    </div>
  );
};
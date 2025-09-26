
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  Folder, 
  ArrowUp, 
  FolderPlus, 
  FilePlus,
  Settings,
  FolderMinus,
  Search,
  FolderX,
  X,
  CheckCircle,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/contexts/NavigationContext';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

export const Sidebar = ({ activeModule, onModuleChange }: SidebarProps) => {
  const { sidebarCollapsed, setSidebarCollapsed } = useNavigation();

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: FolderMinus,
      description: 'Visão geral do sistema'
    },
    { 
      id: 'masterdata', 
      label: 'Master Data', 
      icon: FolderX,
      description: 'Gestão de dados mestres'
    },
    { 
      id: 'stock', 
      label: 'Gestão de Estoque', 
      icon: Folder,
      description: 'Controle de inventário'
    },
    { 
      id: 'tools-qr', 
      label: 'Ferramentas QR', 
      icon: Search,
      description: 'Sistema SGF-QR'
    },
    { 
      id: 'receiving', 
      label: 'Recebimento', 
      icon: ArrowUp,
      description: 'Entrada de materiais'
    },
    { 
      id: 'shipping', 
      label: 'Expedição', 
      icon: FolderPlus,
      description: 'Saída de materiais'
    },
    { 
      id: 'reports', 
      label: 'Relatórios', 
      icon: TrendingUp,
      description: 'Análises e relatórios'
    },
    { 
      id: 'material-verification', 
      label: 'Verificação de Materiais', 
      icon: CheckCircle,
      description: 'Controle de qualidade de materiais'
    },
    { 
      id: 'epi-control', 
      label: 'Controle de EPIs', 
      icon: Shield,
      description: 'Gestão de equipamentos de proteção'
    },
  ];

  const handleModuleClick = (moduleId: string) => {
    console.log('Sidebar: Changing module to:', moduleId);
    try {
      onModuleChange(moduleId);
      // Update breadcrumbs based on module
      const moduleItem = menuItems.find(item => item.id === moduleId);
      if (moduleItem) {
        // This will be handled by individual modules
      }
    } catch (error) {
      console.error('Error changing module:', error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300",
        sidebarCollapsed && "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-blue-400">SIGA</h1>
              <p className="text-sm text-slate-300 mt-1">Sistema Integrado de Gestão</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(true)}
              className="lg:hidden text-white hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleModuleClick(item.id)}
                    className={cn(
                      "w-full group flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 cursor-pointer",
                      isActive
                        ? "bg-blue-600 text-white shadow-lg transform scale-[1.02]"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white hover:scale-[1.01]"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 flex-shrink-0 transition-colors",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.label}</div>
                      <div className={cn(
                        "text-xs truncate transition-colors",
                        isActive ? "text-blue-100" : "text-slate-500 group-hover:text-slate-300"
                      )}>
                        {item.description}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <button 
            type="button"
            onClick={() => console.log('Settings clicked')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <Settings className="h-5 w-5" />
            <span className="text-sm font-medium">Configurações</span>
          </button>
        </div>
      </div>
    </>
  );
};

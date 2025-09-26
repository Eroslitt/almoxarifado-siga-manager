
import * as React from 'react';

interface NavigationContextType {
  activeModule: string;
  setActiveModule: (module: string) => void;
  breadcrumbs: Array<{ label: string; path: string }>;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; path: string }>) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const NavigationContext = React.createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: React.ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [activeModule, setActiveModule] = React.useState('dashboard');
  const [breadcrumbs, setBreadcrumbs] = React.useState<Array<{ label: string; path: string }>>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const value = {
    activeModule,
    setActiveModule,
    breadcrumbs,
    setBreadcrumbs,
    sidebarCollapsed,
    setSidebarCollapsed
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = React.useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation deve ser usado dentro de um NavigationProvider');
  }
  return context;
};

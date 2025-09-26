
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  activeModule: string;
  setActiveModule: (module: string) => void;
  breadcrumbs: Array<{ label: string; path: string }>;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; path: string }>) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ label: string; path: string }>>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation deve ser usado dentro de um NavigationProvider');
  }
  return context;
};

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';
import { MobileAppHeader } from './MobileAppHeader';
import { MobileBottomNav } from './MobileBottomNav';

interface MobileLayoutProps {
  children: ReactNode;
  activeModule: string;
  onModuleChange: (module: string) => void;
  className?: string;
}

export const MobileLayout = ({ 
  children, 
  activeModule, 
  onModuleChange, 
  className 
}: MobileLayoutProps) => {
  const isMobile = useMobile();

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className={cn("min-h-screen bg-background flex flex-col", className)}>
      <MobileAppHeader />
      
      <main className="flex-1 overflow-auto pb-20 safe-area-bottom">
        {children}
      </main>
      
      <MobileBottomNav 
        activeModule={activeModule}
        onModuleChange={onModuleChange}
      />
    </div>
  );
};
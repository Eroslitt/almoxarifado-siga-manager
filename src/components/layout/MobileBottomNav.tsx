import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  FolderMinus, 
  Folder, 
  Search, 
  TrendingUp, 
  List 
} from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

interface MobileBottomNavProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

export const MobileBottomNav = ({ activeModule, onModuleChange }: MobileBottomNavProps) => {
  const isMobile = useMobile();

  if (!isMobile) return null;

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Home', 
      icon: FolderMinus 
    },
    { 
      id: 'stock', 
      label: 'Estoque', 
      icon: Folder 
    },
    { 
      id: 'tools-qr', 
      label: 'QR Tools', 
      icon: Search 
    },
    { 
      id: 'reports', 
      label: 'Relatórios', 
      icon: TrendingUp 
    },
    { 
      id: 'more', 
      label: 'Mais', 
      icon: List 
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t safe-area-bottom">
      <div className="grid grid-cols-5 gap-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onModuleChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 h-16 min-h-[4rem] text-xs px-1",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate text-[10px] leading-tight">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
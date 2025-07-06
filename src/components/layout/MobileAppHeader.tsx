import { Bell, List, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNavigation } from '@/contexts/NavigationContext';
import { useMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export const MobileAppHeader = () => {
  const { setSidebarCollapsed } = useNavigation();
  const isMobile = useMobile();
  const [showSearch, setShowSearch] = useState(false);

  if (!isMobile) return null;

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b safe-area-top">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(false)}
            className="p-2"
          >
            <List className="h-5 w-5" />
          </Button>
          
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-foreground">SIGA</h1>
            <p className="text-xs text-muted-foreground -mt-1">Sistema Integrado</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            className="p-2"
          >
            <Search className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="sm" className="relative p-2">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] leading-none">3</Badge>
          </Button>
        </div>
      </div>

      {/* Expandable search */}
      {showSearch && (
        <div className="px-4 pb-3 animate-in slide-in-from-top-2 duration-200">
          <Input 
            placeholder="Buscar..." 
            className="w-full"
            autoFocus
          />
        </div>
      )}
    </header>
  );
};
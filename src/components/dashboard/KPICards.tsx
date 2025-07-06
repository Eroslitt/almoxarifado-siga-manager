
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Folder, 
  TrendingUp, 
  X, 
  Search
} from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export const KPICards = () => {
  const isMobile = useMobile();
  
  return (
    <div className={cn(
      "grid gap-4",
      isMobile 
        ? "grid-cols-1 sm:grid-cols-2" 
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    )}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className={cn(
          "flex flex-row items-center justify-between space-y-0",
          isMobile ? "pb-2" : "pb-2"
        )}>
          <CardTitle className={cn(
            "font-medium",
            isMobile ? "text-xs" : "text-sm"
          )}>
            Itens em Estoque
          </CardTitle>
          <Folder className={cn(
            "text-blue-600",
            isMobile ? "h-4 w-4" : "h-4 w-4"
          )} />
        </CardHeader>
        <CardContent className={isMobile ? "pt-0" : ""}>
          <div className={cn(
            "font-bold",
            isMobile ? "text-xl" : "text-2xl"
          )}>
            12.847
          </div>
          <p className={cn(
            "text-muted-foreground",
            isMobile ? "text-xs" : "text-xs"
          )}>
            <span className="text-green-600">+2.1%</span> desde ontem
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className={cn(
          "flex flex-row items-center justify-between space-y-0",
          isMobile ? "pb-2" : "pb-2"
        )}>
          <CardTitle className={cn(
            "font-medium",
            isMobile ? "text-xs" : "text-sm"
          )}>
            Ferramentas QR
          </CardTitle>
          <Search className={cn(
            "text-purple-600",
            isMobile ? "h-4 w-4" : "h-4 w-4"
          )} />
        </CardHeader>
        <CardContent className={isMobile ? "pt-0" : ""}>
          <div className={cn(
            "font-bold",
            isMobile ? "text-xl" : "text-2xl"
          )}>
            145
          </div>
          <p className={cn(
            "text-muted-foreground",
            isMobile ? "text-xs" : "text-xs"
          )}>
            <span className="text-blue-600">35</span> em uso agora
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className={cn(
          "flex flex-row items-center justify-between space-y-0",
          isMobile ? "pb-2" : "pb-2"
        )}>
          <CardTitle className={cn(
            "font-medium",
            isMobile ? "text-xs" : "text-sm"
          )}>
            Acuracidade ISA
          </CardTitle>
          <TrendingUp className={cn(
            "text-green-600",
            isMobile ? "h-4 w-4" : "h-4 w-4"
          )} />
        </CardHeader>
        <CardContent className={isMobile ? "pt-0" : ""}>
          <div className={cn(
            "font-bold",
            isMobile ? "text-xl" : "text-2xl"
          )}>
            98.7%
          </div>
          <Progress value={98.7} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className={cn(
          "flex flex-row items-center justify-between space-y-0",
          isMobile ? "pb-2" : "pb-2"
        )}>
          <CardTitle className={cn(
            "font-medium",
            isMobile ? "text-xs" : "text-sm"
          )}>
            Alertas Críticos
          </CardTitle>
          <X className={cn(
            "text-orange-600",
            isMobile ? "h-4 w-4" : "h-4 w-4"
          )} />
        </CardHeader>
        <CardContent className={isMobile ? "pt-0" : ""}>
          <div className={cn(
            "font-bold",
            isMobile ? "text-xl" : "text-2xl"
          )}>
            23
          </div>
          <p className={cn(
            "text-muted-foreground",
            isMobile ? "text-xs" : "text-xs"
          )}>
            Itens abaixo do estoque mínimo
          </p>
        </CardContent>
      </Card>
    </div>
  );
};


import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export const PageContainer = ({ 
  children, 
  className, 
  title, 
  description, 
  actions 
}: PageContainerProps) => {
  const isMobile = useMobile();
  
  return (
    <div className={cn(
      isMobile 
        ? "p-4 space-y-4" 
        : "p-4 lg:p-6 space-y-6", 
      className
    )}>
      {(title || description || actions) && (
        <div className={cn(
          "flex justify-between gap-4",
          isMobile 
            ? "flex-col space-y-2" 
            : "flex-col sm:flex-row sm:items-center"
        )}>
          <div>
            {title && (
              <h1 className={cn(
                "font-bold text-foreground",
                isMobile 
                  ? "text-xl" 
                  : "text-2xl lg:text-3xl"
              )}>
                {title}
              </h1>
            )}
            {description && (
              <p className={cn(
                "text-muted-foreground mt-1",
                isMobile ? "text-sm" : "text-base"
              )}>
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className={cn(
              "flex items-center",
              isMobile 
                ? "justify-start space-x-2" 
                : "space-x-2"
            )}>
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

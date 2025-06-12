
import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface MobileLoadingProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export const MobileLoading: React.FC<MobileLoadingProps> = ({ 
  size = "md", 
  text = "Carregando...",
  className 
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center space-y-3 py-8",
      className
    )}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {text}
        </p>
      )}
    </div>
  )
}

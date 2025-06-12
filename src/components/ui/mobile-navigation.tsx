
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

interface MobileNavigationProps {
  items: Array<{
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    onClick: () => void
    active?: boolean
  }>
  className?: string
}

export const MobileNavigation = React.forwardRef<
  HTMLDivElement,
  MobileNavigationProps
>(({ items, className, ...props }, ref) => {
  const isMobile = useMobile()

  if (!isMobile) return null

  return (
    <div 
      ref={ref}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t safe-area-bottom",
        className
      )}
      {...props}
    >
      <div className="grid grid-cols-3 gap-1 p-2">
        {items.map((item) => (
          <Button
            key={item.id}
            variant={item.active ? "default" : "ghost"}
            size="sm"
            onClick={item.onClick}
            className={cn(
              "flex flex-col items-center space-y-1 h-14 text-xs",
              item.active && "bg-primary text-primary-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="truncate">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
})
MobileNavigation.displayName = "MobileNavigation"

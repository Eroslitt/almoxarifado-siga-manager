
import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface ResponsiveTableProps extends React.HTMLAttributes<HTMLDivElement> {
  headers: string[]
  data: any[]
  renderRow: (item: any, index: number) => React.ReactNode
  renderMobileCard: (item: any, index: number) => React.ReactNode
  emptyMessage?: string
}

export const ResponsiveTable = React.forwardRef<HTMLDivElement, ResponsiveTableProps>(
  ({ className, headers, data, renderRow, renderMobileCard, emptyMessage = "Nenhum dado encontrado", ...props }, ref) => {
    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {/* Desktop Table */}
        <div className="hidden md:block">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {data.length > 0 ? (
                  data.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      {renderRow(item, index)}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={headers.length} className="h-24 text-center text-muted-foreground">
                      {emptyMessage}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {data.length > 0 ? (
            data.map((item, index) => (
              <Card key={index} className="w-full">
                <CardContent className="p-4">
                  {renderMobileCard(item, index)}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                {emptyMessage}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }
)
ResponsiveTable.displayName = "ResponsiveTable"

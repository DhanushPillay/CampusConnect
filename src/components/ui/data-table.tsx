"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[]
  data: T[]
  actions?: (item: T) => React.ReactNode
  emptyTitle?: string
  emptyDescription?: string
  className?: string
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  actions,
  emptyTitle = "No data yet",
  emptyDescription = "There are no records to display.",
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const aVal = (a as any)[sortKey]
    const bVal = (b as any)[sortKey]
    if (aVal == null) return 1
    if (bVal == null) return -1
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return sortDir === "asc" ? cmp : -cmp
  })

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  if (data.length === 0) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center border-dashed border-2 bg-muted/10">
        <p className="font-display font-medium text-lg text-muted-foreground text-center">{emptyTitle}</p>
        <p className="text-sm text-muted-foreground/60 text-center mt-1">{emptyDescription}</p>
      </Card>
    )
  }

  return (
    <Card className={cn("overflow-hidden bg-white border-border/40 shadow-soft", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors",
                    col.className
                  )}
                  onClick={() => toggleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.header}
                    {sortKey === col.key && (
                      <span className="text-primary">{sortDir === "asc" ? "↑" : "↓"}</span>
                    )}
                  </span>
                </th>
              ))}
              {actions && <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => (
              <tr key={item.id} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-5 py-3 text-sm text-foreground", col.className)}>
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-5 py-3">{actions(item)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

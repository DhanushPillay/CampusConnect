import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  rows?: number
  className?: string
}

export function LoadingSkeleton({ rows = 5, className }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 bg-muted/50 animate-pulse rounded-none"
          style={{ width: `${70 + Math.random() * 30}%` }}
        />
      ))}
    </div>
  )
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 border border-border bg-card animate-pulse space-y-4", className)}>
      <div className="h-4 bg-muted/50 rounded-none w-1/3" />
      <div className="h-8 bg-muted/50 rounded-none w-1/2" />
      <div className="h-3 bg-muted/50 rounded-none w-2/3" />
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4, className }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={cn("border border-border bg-card", className)}>
      <div className="h-12 bg-muted/30 border-b border-border" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex border-b border-border/50 last:border-0">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="flex-1 p-4">
              <div
                className="h-4 bg-muted/40 animate-pulse rounded-none"
                style={{ width: `${60 + Math.random() * 40}%` }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

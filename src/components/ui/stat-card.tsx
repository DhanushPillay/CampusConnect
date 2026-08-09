import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  accentColor?: "primary" | "secondary" | "accent" | "destructive"
  className?: string
}

const accentColors = {
  primary: "text-primary bg-primary/10",
  secondary: "text-secondary bg-secondary/10",
  accent: "text-accent bg-accent/10",
  destructive: "text-destructive bg-destructive/10",
}

export function StatCard({
  label,
  value,
  description,
  icon,
  accentColor = "primary",
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "p-5 bg-white border-border/40 shadow-soft transition-shadow hover:shadow-soft-lg",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {icon && (
          <div className={cn("p-2 rounded-lg flex items-center justify-center", accentColors[accentColor])}>
            {icon}
          </div>
        )}
      </div>
      <div className="text-3xl font-display font-bold tracking-tight text-foreground">{value}</div>
      {description && (
        <p className="text-xs font-medium text-muted-foreground mt-2">{description}</p>
      )}
    </Card>
  )
}

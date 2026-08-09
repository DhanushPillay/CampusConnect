import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-8 text-center",
      className
    )}>
      {icon && (
        <div className="mb-6 text-foreground/20 organic-tilt-2">{icon}</div>
      )}
      <h3 className="font-display font-bold text-xl uppercase mb-2">{title}</h3>
      <p className="font-serif text-foreground/60 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface FormCardProps {
  children: React.ReactNode
  className?: string
}

export function FormCard({ children, className }: FormCardProps) {
  return (
    <Card className={cn("p-6 border-l-4 border-l-primary bg-surface-warm", className)}>
      {children}
    </Card>
  )
}

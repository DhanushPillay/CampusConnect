import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepperProps {
  steps: string[]
  currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center w-full mb-16 px-4 sm:px-8">
      {steps.map((step, index) => {
        const isCompleted = currentStep > index
        const isCurrent = currentStep === index

        return (
          <div key={step} className={cn(
            "flex items-center",
            index !== steps.length - 1 ? "flex-1" : ""
          )}>
            {/* Step Circle & Label */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm transition-all duration-300 border-2 shadow-sm",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground scale-100"
                    : isCurrent
                    ? "bg-background border-primary text-primary scale-110 ring-4 ring-primary/20"
                    : "bg-muted/30 border-muted text-muted-foreground scale-100"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold absolute top-14 w-32 text-center transition-colors duration-300",
                  isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground/70"
                )}
              >
                {step}
              </span>
            </div>

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 sm:mx-4 h-[3px] rounded-full bg-muted overflow-hidden relative">
                <div 
                  className={cn(
                    "absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-in-out",
                    isCompleted ? "w-full" : "w-0"
                  )}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

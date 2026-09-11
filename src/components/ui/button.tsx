import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-brand-600 text-white shadow-card hover:bg-brand-700",
        ember: "bg-ember text-white shadow-card hover:brightness-95",
        secondary: "bg-brand-50 text-brand-700 hover:bg-brand-100",
        outline: "border border-input bg-white hover:border-brand-600/50 hover:text-brand-700",
        ghost: "hover:bg-brand-50 hover:text-brand-700",
        destructive: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        default: "h-10 px-5",
        lg: "h-12 px-7 text-[15px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

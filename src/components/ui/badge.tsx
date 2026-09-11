import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        brand: "bg-brand-50 text-brand-700",
        success: "bg-emerald-50 text-emerald-700",
        warning: "bg-amber-50 text-amber-700",
        destructive: "bg-red-50 text-red-700",
        muted: "bg-surface text-sub",
        outline: "border border-border text-sub",
      },
    },
    defaultVariants: { variant: "muted" },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const variant =
    s === "PRESENT" || s === "PAID" || s === "PUBLISHED" || s === "ACTIVE" || s === "SUBMITTED" || s === "GRADED"
      ? "success"
      : s === "ABSENT" || s === "OVERDUE" || s === "FAILED"
        ? "destructive"
        : s === "LATE" || s === "PENDING" || s === "UNPAID" || s === "DRAFT"
          ? "warning"
          : "brand";
  return <Badge variant={variant as VariantProps<typeof badgeVariants>["variant"]}>{status}</Badge>;
}

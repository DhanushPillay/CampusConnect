"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

function initials(name?: string | null, email?: string | null) {
  const src = name?.trim() || email?.split("@")[0] || "?";
  const parts = src.split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] || "?") + (parts[1]?.[0] || "")).toUpperCase();
}

export function Avatar({
  name,
  email,
  className,
}: {
  name?: string | null;
  email?: string | null;
  className?: string;
}) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-brand-600 to-magenta text-xs font-bold text-white",
        className
      )}
    >
      <AvatarPrimitive.Fallback>{initials(name, email)}</AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

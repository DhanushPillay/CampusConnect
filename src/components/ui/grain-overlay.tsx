"use client";

import { cn } from "@/lib/utils";

interface GrainOverlayProps {
  intensity?: "fine" | "medium" | "heavy";
  className?: string;
  animated?: boolean;
}

export function GrainOverlay({ 
  intensity = "fine", 
  className,
  animated = true 
}: GrainOverlayProps) {
  
  const opacities = {
    fine: "opacity-[0.03]",
    medium: "opacity-[0.06]",
    heavy: "opacity-[0.12]"
  };

  return (
    <div className={cn("pointer-events-none absolute inset-0 z-0 overflow-hidden", className)}>
      {/* Layer 1: Fine static film grain */}
      <div 
        className={cn(
          "absolute -inset-[100%] bg-repeat mix-blend-overlay",
          opacities[intensity]
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Layer 2: Animated coarse grain (skips if prefers-reduced-motion) */}
      {animated && (
        <div 
          className={cn(
            "absolute -inset-[100%] bg-repeat mix-blend-overlay animate-grain motion-reduce:hidden",
            opacities[intensity]
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      )}
      
      {/* Layer 3: Paper fiber layer */}
      <div 
        className="absolute inset-0 mix-blend-overlay opacity-20"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px),
            repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)
          `,
        }}
      />
    </div>
  );
}

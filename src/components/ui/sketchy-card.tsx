"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import rough from "roughjs";

interface SketchyCardProps extends React.HTMLAttributes<HTMLDivElement> {
  roughness?: number;
  stroke?: string;
  fill?: string;
  fillStyle?: "hachure" | "solid" | "zigzag" | "cross-hatch" | "dots" | "dashed" | "zigzag-line";
  fillWeight?: number;
}

export function SketchyCard({
  className,
  children,
  roughness = 1.5,
  stroke = "currentColor",
  fill,
  fillStyle = "hachure",
  fillWeight = 1,
  ...props
}: SketchyCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initial size
    setDimensions({
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
    });
    
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;
    
    // Clear previous drawing
    while (svgRef.current.firstChild) {
      svgRef.current.removeChild(svgRef.current.firstChild);
    }
    
    const rc = rough.svg(svgRef.current);
    const padding = 2; // Keep drawing within SVG bounds
    const rect = rc.rectangle(
      padding, 
      padding, 
      dimensions.width - padding * 2, 
      dimensions.height - padding * 2, 
      { 
        roughness, 
        stroke, 
        fill, 
        fillStyle,
        fillWeight,
        strokeWidth: 2
      }
    );
    svgRef.current.appendChild(rect);
  }, [dimensions, roughness, stroke, fill, fillStyle, fillWeight]);

  return (
    <div 
      ref={containerRef}
      className={cn("relative p-6", className)} 
      {...props}
    >
      <svg 
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}

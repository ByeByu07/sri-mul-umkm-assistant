import React, { ComponentPropsWithoutRef, CSSProperties } from "react";

import { cn } from "@/lib/utils";

interface RippleProps extends ComponentPropsWithoutRef<"div"> {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  circleColor?: string;
  borderColor?: string;
  backgroundColor?: string;
  gradient?: {
    from: string;
    to: string;
    direction?: 'to_bottom' | 'to_top' | 'to_right' | 'to_left' | 'to_bottom_right' | 'to_bottom_left';
  };
}

export const Ripple = React.memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  circleColor = "var(--foreground)",
  borderColor = "var(--foreground)",
  backgroundColor = "var(--foreground)",
  gradient,
  className,
  ...props
}: RippleProps) {
  // Create gradient mask if gradient is provided
  const maskImage = gradient 
    ? `linear-gradient(${gradient.direction?.replace(/_/g, ' ') || 'to bottom'}, ${gradient.from}, ${gradient.to})`
    : 'linear-gradient(to bottom, white, transparent)';

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 select-none",
        className,
      )}
      style={{
        maskImage: maskImage,
        WebkitMaskImage: maskImage,
      }}
      {...props}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = "solid";

        return (
          <div
            key={i}
            className={`absolute animate-ripple rounded-full border shadow-xl`}
            style={
              {
                "--i": i,
                width: `${size}px`,
                height: `${size}px`,
                opacity,
                animationDelay,
                borderStyle,
                borderWidth: "1px",
                borderColor: borderColor,
                backgroundColor: `color-mix(in srgb, ${backgroundColor} 25%, transparent)`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) scale(1)",
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
});

Ripple.displayName = "Ripple";
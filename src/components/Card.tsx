import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glow" | "noPad";
  className?: string;
  children?: React.ReactNode;
  key?: string | number;
}

export const Card = ({ variant = "default", className, children, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-card bg-surface border border-border-mid shadow-card overflow-hidden",
        variant === "glow" && "shadow-glow ring-1 ring-brand/20",
        variant !== "noPad" && "p-[20px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

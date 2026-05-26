import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "brand" | "success" | "warn" | "danger" | "purple" | "teal";
  size?: "xs" | "sm" | "md";
  className?: string;
  children?: React.ReactNode;
}

const variantStyles = {
  default: "bg-surface-high text-text-second border-border-mid",
  brand: "bg-brand-faint text-brand border-brand/20",
  success: "bg-success-faint text-success border-success/20",
  warn: "bg-warn-faint text-warn border-warn/20",
  danger: "bg-danger-faint text-danger border-danger/20",
  purple: "bg-purple-faint text-purple border-purple/20",
  teal: "bg-teal-faint text-teal border-teal/20",
};

const sizeStyles = {
  xs: "text-[10px] px-1.5 py-0.5",
  sm: "text-[11px] px-2 py-0.5",
  md: "text-[12px] px-2.5 py-1",
};

export const Badge = ({ variant = "default", size = "sm", className, ...props }: BadgeProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-badge border font-medium",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {props.children}
    </div>
  );
};

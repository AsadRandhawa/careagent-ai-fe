import * as React from "react";
import { cn } from "@/src/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "surface" | "danger" | "success";
  size?: "xs" | "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

const variantStyles = {
  primary: "bg-brand text-white hover:bg-brand-dim active:scale-95 shadow-glow/10",
  ghost: "bg-transparent border border-border-mid text-text-second hover:bg-surface-high hover:text-text-primary",
  surface: "bg-surface border border-border-mid text-text-primary hover:bg-surface-high",
  danger: "bg-danger-faint text-danger border border-danger/20 hover:bg-danger/10",
  success: "bg-success-faint text-success border border-success/20 hover:bg-success/10",
};

const sizeStyles = {
  xs: "h-7 px-2.5 text-[11px]",
  sm: "h-8 px-3 text-[12px]",
  md: "h-10 px-4 text-[13px]",
  lg: "h-12 px-6 text-[14px]",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "surface", size = "md", icon, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-button font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:ring-2 focus:ring-brand/40",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {icon && <span className={cn("inline-flex", children ? "mr-2" : "")}>{icon}</span>}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

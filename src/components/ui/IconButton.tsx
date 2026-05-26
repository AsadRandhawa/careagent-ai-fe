import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const IconButton = ({ active, className, children, ...props }: IconButtonProps) => {
  return (
    <button
      className={cn(
        "flex items-center justify-center rounded-button w-8 h-8 transition-all duration-200 outline-none ",
        active 
          ? "bg-brand-faint border border-brand/30 text-brand" 
          : "bg-transparent text-text-muted hover:bg-surface-high hover:text-text-primary border border-transparent hover:border-border-mid",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

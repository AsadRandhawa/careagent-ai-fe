import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const SectionHeader = ({ title, subtitle, actions, className, ...props }: SectionHeaderProps) => {
  return (
    <div className={cn("flex items-start justify-between mb-section-gap", className)} {...props}>
      <div>
        <h1 className="text-[20px] font-bold text-text-primary tracking-tight">{title}</h1>
        {subtitle && <p className="text-[13px] text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

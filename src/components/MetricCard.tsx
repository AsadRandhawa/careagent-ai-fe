import * as React from "react";
import { Card } from "./Card";
import { cn } from "@/src/lib/utils";

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  subtext?: string;
  delta?: {
    value: string;
    type: "increase" | "decrease";
  };
  icon?: React.ReactNode;
  className?: string;
}

export const MetricCard = ({ label, value, subtext, delta, icon, className, ...props }: MetricCardProps) => {
  return (
    <Card className={cn("h-[90px] flex flex-col justify-between relative", className)} {...props}>
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-medium text-text-muted uppercase tracking-widest">{label}</span>
        {icon && <div className="text-text-muted opacity-60">{icon}</div>}
      </div>
      
      <div className="flex items-end justify-between mt-1">
        <div>
          <div className="text-xl font-mono font-bold text-text-primary leading-none">{value}</div>
          {subtext && <div className="text-[11px] text-text-muted mt-1">{subtext}</div>}
        </div>
        
        {delta && (
          <div className={cn(
            "text-[11px] font-mono flex items-center mb-1",
            delta.type === "increase" ? "text-success" : "text-danger"
          )}>
            {delta.type === "increase" ? "↑" : "↓"} {delta.value}
          </div>
        )}
      </div>
    </Card>
  );
};

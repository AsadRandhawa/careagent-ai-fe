import * as React from "react";
import { Card } from "./Card";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  subtext?: string;
  delta?: { value: string; type: "increase" | "decrease" };
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export const MetricCard = ({ label, value, subtext, delta, icon, loading, className, ...props }: MetricCardProps) => {
  return (
    <Card className={cn("flex flex-col justify-between relative overflow-hidden min-h-[96px]", className)} {...props}>
      <div className="flex justify-between items-start">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">{label}</span>
        {icon && <div className="text-text-muted opacity-50">{icon}</div>}
      </div>

      <div className="flex items-end justify-between mt-3">
        <div>
          {loading ? (
            <div className="flex flex-col gap-1.5">
              <div className="h-8 w-20 bg-surface-high rounded-lg animate-pulse" />
              <div className="h-3 w-20 bg-surface-high rounded animate-pulse opacity-60" />
            </div>
          ) : (
            <>
              <motion.div
                key={String(value)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="text-3xl font-extrabold text-text-primary leading-none tracking-tight"
              >
                {value}
              </motion.div>
              {subtext && <div className="text-xs font-medium text-text-muted mt-1.5 leading-none">{subtext}</div>}
            </>
          )}
        </div>
        {delta && !loading && (
          <div className={cn(
            "text-[11px] font-bold flex items-center gap-1 mb-0.5 px-2 py-1 rounded-md",
            delta.type === "increase" ? "bg-success-faint text-success" : "bg-danger-faint text-danger"
          )}>
            {delta.type === "increase" ? "↑" : "↓"} {delta.value}
          </div>
        )}
      </div>
    </Card>
  );
};

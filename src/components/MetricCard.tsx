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
    <Card className={cn("flex flex-col justify-between relative overflow-hidden min-h-[88px]", className)} {...props}>
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.12em]">{label}</span>
        {icon && <div className="text-text-muted opacity-50">{icon}</div>}
      </div>

      <div className="flex items-end justify-between mt-2">
        <div>
          {loading ? (
            <div className="flex flex-col gap-1.5">
              <div className="h-6 w-16 bg-surface-high rounded-lg animate-pulse" />
              <div className="h-3 w-20 bg-surface-high rounded animate-pulse opacity-60" />
            </div>
          ) : (
            <>
              <motion.div
                key={String(value)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="text-2xl font-black text-text-primary leading-none tracking-tight"
              >
                {value}
              </motion.div>
              {subtext && <div className="text-[11px] text-text-muted mt-1 leading-none">{subtext}</div>}
            </>
          )}
        </div>
        {delta && !loading && (
          <div className={cn(
            "text-[11px] font-black flex items-center gap-0.5 mb-0.5 px-1.5 py-0.5 rounded-full",
            delta.type === "increase" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
          )}>
            {delta.type === "increase" ? "↑" : "↓"} {delta.value}
          </div>
        )}
      </div>
    </Card>
  );
};

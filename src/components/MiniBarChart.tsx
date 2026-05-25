import { cn } from "@/src/lib/utils";

interface BarData {
  label: string;
  value: number;
  highlight?: boolean;
}

interface MiniBarChartProps {
  data: BarData[];
  className?: string;
}

export const MiniBarChart = ({ data, className }: MiniBarChartProps) => {
  const max = Math.max(...data.map(d => d.value));

  return (
    <div className={cn("w-full h-24 flex items-end justify-between px-2 gap-1.5", className)}>
      {data.map((item, i) => {
        const height = max > 0 ? (item.value / max) * 100 : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center group">
            <div 
              className={cn(
                "w-full rounded-t-sm transition-all duration-300",
                item.highlight ? "bg-brand" : "bg-brand-faint group-hover:bg-brand/30"
              )}
              style={{ height: `${height}%` }}
            />
            <span className="text-[9px] font-mono text-text-muted mt-2 uppercase">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};
